const { ApifyClient } = require('apify-client');
const env = require('../config/env');
const { generateJobHash } = require('../utils/hash');

const apify = new ApifyClient({ token: env.apify.token });

function normalizeLinkedinJob(raw) {
  return {
    jobTitle: raw.title || raw.jobTitle || '',
    jobUrl: raw.url || raw.jobUrl || '',
    jobDescription: raw.description || raw.jobDescription || '',
    companyName: raw.company || raw.companyName || '',
    companyLinkedinUrl: raw.companyUrl || raw.companyLinkedinUrl || null,
    location: raw.location || raw.jobLocation || '',
    salaryRange: raw.salary || raw.salaryRange || null,
    jobType: raw.employmentType || raw.jobType || null,
    source: 'linkedin',
    externalId: raw.id || raw.jobId || null,
    postedDate: raw.postedDate || raw.datePosted ? new Date(raw.postedDate || raw.datePosted) : null,
  };
}

function normalizeIndeedJob(raw) {
  return {
    jobTitle: raw.positionName || raw.title || '',
    jobUrl: raw.url || raw.jobUrl || '',
    jobDescription: raw.description || '',
    companyName: raw.company || raw.companyName || '',
    companyLinkedinUrl: null,
    location: raw.location || '',
    salaryRange: raw.salary || null,
    jobType: raw.jobType || null,
    source: 'indeed',
    externalId: raw.id || raw.externalId || null,
    postedDate: raw.postedAt ? new Date(raw.postedAt) : null,
  };
}

async function scrapeLinkedIn(keywords, location, maxItems = 100) {
  try {
    const input = {
      searchUrl: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}`,
      maxItems,
      proxy: { useApifyProxy: true },
    };

    const run = await apify.actor('apify/linkedin-jobs-scraper').call(input);
    const { items } = await apify.dataset(run.defaultDatasetId).listItems();

    return items.map(normalizeLinkedinJob);
  } catch (err) {
    console.error('LinkedIn scrape error:', err.message);
    return [];
  }
}

async function scrapeIndeed(keywords, location, maxItems = 100) {
  try {
    const input = {
      queries: keywords,
      location,
      maxItems,
      proxy: { useApifyProxy: true },
    };

    const run = await apify.actor('apify/indeed-scraper').call(input);
    const { items } = await apify.dataset(run.defaultDatasetId).listItems();

    return items.map(normalizeIndeedJob);
  } catch (err) {
    console.error('Indeed scrape error:', err.message);
    return [];
  }
}

function deduplicateJobs(jobs) {
  const seen = new Set();
  return jobs.filter((job) => {
    const hash = generateJobHash(job.jobTitle, job.companyName, job.location);
    job.jobHash = hash;
    if (seen.has(hash)) return false;
    seen.add(hash);
    return true;
  });
}

module.exports = { scrapeLinkedIn, scrapeIndeed, deduplicateJobs };
