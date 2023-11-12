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
  async update(room_res, properties) {
    // if room_res is an array, then it is a list of room reservations
    if (Array.isArray(room_res)) {
      return db(tableNames.Room)
        .whereIn(
          ['Building', 'Room', 'Date', 'Time'],
          room_res.map((obj) => [
            obj.Building,
            obj.Room,
            (new Date(obj.Date)).getTime(),
            obj.Time,
          ]),
        )
        .update(properties)
        .returning('*');
    }
    if (typeof room_res === 'object') {
      console.log('object', room_res);
      return db(tableNames.Room)
        .where({
          Building: room_res.Building,
          Room: room_res.Room,
          Date: room_res.Date,
          Time: room_res.Time,
        })
        .update(properties)
        .returning('*');
    }
    return null;
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
