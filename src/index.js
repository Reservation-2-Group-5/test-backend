// Entry point for the API server

// Load environment variables
require('dotenv').config();

// Load the API server
const api = require('./app');

// Start the API server
const port = process.env.PORT || 7268;
api.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening: https://localhost:${port}`);
});
