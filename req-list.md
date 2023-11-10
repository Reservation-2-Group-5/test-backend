### Device
- [ ] GET `/api/v1/devices` all device entries w/ props:
  - Tag
  - Model_Category
  - Device_Display_Name
  - Assigned_To
  - Reserved_NetID
  - Location
  - Funding_Source
  - Dept_Ownership
  - Serial_Number
  - Warranty_EXP
  - Available

### Room
- [ ] GET `/api/v1/rooms` all room entries w/ props:
  - Building
  - Room
  - Date
  - Time
  - Available
  - Reserved_Name
  - Reserved_NetID
  - Max_Occupancy
  - Is_Office

### User
- [ ] GET `/api/v1/users` all users w/ props:
  - NetID
  - Name
  - Email
  - Is_Faculty
  - Is_Student
  - Is_Admin
- [ ] GET `/api/v1/users/:NetID` single user from NetID (for login)

### Device Res
- [ ] GET `/api/v1/device-res` all pending device reservation requests
  - id
  - NetID
  - Tag
  - Request_Date
  - Start_Date
  - End_Date
  - -- JOIN Device on Tag=Tag --
  - Tag
  - Model_Category
  - Device_Display_Name
  - Assigned_To
  - Reserved_NetID
  - Location
  - Funding_Source
  - Dept_Ownership
  - Serial_Number
  - Warranty_EXP
  - Available
  - -- JOIN User on NetID=NetID --
  - NetID
  - Name
- [ ] POST `/api/v1/device-res` submit new reservation
- [ ] PUT `/api/v1/device-res/:id` to approve/deny
  - Request body includes `status: 'approved'` or `status: 'denied'`

### Room Res
- [ ] GET `/api/v1/room-res` all pending room reservation requests
  - id
  - NetID
  - Building
  - Room
  - Date
  - Time
  - Request_Date
  - -- JOIN Room on Building=Building,Room=Room,Date=Date,Time=Time --
  - Building
  - Room
  - Date
  - Time
  - Available
  - Reserved_Name
  - Reserved_NetID
  - Max_Occupancy
  - Is_Office
  - -- JOIN User on NetID=NetID --
  - NetID
  - Name
- [ ] POST `/api/v1/room-res` submit new reservation
- [ ] PUT `/api/v1/room-res/:id` to approve/deny
  - Request body includes `status: 'approved'` or `status: 'denied'`
