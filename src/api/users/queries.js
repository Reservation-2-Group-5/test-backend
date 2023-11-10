const db = require('../../db');
const tableNames = require('../../constants/tableNames');

const fields = ['NetID', 'Name', 'Email', 'Is_Faculty', 'Is_Student', 'Is_Admin'];

module.exports = {
  getAll() {
    return db(tableNames.User)
      .select(fields);
  },
  get(id) {
    return db(tableNames.User)
      .select(fields)
      .where({
        id,
      })
      .first();
  },
};
