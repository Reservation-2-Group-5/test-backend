const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// /api/v1
router.get('/', (req, res) => {
  res.json({
    message: '🔥 API v1',
  });
});

// dynamically load 'routes.js' from each subfolder
async function loadRoutes() {
  const routesDir = path.join(__dirname);
  const files = await fs.readdir(routesDir);
  for (const file of files) {
    const filePath = path.join(routesDir, file);
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      const routeFile = path.join(filePath, 'routes.js');
      try {
        // eslint-disable-next-line import/no-dynamic-require, global-require
        const route = require(routeFile);
        router.use(`/${file}`, route);
      } catch (err) {
        console.error(`Error loading routes from ${routeFile}: ${err}`);
      }
    }
  }
}

loadRoutes();

module.exports = router;
