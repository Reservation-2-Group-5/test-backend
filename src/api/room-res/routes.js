const express = require('express');
const queries = require('./queries');
const roomQueries = require('../rooms/queries');
const userQueries = require('../users/queries');

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

// POST /api/v1/room-res
// for submitting a room reservation
router.post('/', async (req, res, next) => {
  try {
    const roomReservation = await queries.submit(req.body);
    const user = await userQueries.get(req.body.NetID);
    const {
      Building,
      Room,
      Date,
      Time,
    } = req.body;
    // set the corresponding room to unavailable and assign it to the user
    // while the request is pending
    await roomQueries.update(Building, Room, Date, Time, {
      Available: false,
      Reserved_NetID: user.NetID,
      Reserved_Name: user.Name,
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
