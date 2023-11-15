const tableNames = require('../../src/constants/tableNames');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  await knex.schema.table(tableNames.Device, (table) => {
    table.date('Start_Date');
    table.date('End_Date');
  });

  const devices = await knex.select('Tag', 'Reserved_NetID', 'Available').from(tableNames.Device);

  for (const device of devices) {
    if (!(device.Reserved_NetID && !device.Available)) continue;

    // Generate random dates from last week until 30 days from now
    const start = new Date();
    const end = new Date();
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 30);

    const startDate = new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime()),
    );
    const endDate = new Date(
      startDate.getTime() + Math.random() * (end.getTime() - startDate.getTime()),
    );

    await knex(tableNames.Device)
      .where({ Tag: device.Tag })
      .update({ Start_Date: startDate, End_Date: endDate });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
  await knex.raw('ALTER TABLE ?? DROP COLUMN ??', [tableNames.Device, 'Start_Date']);
  await knex.raw('ALTER TABLE ?? DROP COLUMN ??', [tableNames.Device, 'End_Date']);
};
