const db = require('../../db');
const tableNames = require('../../constants/tableNames');

module.exports = {
  get(room_res) {
    if (Array.isArray(room_res)) {
      return db(tableNames.Room_Res)
        .whereIn(
          ['Building', 'RoomNumber', 'Date', 'Time'],
          room_res.map((obj) => [
            obj.Building,
            obj.RoomNumber,
            (new Date(obj.Date)).getTime(),
            obj.Time,
          ]),
        );
    }
    if (typeof room_res === 'object' && room_res !== null) {
      return db(tableNames.Room_Res)
        .where({
          Building: room_res.Building,
          RoomNumber: room_res.RoomNumber,
          Date: room_res.Date,
          Time: room_res.Time,
        })
        .first();
    }
    return null;
  },
  getAll() {
    return db(tableNames.Room_Res)
      // join the Room_Res table with the Room table
      .innerJoin(
        tableNames.Room,
        function join() {
          this.on(`${tableNames.Room_Res}.Building`, '=', `${tableNames.Room}.Building`)
            .andOn(`${tableNames.Room_Res}.RoomNumber`, '=', `${tableNames.Room}.RoomNumber`)
            .andOn(`${tableNames.Room_Res}.Date`, '=', `${tableNames.Room}.Date`)
            .andOn(`${tableNames.Room_Res}.Time`, '=', `${tableNames.Room}.Time`);
        },
      )
      // join the Room_Res table with the User table
      .innerJoin(
        tableNames.User,
        `${tableNames.Room_Res}.NetID`,
        '=',
        `${tableNames.User}.NetID`,
      )
      // select all columns from the Room_Res, Room, and User tables after joining
      .select(
        `${tableNames.Room_Res}.*`,
        `${tableNames.Room}.*`,
        `${tableNames.User}.*`,
      );
  },
  submit(room_res) {
    if (Array.isArray(room_res) || typeof room_res === 'object') {
      return db(tableNames.Room_Res)
        .insert(room_res)
        .returning('*');
    }
    return null;
  },
  delete(id) {
    if (Array.isArray(id)) {
      return db(tableNames.Room_Res)
        .whereIn('id', id)
        .del();
    }
    return db(tableNames.Room_Res)
      .where({
        id,
      })
      .del();
  },
};
