// Entry point for the API server
const https = require('https');

// Load environment variables
require('dotenv').config();

// Load the API server
const api = require('./app');

api().then((app) => {
  // Start the API server
  const port = process.env.PORT || 7268;
  app.listen(port, () => {
    // detect if api server is running in https mode
    const isHttps = (app instanceof https.Server);
    // eslint-disable-next-line no-console
    console.log(`Listening: http${(isHttps) ? 's' : ''}://localhost:${port}`);
  });
}).catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
