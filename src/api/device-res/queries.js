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
        `${tableNames.User}.*`,
        // we don't want the start and end date columns from the device table
        `${tableNames.Device}.Tag`,
        `${tableNames.Device}.Model_Category`,
        `${tableNames.Device}.Device_Display_Name`,
        `${tableNames.Device}.Assigned_To`,
        `${tableNames.Device}.Reserved_NetID`,
        `${tableNames.Device}.Location`,
        `${tableNames.Device}.Funding_Source`,
        `${tableNames.Device}.Dept_Ownership`,
        `${tableNames.Device}.Serial_Number`,
        `${tableNames.Device}.PO`,
        `${tableNames.Device}.Warranty_EXP`,
        `${tableNames.Device}.Available`,
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
