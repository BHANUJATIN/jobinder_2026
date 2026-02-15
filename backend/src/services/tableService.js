const prisma = require('../config/db');

function calculateNextRun(frequency, time, dayOfWeek, dayOfMonth) {
  const now = new Date();
  const [hours, minutes] = (time || '09:00').split(':').map(Number);
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);

  if (frequency === 'daily') {
    if (next <= now) next.setDate(next.getDate() + 1);
  } else if (frequency === 'weekly') {
    const day = dayOfWeek || 1; // Monday
    const diff = (day - now.getDay() + 7) % 7;
    next.setDate(now.getDate() + (diff === 0 && next <= now ? 7 : diff));
  } else if (frequency === 'monthly') {
    const day = dayOfMonth || 1;
    next.setDate(day);
    if (next <= now) next.setMonth(next.getMonth() + 1);
  }

  return next;
}

async function getTables(userId, folderId) {
  const where = { userId };
  if (folderId) where.folderId = folderId;

  return prisma.table.findMany({
    where,
    include: {
      searchConfig: true,
      _count: { select: { jobs: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function getTable(id, userId) {
  const table = await prisma.table.findFirst({
    where: { id, userId },
    include: {
      searchConfig: true,
      folder: { select: { id: true, name: true } },
      _count: { select: { jobs: true } },
    },
  });

  if (!table) {
    const err = new Error('Table not found');
    err.status = 404;
    throw err;
  }
  return table;
}

async function createTable(userId, data, searchConfig) {
  const folder = await prisma.folder.findFirst({
    where: { id: data.folderId, userId },
  });
  if (!folder) {
    const err = new Error('Folder not found');
    err.status = 404;
    throw err;
  }

  const sub = await prisma.subscription.findFirst({
    where: { userId, status: 'active' },
  });

  const tableCount = await prisma.table.count({ where: { userId } });
  if (sub && sub.maxTables && tableCount >= sub.maxTables) {
    const err = new Error('Table limit reached. Upgrade your plan.');
    err.status = 403;
    throw err;
  }

  const nextRunAt = calculateNextRun(
    data.scheduleFrequency,
    data.scheduleTime,
    data.scheduleDayOfWeek,
    data.scheduleDayOfMonth
  );

  const table = await prisma.table.create({
    data: {
      userId,
      folderId: data.folderId,
      name: data.name,
      description: data.description,
      scheduleFrequency: data.scheduleFrequency,
      scheduleTime: data.scheduleTime,
      scheduleDayOfWeek: data.scheduleDayOfWeek,
      scheduleDayOfMonth: data.scheduleDayOfMonth,
      nextRunAt,
      searchConfig: searchConfig
        ? { create: searchConfig }
        : undefined,
    },
    include: { searchConfig: true },
  });

  return table;
}

async function updateTable(id, userId, data) {
  const table = await prisma.table.findFirst({ where: { id, userId } });
  if (!table) {
    const err = new Error('Table not found');
    err.status = 404;
    throw err;
  }

  const updateData = { ...data };
  if (data.scheduleFrequency || data.scheduleTime) {
    updateData.nextRunAt = calculateNextRun(
      data.scheduleFrequency || table.scheduleFrequency,
      data.scheduleTime || table.scheduleTime,
      data.scheduleDayOfWeek ?? table.scheduleDayOfWeek,
      data.scheduleDayOfMonth ?? table.scheduleDayOfMonth
    );
  }

  return prisma.table.update({
    where: { id },
    data: updateData,
    include: { searchConfig: true },
  });
}

async function deleteTable(id, userId) {
  const table = await prisma.table.findFirst({ where: { id, userId } });
  if (!table) {
    const err = new Error('Table not found');
    err.status = 404;
    throw err;
  }

  await prisma.table.delete({ where: { id } });
  return { message: 'Table deleted' };
}

async function updateSearchConfig(tableId, userId, data) {
  const table = await prisma.table.findFirst({ where: { id: tableId, userId } });
  if (!table) {
    const err = new Error('Table not found');
    err.status = 404;
    throw err;
  }

  return prisma.searchConfig.upsert({
    where: { tableId },
    update: data,
    create: { ...data, tableId },
  });
}

async function getScheduleLogs(tableId, userId, limit = 20) {
  const table = await prisma.table.findFirst({ where: { id: tableId, userId } });
  if (!table) {
    const err = new Error('Table not found');
    err.status = 404;
    throw err;
  }

  return prisma.scheduleLog.findMany({
    where: { tableId },
    orderBy: { startedAt: 'desc' },
    take: limit,
  });
}

module.exports = {
  getTables,
  getTable,
  createTable,
  updateTable,
  deleteTable,
  updateSearchConfig,
  getScheduleLogs,
  calculateNextRun,
};
