// Entry point for the API server
const https = require('https');

// Load environment variables
require('dotenv').config();

// Load the API server
const api = require('./app');

// Start the API server
const port = process.env.PORT || 7268;
api.listen(port, () => {
  // detect if api server is running in https mode
  const isHttps = (api instanceof https.Server);
  // eslint-disable-next-line no-console
  console.log(`Listening: http${(isHttps) ? 's' : ''}://localhost:${port}`);
});
