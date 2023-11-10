const db = require('../../db');
const tableNames = require('../../constants/tableNames');

module.exports = {
  getAll() {
    return db(tableNames.Device);
  },
  update(tag, properties) {
    return db(tableNames.Device)
      .where({ Tag: tag })
      .update(properties)
      .returning('*');
  },
};
