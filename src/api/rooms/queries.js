const db = require('../../db');
const tableNames = require('../../constants/tableNames');

module.exports = {
  getAll() {
    return db(tableNames.Room);
  },
  get(Building, RoomNumber, Date, Time) {
    return db(tableNames.Room)
      .where({
        Building,
        RoomNumber,
        Date,
        Time,
      });
  },
  async update(room_res, properties) {
    // if room_res is an array, then it is a list of room reservations
    if (Array.isArray(room_res)) {
      return db(tableNames.Room)
        .whereIn(
          ['Building', 'RoomNumber', 'Date', 'Time'],
          room_res.map((obj) => [
            obj.Building,
            obj.RoomNumber,
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
          RoomNumber: room_res.RoomNumber,
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
      RoomNumber,
      Date,
      Time,
    } = params;
    if (Time && Date && RoomNumber && Building) {
      return db(tableNames.Room)
        .where({
          Building,
          RoomNumber,
          Date,
          Time,
        });
    }
    if (Date && RoomNumber && Building) {
      return db(tableNames.Room)
        .where({
          Building,
          RoomNumber,
          Date,
        });
    }
    if (RoomNumber && Building) {
      return db(tableNames.Room)
        .where({
          Building,
          RoomNumber,
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
