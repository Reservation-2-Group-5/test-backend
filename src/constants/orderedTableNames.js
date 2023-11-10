const tableNames = require('./tableNames');
// table names in order of least dependency
module.exports = [
  tableNames.Room_Res,
  tableNames.Device_Res,
  tableNames.Room,
  tableNames.Device,
  tableNames.User,
];
