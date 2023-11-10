const db = require('../../db');
const tableNames = require('../../constants/tableNames');

module.exports = {
  // getAll() {
  //   return db(tableNames.Room_Res);
  // },
  getAll() {
    return db(tableNames.Room_Res)
      // join the Room_Res table with the Room table
      .innerJoin(
        tableNames.Room,
        function join() {
          this.on(`${tableNames.Room_Res}.Building`, '=', `${tableNames.Room}.Building`)
            .andOn(`${tableNames.Room_Res}.Room`, '=', `${tableNames.Room}.Room`)
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
    return db(tableNames.Room_Res)
      .insert(room_res)
      .returning('*');
  },
};
