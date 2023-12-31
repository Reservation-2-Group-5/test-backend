const knexConfig = require('../../knexfile');

const orderedTableNames = require('../../src/constants/orderedTableNames');

const COUNTS = {
  USERS: 1000, // total users
  DEVICES: 1000, // total devices
  ROOMS: 30, // number of days worth of reservation slots for 12 rooms in 2 buildings
  DEVICE_RESERVATIONS_MIN: 30, // min number of device reservations
  DEVICE_RESERVATIONS_MAX: 100, // max number of device reservations
  ROOM_RESERVATIONS_MIN: 30, // min number of room reservations
  ROOM_RESERVATIONS_MAX: 100, // max number of room reservations
};

/**
 * Generates a list of user objects with randomly assigned properties.
 * @returns {Array<Object>} An array of user objects.
 */
function generateUserList() {
  const userList = [];
  for (let i = 0; i < COUNTS.USERS; i += 1) {
    const isStudent = Math.random() < 0.9;
    const adminExists = userList.filter((user) => user.Is_Admin).length > 0;
    const isAdmin = (!isStudent && Math.random() < 0.1) || (i > 95 && !adminExists && !isStudent);
    userList.push({
      NetID: `jdoe${i}`,
      Name: `John Doe ${i}`,
      Email: `jdoe${i}@example.edu`,
      Is_Faculty: !isStudent,
      Is_Student: isStudent,
      Is_Admin: isAdmin,
    });
  }
  return userList;
}

/**
 * Generates a list of devices with random properties.
 * @param {Array} users - An array of user objects.
 * @returns {Array<Object>} An array of device objects.
 */
function generateDeviceList(users) {
  const deviceList = [];
  const categories = ['Laptop', 'Desktop', 'Monitor', 'Keyboard', 'Mouse', 'Printer', 'Scanner', 'Projector', 'Other'];
  const departments = [
    'Computer Science',
    'Information Technology',
    'Software Engineering',
    'Computer Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Architecture',
    'Construction Management',
    'Business',
    'Marketing',
    'Finance',
    'Accounting',
    'Economics',
    'Management',
  ];
  const fundingSources = [
    'Department',
    'State',
    'Federal',
    'Local',
    'Grant',
    'Donation',
    'Other',
  ];
  const locations = [
    'J100', 'J101', 'J102', 'J103', 'J104', 'J105',
    'R2 100', 'R2 101', 'R2 102', 'R2 103', 'R2 104', 'R2 105',
  ];
  const tagFormat = new Intl.NumberFormat('en-US', { minimumIntegerDigits: 5, useGrouping: false });
  const poFormat = new Intl.NumberFormat('en-US', { minimumIntegerDigits: 10, useGrouping: false });
  for (let i = 0; i < COUNTS.DEVICES; i += 1) {
    // determine if device is assigned to a user
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const assignedTo = (Math.random() < 0.6) ? randomUser : null;

    // random warrenty expiration date from 1 year ago until 5 years from now
    const warrantyEXP = new Date();
    warrantyEXP.setHours(0, 0, 0, 0); // clear time portion of the date
    const oneYearAgo = new Date(
      warrantyEXP.getFullYear() - 1,
      warrantyEXP.getMonth(),
      warrantyEXP.getDate(),
    );
    const fiveYearsFromNow = new Date(
      warrantyEXP.getFullYear() + 5,
      warrantyEXP.getMonth(),
      warrantyEXP.getDate(),
    );
    const randomTime = oneYearAgo.getTime() + Math.random()
      * (fiveYearsFromNow.getTime() - oneYearAgo.getTime());

    warrantyEXP.setTime(randomTime);

    const tag = `P${tagFormat.format(i)}`;
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const randomFunding = fundingSources[Math.floor(Math.random() * fundingSources.length)];
    const randomDepartment = departments[Math.floor(Math.random() * departments.length)];

    deviceList.push({
      Tag: tag,
      Model_Category: randomCategory,
      Device_Display_Name: `Device Display Name ${i}`,
      Assigned_To: assignedTo?.Name,
      Reserved_NetID: assignedTo?.NetID,
      Location: randomLocation,
      Funding_Source: randomFunding,
      Dept_Ownership: randomDepartment,
      Serial_Number: `SN${i}`,
      PO: poFormat.format(i),
      Warranty_EXP: warrantyEXP,
      Available: !assignedTo?.Name,
    });
  }
  return deviceList;
}

/**
 * Generates a list of rooms with their
 * availability, reserved name, reserved netID, max occupancy, and whether they are an office.
 * @param {Array} users - An array of user objects.
 * @returns {Array<Object>} - An array of room objects.
 */
function generateRoomList(users) {
  const roomList = [];

  const rooms = {
    Atrium: ['J100', 'J101', 'J102', 'J103', 'J104', 'J105'],
    'Norton Hall': ['R2 100', 'R2 101', 'R2 102', 'R2 103', 'R2 104', 'R2 105'],
  };

  // generate dates from 1 week ago until <room count> days from now
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const xDaysFromNow = new Date();
  xDaysFromNow.setDate(xDaysFromNow.getDate() + COUNTS.ROOMS);

  // clear time portion of the date
  weekAgo.setHours(0, 0, 0, 0);
  xDaysFromNow.setHours(0, 0, 0, 0);

  // generate full list of dates between weekAgo and xDaysFromNow
  const dates = [];
  for (let date = new Date(weekAgo); date <= xDaysFromNow; date.setDate(date.getDate() + 1)) {
    dates.push(new Date(date));
  }

  // create list of times from 0 to 23
  const times = Array.from({ length: 24 }, (_, i) => i);

  // for each <building, room, date, time> combo, generate a room entry
  for (const building of Object.keys(rooms)) {
    for (const room of rooms[building]) {
      const maxOccupancy = Math.floor(Math.random() * 40) + 10;
      const isOffice = Math.random() < 0.1;
      for (const date of dates) {
        for (const time of times) {
          const randomUser = users[Math.floor(Math.random() * users.length)];
          const reservedTo = (Math.random() < 0.3) ? randomUser : null;

          roomList.push({
            Building: building,
            RoomNumber: room,
            Date: date,
            Time: time,
            Available: !reservedTo?.Name,
            Reserved_Name: reservedTo?.Name,
            Reserved_NetID: reservedTo?.NetID,
            Max_Occupancy: maxOccupancy,
            Is_Office: isOffice,
          });
        }
      }
    }
  }

  return roomList;
}

/**
 * Generates an array of device reservations with random user, device, and date information.
 * @param {Array} users - An array of user objects.
 * @param {Array} devices - An array of device objects.
 * @returns {Array<Object>} An array of device reservation objects.
 */
function generateDeviceReservations(users, devices) {
  // random number of reservations between min and max
  const deviceReservations = [];
  const min = COUNTS.DEVICE_RESERVATIONS_MIN;
  const max = COUNTS.DEVICE_RESERVATIONS_MAX;
  const numReservations = Math.floor(Math.random() * (max - min)) + min;

  for (let i = 0; i < numReservations; i += 1) {
    // random available device not already requested by a user
    const unavailableDevices = deviceReservations.map((reservation) => reservation.Tag);
    const availableDevices = devices
      .filter((device) => device.Available && !unavailableDevices.includes(device.Tag));
    const randomDevice = availableDevices[Math.floor(Math.random() * availableDevices.length)];
    if (!randomDevice) break;

    // random user
    const randomUser = users[Math.floor(Math.random() * users.length)];

    const requestDate = new Date();
    const startDate = new Date();
    const endDate = new Date();

    // clear time portion of the date
    requestDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    // random request date from 1 year ago until today
    const oneYearAgo = new Date(
      requestDate.getFullYear() - 1,
      requestDate.getMonth(),
      requestDate.getDate(),
    );
    const randomRequestTime = oneYearAgo.getTime() + Math.random()
      * (requestDate.getTime() - oneYearAgo.getTime());

    requestDate.setTime(randomRequestTime);

    // random start date from today until 1 year from now
    const oneYearFromNow = new Date(
      startDate.getFullYear() + 1,
      startDate.getMonth(),
      startDate.getDate(),
    );
    const randomStartTime = startDate.getTime() + Math.random()
      * (oneYearFromNow.getTime() - startDate.getTime());

    startDate.setTime(randomStartTime);

    // random end date from start date until 1 year from now
    const randomEndTime = startDate.getTime() + Math.random()
      * (oneYearFromNow.getTime() - startDate.getTime());

    endDate.setTime(randomEndTime);

    deviceReservations.push({
      NetID: randomUser.NetID,
      Tag: randomDevice.Tag,
      Request_Date: requestDate,
      Start_Date: startDate,
      End_Date: endDate,
    });
  }

  return deviceReservations;
}

/**
 * Generates an array of room reservations with random users and rooms.
 * @param {Array} users - An array of user objects.
 * @param {Array} rooms - An array of room objects.
 * @returns {Array<Object>} An array of room reservation objects.
 */
function generateRoomReservations(users, rooms) {
  // random number of reservations between min and max
  const roomReservations = [];
  const min = COUNTS.ROOM_RESERVATIONS_MIN;
  const max = COUNTS.ROOM_RESERVATIONS_MAX;
  const numReservations = Math.floor(Math.random() * (max - min)) + min;

  for (let i = 0; i < numReservations; i += 1) {
    // random available room not already requested by a user
    const availableRooms = rooms.filter((room) => {
      for (const unavailableRoom of roomReservations) {
        if (
          room.Building === unavailableRoom.Building
          && room.RoomNumber === unavailableRoom.RoomNumber
          && room.Date.getTime() === unavailableRoom.Date.getTime()
          && room.Time === unavailableRoom.Time
        ) {
          return false;
        }
      }
      return room.Available;
    });
    const randomRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];
    if (!randomRoom) break;

    // random user
    const randomUser = users[Math.floor(Math.random() * users.length)];

    const requestDate = new Date();
    requestDate.setHours(0, 0, 0, 0); // clear time portion of the date

    // random request date from 1 year ago until today
    const oneYearAgo = new Date(
      requestDate.getFullYear() - 1,
      requestDate.getMonth(),
      requestDate.getDate(),
    );
    const randomRequestTime = oneYearAgo.getTime() + Math.random()
      * (requestDate.getTime() - oneYearAgo.getTime());

    requestDate.setTime(randomRequestTime);

    roomReservations.push({
      NetID: randomUser.NetID,
      Building: randomRoom.Building,
      RoomNumber: randomRoom.RoomNumber,
      Date: randomRoom.Date,
      Time: randomRoom.Time,
      Request_Date: requestDate,
    });
  }

  return roomReservations;
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async (knex) => {
  for (const tableName of orderedTableNames) {
    console.log('Clearing:', tableName);
    await knex(tableName).del();
    if (knexConfig[process.env.NODE_ENV].client === 'sqlite3') {
      await knex.raw(`DELETE FROM sqlite_sequence WHERE name='${tableName}'`);
    } else if (knexConfig[process.env.NODE_ENV].client === 'mysql') {
      await knex.raw(`ALTER TABLE ${tableName} AUTO_INCREMENT = 1`);
    }
  }

  const users = generateUserList();
  const devices = generateDeviceList(users);
  const rooms = generateRoomList(users);
  const deviceReservations = generateDeviceReservations(users, devices);
  const roomReservations = generateRoomReservations(users, rooms);

  const orderedTableData = [
    users,
    devices,
    rooms,
    deviceReservations,
    roomReservations,
  ];
  const reverseTableNames = orderedTableNames.reverse();

  try {
    await knex.transaction(async (trx) => {
      for (let i = 0; i < orderedTableData.length; i += 1) {
        const tableName = reverseTableNames[i];
        const tableData = orderedTableData[i];
        console.log('Inserting:', tableName);
        await trx.batchInsert(tableName, tableData, 500);
      }
    });
  } catch (error) {
    console.error('Transaction failed:', error);
  }

  // set pending device reservations to unavailable
  console.log('Setting pending device reservations to unavailable');
  const deviceTags = deviceReservations.map((reservation) => reservation.Tag);
  await knex('Device').whereIn('Tag', deviceTags).update({
    Available: false,
  }, ['Tag', 'Available']);
  // console.log('Changed devices:', changedDevices);

  // set pending room reservations to unavailable
  console.log('Setting pending room reservations to unavailable');
  const roomKeys = roomReservations.map((reservation) => [
    reservation.Building,
    reservation.RoomNumber,
    reservation.Date,
    reservation.Time,
  ]);
  await knex('Room').whereIn(['Building', 'RoomNumber', 'Date', 'Time'], roomKeys).update({
    Available: false,
  }, ['Building', 'RoomNumber', 'Date', 'Time', 'Available']);
  // console.log('Changed rooms:', changedRooms);

  console.log('Done');
};
