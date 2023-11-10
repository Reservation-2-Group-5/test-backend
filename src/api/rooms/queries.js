const db = require('../../db');
const tableNames = require('../../constants/tableNames');

module.exports = {
  getAll() {
    return db(tableNames.Room);
  },
  get(Building, Room, Date, Time) {
    return db(tableNames.Room)
      .where({
        Building,
        Room,
        Date,
        Time,
      });
  },
  update(Building, Room, Date, Time, properties) {
    return db(tableNames.Room)
      .where({
        Building,
        Room,
        Date,
        Time,
      })
      .update(properties)
      .returning('*');
  },
  // find is only used if the request is missing particular parameters
  find(params) {
    const {
      Building,
      Room,
      Date,
      Time,
    } = params;
    if (Time && Date && Room && Building) {
      return db(tableNames.Room)
        .where({
          Building,
          Room,
          Date,
          Time,
        });
    }
    if (Date && Room && Building) {
      return db(tableNames.Room)
        .where({
          Building,
          Room,
          Date,
        });
    }
    if (Room && Building) {
      return db(tableNames.Room)
        .where({
          Building,
          Room,
        });
    }
    if (Building) {
      return db(tableNames.Room)
        .where({
          Building,
        });
    }
    return db(tableNames.Room);
  },
};
