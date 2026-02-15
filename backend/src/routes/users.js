const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const prisma = require('../config/db');

router.get('/me', authenticate, async (req, res) => {
  res.json(req.user);
});

router.put('/me', authenticate, async (req, res, next) => {
  try {
    const { fullName, companyName } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { fullName, companyName },
      select: {
        id: true,
        email: true,
        fullName: true,
        companyName: true,
        subscriptionTier: true,
        emailVerified: true,
      },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.get('/usage-stats', authenticate, async (req, res, next) => {
  try {
    const [folders, tables, jobs, subscription] = await Promise.all([
      prisma.folder.count({ where: { userId: req.user.id, isArchived: false } }),
      prisma.table.count({ where: { userId: req.user.id } }),
      prisma.job.count({ where: { userId: req.user.id } }),
      prisma.subscription.findFirst({ where: { userId: req.user.id, status: 'active' } }),
    ]);

    res.json({
      folders,
      tables,
      jobs,
      subscription: subscription
        ? {
            plan: subscription.planName,
            maxFolders: subscription.maxFolders,
            maxTables: subscription.maxTables,
            maxJobsPerMonth: subscription.maxJobsPerMonth,
            jobsFetchedThisMonth: subscription.jobsFetchedThisMonth,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
