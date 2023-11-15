const express = require('express');
const queries = require('./queries');

const router = express.Router();

// GET /api/v1/rooms
router.get('/', async (req, res) => {
  const rooms = await queries.getAll();
  res.json(rooms);
});

// GET /api/v1/rooms/:Building/:Room/:Date/:Time
// this is essentially /api/v1/rooms/:id, but the id is a composite key
router.get('/:Building/:Room/:Date/:Time', async (req, res, next) => {
  const {
    Building,
    RoomNumber,
    Date,
    Time,
  } = req.params;
  const room = await queries.get(Building, RoomNumber, Date, Time);
  if (room) {
    return res.json(room);
  }
  return next();
});

// just in case the request is missing particular parameters
// then we can return the rooms that match the parameters that are present

router.get('/:Building/:RoomNumber/:Date', async (req, res, next) => {
  const {
    Building,
    RoomNumber,
    Date,
  } = req.params;
  const rooms = await queries.find({ Building, RoomNumber, Date });
  if (rooms) {
    return res.json(rooms);
  }
  return next();
});

router.get('/:Building/:RoomNumber', async (req, res, next) => {
  const {
    Building,
    RoomNumber,
  } = req.params;
  const rooms = await queries.find({ Building, RoomNumber });
  if (rooms) {
    return res.json(rooms);
  }
  return next();
});

router.get('/:Building', async (req, res, next) => {
  const {
    Building,
  } = req.params;
  const rooms = await queries.find({ Building });
  if (rooms) {
    return res.json(rooms);
  }
  return next();
});

module.exports = router;
