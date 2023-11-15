const express = require('express');
const queries = require('./queries');
const deviceQueries = require('../devices/queries');

const router = express.Router();

// GET /api/v1/device-res
router.get('/', async (req, res, next) => {
  try {
    // if a Status column is added, then this query will need to be updated
    // to only get reservations with a Status of 'pending'
    const deviceReservations = await queries.getAll();
    res.json(deviceReservations);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/device-res
// for submitting a device reservation
router.post('/', async (req, res, next) => {
  try {
    // if any required fields are missing from req.body, return an error
    const requiredFields = [
      'Tag',
      'NetID',
      'Start_Date',
      'End_Date',
    ];
    if (!requiredFields.every((field) => field in req.body)) {
      res.status(400);
      const error = new Error(`Missing required fields. Please include: ${requiredFields.join(', ')}`);
      next(error);
      return;
    }

    // only submit the required fields
    const date = new Date();
    date.setHours(0, 0, 0, 0); // clear the time portion of the date

    const device_res = requiredFields.reduce((obj, field, i) => {
      if (i === 0) {
        obj.Request_Date = date;
      }
      obj[field] = req.body[field];
      return obj;
    }, {});

    const deviceReservation = await queries.submit(device_res);
    // set the corresponding device to unavailable with no assignment
    // while the request is pending - assignment is done when request is approved
    await deviceQueries.update(req.body.Tag, {
      Available: false,
      Reserved_NetID: null,
      Assigned_To: null,
    });
    res.json(deviceReservation);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/room-res/:id
// for approving or denying a room reservation
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      status,
      NetID,
      Name,
    } = req.body;
    const reservation = await queries.get(id);
    // if the reservation doesn't exist, return an error
    if (!reservation) {
      res.status(404);
      const error = new Error('Reservation not found.');
      next(error);
      return;
    }

    // if the reservation exists, update it with the new status
    if (status === 'approved') {
      if (!NetID || !Name) {
        res.status(400);
        const error = new Error('NetID and Name are required when approving a reservation.');
        next(error);
        return;
      }
      // instead of deleting, there could be a Status column that gets updated
      await queries.delete(id);
      await deviceQueries.update(reservation.Tag, {
        Available: false,
        Start_Date: reservation.Start_Date,
        End_Date: reservation.End_Date,
        Reserved_NetID: NetID,
        Assigned_To: Name,
      });
    } else if (status === 'denied') {
      await queries.delete(id);
      await deviceQueries.update(reservation.Tag, {
        Available: true,
        Start_Date: null,
        End_Date: null,
        Reserved_NetID: null,
        Assigned_To: null,
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
