const db = require('../../db');
const tableNames = require('../../constants/tableNames');

module.exports = {
  get(id) {
    return db(tableNames.Device_Res)
      .where({
        id,
      })
      .first();
  },
  getAll() {
    return db(tableNames.Device_Res)
      // join the Device_Res table with the Device table
      .innerJoin(
        tableNames.Device,
        `${tableNames.Device_Res}.Tag`,
        '=',
        `${tableNames.Device}.Tag`,
      )
      // join the Device_Res table with the User table
      .innerJoin(
        tableNames.User,
        `${tableNames.Device_Res}.NetID`,
        '=',
        `${tableNames.User}.NetID`,
      )
      // select all columns from the Device_Res, Device, and User tables after joining
      .select(
        `${tableNames.Device_Res}.*`,
        `${tableNames.Device}.*`,
        `${tableNames.User}.*`,
      );
  },
  submit(device_res) {
    return db(tableNames.Device_Res)
      .insert(device_res)
      .returning('*');
  },
  delete(id) {
    return db(tableNames.Device_Res)
      .where({
        id,
      })
      .del();
  },
};
