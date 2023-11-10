const tableNames = require('../../src/constants/tableNames');
const orderedTableNames = require('../../src/constants/orderedTableNames');

const COUNTS = {
  USERS: 100,
  DEVICES: 100,
  // ROOMS is automatically generated,
  // 30 days worth of reservation slots for 12 rooms in 2 buildings
  DEVICE_RESERVATIONS_MIN: 30,
  DEVICE_RESERVATIONS_MAX: 100,
  ROOM_RESERVATIONS_MIN: 30,
  ROOM_RESERVATIONS_MAX: 100,
};

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

function generateRoomList(users) {
  const roomList = [];

  const rooms = {
    Atrium: ['J100', 'J101', 'J102', 'J103', 'J104', 'J105'],
    'Norton Hall': ['R2 100', 'R2 101', 'R2 102', 'R2 103', 'R2 104', 'R2 105'],
  };

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const dates = [];
  for (let date = new Date(weekAgo); date <= thirtyDaysFromNow; date.setDate(date.getDate() + 1)) {
    dates.push(new Date(date));
  }

  const times = Array.from({ length: 24 }, (_, i) => i);

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
            Room: room,
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

function generateDeviceReservations(users, devices) {
  // random number of reservations between min and max
  const deviceReservations = [];
  const min = COUNTS.DEVICE_RESERVATIONS_MIN;
  const max = COUNTS.DEVICE_RESERVATIONS_MAX;
  const numReservations = Math.floor(Math.random() * (max - min)) + min;

  for (let i = 0; i < numReservations; i += 1) {
    // random available device
    const availableDevices = devices.filter((device) => device.Available);
    const randomDevice = availableDevices[Math.floor(Math.random() * availableDevices.length)];

    // random user
    const randomUser = users[Math.floor(Math.random() * users.length)];

    const requestDate = new Date();
    const startDate = new Date();
    const endDate = new Date();

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

function generateRoomReservations(users, rooms) {
  // random number of reservations between min and max
  const roomReservations = [];
  const min = COUNTS.ROOM_RESERVATIONS_MIN;
  const max = COUNTS.ROOM_RESERVATIONS_MAX;
  const numReservations = Math.floor(Math.random() * (max - min)) + min;

  for (let i = 0; i < numReservations; i += 1) {
    // random available device
    const availableRooms = rooms.filter((room) => room.Available);
    const randomRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];

    // random user
    const randomUser = users[Math.floor(Math.random() * users.length)];

    const requestDate = new Date();

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
      Room: randomRoom.Room,
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
  }

  const users = generateUserList();
  const createdUsers = await knex(tableNames.User).insert(users).returning('*');
  console.log(`Created ${createdUsers.length} users`);

  const devices = generateDeviceList(users);
  const createdDevices = await knex(tableNames.Device).insert(devices).returning('*');
  console.log(`Created ${createdDevices.length} devices`);

  const rooms = generateRoomList(users);
  const batchSize = 100;
  const batches = Math.ceil(rooms.length / batchSize);
  let totalCreatedRooms = 0;
  for (let i = 0; i < batches; i += 1) {
    const start = i * batchSize;
    const end = start + batchSize;
    const batch = rooms.slice(start, end);

    const createdRooms = await knex(tableNames.Room).insert(batch).returning('*');

    if (i === 0) {
      console.log(`Created ${createdRooms.length} room entries`);
      continue;
    }
    const ellipsis = '.'.repeat(i % 4);
    totalCreatedRooms += createdRooms.length;
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`Created ${totalCreatedRooms} room entries${ellipsis}`);
  }
  console.log(`\nCreated ${rooms.length} total room entries`);

  const deviceReservations = generateDeviceReservations(users, devices);
  const createdDeviceReservations = await knex(tableNames.Device_Res).insert(deviceReservations).returning('*');
  console.log(`Created ${createdDeviceReservations.length} device reservations`);

  const roomReservations = generateRoomReservations(users, rooms);
  const createdRoomReservations = await knex(tableNames.Room_Res).insert(roomReservations).returning('*');
  console.log(`Created ${createdRoomReservations.length} room reservations`);

  console.log('Done');
};
