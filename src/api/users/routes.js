const express = require('express');
const queries = require('./queries');

const router = express.Router();

// GET /api/v1/users
router.get('/', async (req, res) => {
  const users = await queries.getAll();
  res.json(users);
});

// GET /api/v1/users/:NetID
router.get('/:NetID', async (req, res, next) => {
  const { NetID } = req.params;
  const user = await queries.get(NetID);
  if (user) {
    return res.json(user);
  }
  return next();
});

module.exports = router;
