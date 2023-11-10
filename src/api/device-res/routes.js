const express = require('express');
const queries = require('./queries');
const deviceQueries = require('../devices/queries');
const userQueries = require('../users/queries');

const router = express.Router();

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

router.post('/', async (req, res, next) => {
  try {
    const deviceReservation = await queries.submit(req.body);
    const user = await userQueries.get(req.body.NetID);
    // set the corresponding device to unavailable and assign it to the user
    // while the request is pending
    await deviceQueries.update(req.body.Tag, {
      Available: false,
      Reserved_NetID: user.NetID,
      Assigned_To: user.Name,
    });
    res.json(deviceReservation);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const reservation = await queries.get(id);

    if (status === 'approved') {
      // instead of deleting, there could be a Status column that gets updated
      await queries.delete(id);
    } else if (status === 'denied') {
      await queries.delete(id);
      await deviceQueries.update(reservation.Tag, {
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
