const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const tableService = require('../services/tableService');
const { jobFetchQueue } = require('../services/schedulerService');
const { tableSchema, searchConfigSchema } = require('../utils/validators');

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const tables = await tableService.getTables(req.user.id, req.query.folderId);
    res.json(tables);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const table = await tableService.getTable(req.params.id, req.user.id);
    res.json(table);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { searchConfig: searchConfigData, ...tableData } = req.body;
    const validatedTable = tableSchema.parse(tableData);
    const validatedConfig = searchConfigData ? searchConfigSchema.parse(searchConfigData) : null;
    const table = await tableService.createTable(req.user.id, validatedTable, validatedConfig);
    res.status(201).json(table);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const table = await tableService.updateTable(req.params.id, req.user.id, req.body);
    res.json(table);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await tableService.deleteTable(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/run-now', async (req, res, next) => {
  try {
    const table = await tableService.getTable(req.params.id, req.user.id);
    await jobFetchQueue.add('fetch', { tableId: table.id }, {
      removeOnComplete: true,
      removeOnFail: 100,
    });
    res.json({ message: 'Job fetch queued' });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/config', async (req, res, next) => {
  try {
    const table = await tableService.getTable(req.params.id, req.user.id);
    res.json(table.searchConfig);
  } catch (err) {
    next(err);
  }
});

router.put('/:id/config', async (req, res, next) => {
  try {
    const data = searchConfigSchema.parse(req.body);
    const config = await tableService.updateSearchConfig(req.params.id, req.user.id, data);
    res.json(config);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/schedule-logs', async (req, res, next) => {
  try {
    const logs = await tableService.getScheduleLogs(req.params.id, req.user.id);
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
