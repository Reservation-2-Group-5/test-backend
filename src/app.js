const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const https = require('https');

// Load middlewares and API routes
const middlewares = require('./middlewares');
const api = require('./api');
const getHttpsConfig = require('./https');

// create express app
const app = express();

// use middlewares
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

// define routes
app.get('/', (req, res) => {
  res.json({
    message: '🏠 Home',
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: '🔥 API',
  });
});

app.use('/api/v1', api);

// error handling
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

// https server
module.exports = async () => {
  const httpsOptions = await getHttpsConfig();
  if (httpsOptions.key && httpsOptions.cert) {
    return https.createServer(httpsOptions, app);
  }
  return app;
};
