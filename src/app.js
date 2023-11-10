const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const https = require('https');

// Load middlewares and API routes
const middlewares = require('./middlewares');
const api = require('./api');
const httpsOptions = require('./https');

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
const server = https.createServer(httpsOptions, app);

module.exports = server;
