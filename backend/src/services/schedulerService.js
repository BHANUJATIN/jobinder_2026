const { Queue, Worker } = require('bullmq');
const redis = require('../config/redis');
const prisma = require('../config/db');
const { scrapeLinkedIn, scrapeIndeed, deduplicateJobs } = require('./scraperService');
const { filterJobs } = require('./aiFilterService');
const { calculateNextRun } = require('./tableService');

const jobFetchQueue = new Queue('job-fetch', { connection: redis });
const cleanupQueue = new Queue('cleanup', { connection: redis });

async function processJobFetch(job) {
  const { tableId } = job.data;

  const table = await prisma.table.findUnique({
    where: { id: tableId },
    include: { searchConfig: true },
  });

  if (!table || !table.isActive || !table.searchConfig) return;

  const log = await prisma.scheduleLog.create({
    data: {
      tableId,
      userId: table.userId,
      startedAt: new Date(),
      status: 'running',
    },
  });

  try {
    const config = table.searchConfig;
    let allJobs = [];

    // Scrape from enabled sources
    if (config.includeLinkedin) {
      const linkedinJobs = await scrapeLinkedIn(config.jobKeywords, config.jobLocation);
      allJobs.push(...linkedinJobs);
      await prisma.scheduleLog.update({
        where: { id: log.id },
        data: { jobsFetchedLinkedin: linkedinJobs.length },
      });
    }

    if (config.includeIndeed) {
      const indeedJobs = await scrapeIndeed(config.jobKeywords, config.jobLocation);
      allJobs.push(...indeedJobs);
      await prisma.scheduleLog.update({
        where: { id: log.id },
        data: { jobsFetchedIndeed: indeedJobs.length },
      });
    }

    // Deduplicate
    const uniqueJobs = deduplicateJobs(allJobs);
    const duplicateCount = allJobs.length - uniqueJobs.length;

    // AI Filter
    const filteredJobs = await filterJobs(uniqueJobs, config.aiFilterInstructions);
    const passedJobs = filteredJobs.filter((j) => j.aiFilterPassed);
    const filteredOutCount = filteredJobs.length - passedJobs.length;

    // Insert jobs (skip existing)
    let addedCount = 0;
    for (const jobData of passedJobs) {
      try {
        await prisma.job.create({
          data: {
            tableId,
            userId: table.userId,
            ...jobData,
          },
        });
        addedCount++;
      } catch (err) {
        if (err.code === 'P2002') {
          // Duplicate in DB
        } else {
          console.error('Insert job error:', err.message);
        }
      }
    }

    // Update table stats
    const nextRun = calculateNextRun(
      table.scheduleFrequency,
      table.scheduleTime,
      table.scheduleDayOfWeek,
      table.scheduleDayOfMonth
    );

    await prisma.table.update({
      where: { id: tableId },
      data: {
        lastRunAt: new Date(),
        nextRunAt: nextRun,
        totalJobsFetched: { increment: addedCount },
      },
    });

    // Update log
    await prisma.scheduleLog.update({
      where: { id: log.id },
      data: {
        completedAt: new Date(),
        status: 'completed',
        jobsAdded: addedCount,
        jobsFilteredOut: filteredOutCount,
        jobsDuplicates: duplicateCount,
      },
    });

    console.log(`Table ${tableId}: fetched ${allJobs.length}, added ${addedCount}`);
  } catch (err) {
    await prisma.scheduleLog.update({
      where: { id: log.id },
      data: { completedAt: new Date(), status: 'failed', errorMessage: err.message },
    });
    console.error(`Job fetch failed for table ${tableId}:`, err.message);
  }
}

async function processCleanup() {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const result = await prisma.job.deleteMany({
    where: { createdAt: { lt: threeMonthsAgo } },
  });

  console.log(`Cleanup: removed ${result.count} old jobs`);
}

function initScheduler() {
  // Job fetch worker
  new Worker('job-fetch', processJobFetch, {
    connection: redis,
    concurrency: 3,
  });

  // Cleanup worker
  new Worker('cleanup', processCleanup, { connection: redis });

  // Check for due tables every minute
  setInterval(async () => {
    try {
      const dueTables = await prisma.table.findMany({
        where: {
          isActive: true,
          nextRunAt: { lte: new Date() },
        },
        select: { id: true },
      });

      for (const table of dueTables) {
        await jobFetchQueue.add('fetch', { tableId: table.id }, {
          jobId: `fetch-${table.id}`,
          removeOnComplete: true,
          removeOnFail: 100,
        });
      }
    } catch (err) {
      console.error('Scheduler check error:', err.message);
    }
  }, 60000);

  // Daily cleanup at midnight
  cleanupQueue.add('cleanup', {}, {
    repeat: { pattern: '0 0 * * *' },
    removeOnComplete: true,
  });

  console.log('Scheduler initialized');
}

module.exports = { initScheduler, jobFetchQueue };
