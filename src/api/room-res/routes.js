const express = require('express');
const queries = require('./queries');
const roomQueries = require('../rooms/queries');

const router = express.Router();

// GET /api/v1/room-res
router.get('/', async (req, res, next) => {
  try {
    // if a Status column is added, then this query will need to be updated
    // to only get reservations with a Status of 'pending'
    const roomReservations = await queries.getAll();
    res.json(roomReservations);
  } catch (err) {
    next(err);
  }
});

function checkFieldsInPost(body, requiredFields) {
  if (Array.isArray(body)) {
    for (const obj of body) {
      if (!requiredFields.every((field) => field in obj)) {
        return false;
      }
    }
    return true;
  }
  if (!requiredFields.every((field) => field in body)) {
    return false;
  }
  return true;
}

// POST /api/v1/room-res
// for submitting a room reservation
router.post('/', async (req, res, next) => {
  try {
    // if any required fields are missing from req.body, return an error
    const requiredFields = [
      'Building',
      'Room',
      'Date',
      'Time',
      'NetID',
    ];
    if (!checkFieldsInPost(req.body, requiredFields)) {
      res.status(400);
      const error = new Error(`Missing required fields. Please include: ${requiredFields.join(', ')}`);
      next(error);
      return;
    }

    // only submit the required fields
    const date = new Date();
    date.setHours(0, 0, 0, 0); // clear the time portion of the date

    let room_res;
    if (Array.isArray(req.body)) {
      room_res = req.body.map((obj) => requiredFields.reduce((acc, field, i) => {
        if (i === 0) {
          acc.Request_Date = date.getTime();
        }
        acc[field] = obj[field];
        return acc;
      }, {}));
    } else {
      room_res = requiredFields.reduce((acc, field, i) => {
        if (i === 0) {
          acc.Request_Date = date.getTime();
        }
        acc[field] = req.body[field];
        return acc;
      }, {});
    }

    const roomReservation = await queries.submit(room_res);
    // set the corresponding room slots to unavailable with no assignment
    // while the request is pending - assignment is done when request is approved
    await roomQueries.update(room_res, {
      Available: false,
      Reserved_NetID: null,
      Reserved_Name: null,
    });
    res.json(roomReservation);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/room-res/:id
// for approving or denying a room reservation
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const reservation = await queries.get(id);

    if (status === 'approved') {
      // instead of deleting, there could be a Status column that gets updated to keep old entries
      await queries.delete(id);
    } else if (status === 'denied') {
      await queries.delete(id);
      const {
        Building,
        Room,
        Date,
        Time,
      } = reservation;
      await roomQueries.update(Building, Room, Date, Time, {
        Available: true,
        Reserved_NetID: null,
        Assigned_To: null,
      });
    }

    res.json({ message: 'Reservation processed successfully.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
