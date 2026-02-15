const prisma = require('../config/db');

async function getJobs(tableId, userId, query = {}) {
  const table = await prisma.table.findFirst({ where: { id: tableId, userId } });
  if (!table) {
    const err = new Error('Table not found');
    err.status = 404;
    throw err;
  }

  const where = { tableId };

  if (query.status) where.status = query.status;
  if (query.source) where.source = query.source;
  if (query.search) {
    where.OR = [
      { jobTitle: { contains: query.search, mode: 'insensitive' } },
      { companyName: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  if (query.dateFrom) where.createdAt = { ...where.createdAt, gte: new Date(query.dateFrom) };
  if (query.dateTo) where.createdAt = { ...where.createdAt, lte: new Date(query.dateTo) };

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 50;
  const skip = (page - 1) * limit;

  const sortField = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder || 'desc';

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.job.count({ where }),
  ]);

  return {
    jobs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getJob(id, userId) {
  const job = await prisma.job.findFirst({ where: { id, userId } });
  if (!job) {
    const err = new Error('Job not found');
    err.status = 404;
    throw err;
  }
  return job;
}

async function updateJob(id, userId, data) {
  const job = await prisma.job.findFirst({ where: { id, userId } });
  if (!job) {
    const err = new Error('Job not found');
    err.status = 404;
    throw err;
  }

  return prisma.job.update({ where: { id }, data });
}

async function markJobStatus(id, userId, status) {
  const job = await prisma.job.findFirst({ where: { id, userId } });
  if (!job) {
    const err = new Error('Job not found');
    err.status = 404;
    throw err;
  }

  return prisma.job.update({
    where: { id },
    data: { status, markedAt: new Date() },
  });
}

async function bulkUpdateJobs(userId, jobIds, data) {
  await prisma.job.updateMany({
    where: { id: { in: jobIds }, userId },
    data: { ...data, updatedAt: new Date() },
  });
  return { message: `Updated ${jobIds.length} jobs` };
}

async function deleteJob(id, userId) {
  const job = await prisma.job.findFirst({ where: { id, userId } });
  if (!job) {
    const err = new Error('Job not found');
    err.status = 404;
    throw err;
  }

  await prisma.job.delete({ where: { id } });
  return { message: 'Job deleted' };
}

async function exportJobs(tableId, userId) {
  const table = await prisma.table.findFirst({ where: { id: tableId, userId } });
  if (!table) {
    const err = new Error('Table not found');
    err.status = 404;
    throw err;
  }

  return prisma.job.findMany({
    where: { tableId },
    orderBy: { createdAt: 'desc' },
    select: {
      jobTitle: true,
      companyName: true,
      location: true,
      salaryRange: true,
      jobType: true,
      source: true,
      jobUrl: true,
      postedDate: true,
      status: true,
      aiFilterPassed: true,
      aiFilterReason: true,
      createdAt: true,
    },
  });
}

module.exports = { getJobs, getJob, updateJob, markJobStatus, bulkUpdateJobs, deleteJob, exportJobs };
