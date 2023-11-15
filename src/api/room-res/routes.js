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

/**
 * Checks if all required fields are present in the request body.
 * @param {Object|Array} body - The request body to check.
 * @param {Array} requiredFields - An array of required field names.
 * @returns {boolean} - Returns true if all required fields are present, false otherwise.
 */
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
      'RoomNumber',
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
    const requiredFields = [
      'Building',
      'RoomNumber',
      'Date',
      'Time',
      'status',
    ];
    if (!checkFieldsInPost(req.body, requiredFields)) {
      res.status(400);
      const error = new Error(`Missing required fields. Please include: ${requiredFields.join(', ')}`);
      next(error);
      return;
    }

    let room_res;
    if (Array.isArray(req.body)) {
      room_res = req.body.map((obj) => requiredFields.reduce((acc, field) => {
        acc[field] = obj[field];
        return acc;
      }, {}));
    } else {
      room_res = requiredFields.reduce((acc, field) => {
        acc[field] = req.body[field];
        return acc;
      }, {});
    }

    const reservations = await queries.get(room_res);
    // if the reservation doesn't exist, return an error
    if (!reservations) {
      res.status(404);
      const error = new Error('Reservation not found.');
      next(error);
      return;
    }

    // if the reservation exists, update it with the new status
    const ids = reservations.map((obj) => obj.id);
    if (req.body[0].status === 'approved') { // status will be the same on all objects in the array
      if (!req.body[0].NetID || !req.body[0].Name) {
        res.status(400);
        const error = new Error('NetID and Name are required when approving a reservation.');
        next(error);
        return;
      }
      // instead of deleting, there could be a Status column that gets updated
      await queries.delete(ids);
      await roomQueries.update(reservations, {
        Available: false,
        Reserved_NetID: req.body[0].NetID,
        Reserved_Name: req.body[0].Name,
      });
    } else if (req.body[0].status === 'denied') {
      await queries.delete(ids);
      await roomQueries.update(reservations, {
        Available: true,
        Reserved_NetID: null,
        Reserved_Name: null,
      });
    } else {
      res.status(400);
      const error = new Error('Invalid status.');
      next(error);
      return;
    }

    res.json({ message: 'Reservation processed successfully.' });
    console.log('Reservation processed successfully.');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
