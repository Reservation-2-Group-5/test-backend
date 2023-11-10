const express = require('express');
const queries = require('./queries');

const router = express.Router();

// /api/v1/devices
router.get('/', async (req, res, next) => {
  try {
    const devices = await queries.getAll();
    res.json(devices);
  } catch (err) {
    next(err);
  }
});

// /api/v1/devices/:tag
// for updating a device's properties, namely Available
router.patch('/:tag', async (req, res, next) => {
  try {
    const { tag } = req.params;
    const { propertyToUpdate } = req.body;
    const updatedEntry = await queries.update(tag, propertyToUpdate);
    res.json(updatedEntry);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
