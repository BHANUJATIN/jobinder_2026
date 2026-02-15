const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const folderService = require('../services/folderService');
const { folderSchema } = require('../utils/validators');

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const folders = await folderService.getFolders(req.user.id);
    res.json(folders);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const folder = await folderService.getFolder(req.params.id, req.user.id);
    res.json(folder);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = folderSchema.parse(req.body);
    const folder = await folderService.createFolder(req.user.id, data);
    res.status(201).json(folder);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const data = folderSchema.parse(req.body);
    const folder = await folderService.updateFolder(req.params.id, req.user.id, data);
    res.json(folder);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await folderService.deleteFolder(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/reorder', async (req, res, next) => {
  try {
    const { folderIds } = req.body;
    const result = await folderService.reorderFolders(req.user.id, folderIds);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
