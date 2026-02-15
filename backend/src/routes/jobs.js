const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const jobService = require('../services/jobService');
const { jobStatusSchema } = require('../utils/validators');

router.use(authenticate);

router.get('/table/:tableId', async (req, res, next) => {
  try {
    const result = await jobService.getJobs(req.params.tableId, req.user.id, req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/export/:tableId', async (req, res, next) => {
  try {
    const jobs = await jobService.exportJobs(req.params.tableId, req.user.id);

    if (req.query.format === 'csv') {
      const headers = ['Job Title', 'Company', 'Location', 'Salary', 'Type', 'Source', 'URL', 'Posted Date', 'Status'];
      const csv = [
        headers.join(','),
        ...jobs.map((j) =>
          [j.jobTitle, j.companyName, j.location, j.salaryRange, j.jobType, j.source, j.jobUrl, j.postedDate, j.status]
            .map((v) => `"${(v || '').toString().replace(/"/g, '""')}"`)
            .join(',')
        ),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=jobs-export.csv');
      return res.send(csv);
    }

    res.json(jobs);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const job = await jobService.getJob(req.params.id, req.user.id);
    res.json(job);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const job = await jobService.updateJob(req.params.id, req.user.id, req.body);
    res.json(job);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await jobService.deleteJob(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/mark-status', async (req, res, next) => {
  try {
    const { status } = jobStatusSchema.parse(req.body);
    const job = await jobService.markJobStatus(req.params.id, req.user.id, status);
    res.json(job);
  } catch (err) {
    next(err);
  }
});

router.post('/bulk-update', async (req, res, next) => {
  try {
    const { jobIds, data } = req.body;
    const result = await jobService.bulkUpdateJobs(req.user.id, jobIds, data);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
