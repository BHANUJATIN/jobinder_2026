const prisma = require('../config/db');

async function getFolders(userId) {
  return prisma.folder.findMany({
    where: { userId, isArchived: false },
    include: { _count: { select: { tables: true } } },
    orderBy: { position: 'asc' },
  });
}

async function getFolder(id, userId) {
  const folder = await prisma.folder.findFirst({
    where: { id, userId },
    include: {
      tables: {
        include: { _count: { select: { jobs: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!folder) {
    const err = new Error('Folder not found');
    err.status = 404;
    throw err;
  }

  return folder;
}

async function createFolder(userId, data) {
  const count = await prisma.folder.count({ where: { userId, isArchived: false } });

  const sub = await prisma.subscription.findFirst({
    where: { userId, status: 'active' },
  });

  if (sub && sub.maxFolders && count >= sub.maxFolders) {
    const err = new Error('Folder limit reached. Upgrade your plan.');
    err.status = 403;
    throw err;
  }

  return prisma.folder.create({
    data: { ...data, userId, position: count },
  });
}

async function updateFolder(id, userId, data) {
  const folder = await prisma.folder.findFirst({ where: { id, userId } });
  if (!folder) {
    const err = new Error('Folder not found');
    err.status = 404;
    throw err;
  }

  return prisma.folder.update({ where: { id }, data });
}

async function deleteFolder(id, userId) {
  const folder = await prisma.folder.findFirst({ where: { id, userId } });
  if (!folder) {
    const err = new Error('Folder not found');
    err.status = 404;
    throw err;
  }

  await prisma.folder.delete({ where: { id } });
  return { message: 'Folder deleted' };
}

async function reorderFolders(userId, folderIds) {
  const updates = folderIds.map((id, index) =>
    prisma.folder.updateMany({
      where: { id, userId },
      data: { position: index },
    })
  );
  await prisma.$transaction(updates);
  return { message: 'Folders reordered' };
}

module.exports = { getFolders, getFolder, createFolder, updateFolder, deleteFolder, reorderFolders };
