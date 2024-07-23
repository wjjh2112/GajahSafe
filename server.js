const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://admin:!NanaWaji060524!@13.229.129.54:27017/dummydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  authSource: 'admin' // the database where the user is created
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (from root directory)
app.use(express.static(path.join(__dirname)));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  // Find user in database
  mongoose.connection.db.collection('users').findOne({ email, password }, (err, user) => {
      if (err) {
          return res.status(500).json({ error: 'Internal server error' });
      }
      if (!user) {
          return res.status(401).json({ error: 'Invalid email or password' });
      }
      // Return user data including usertype as JSON
      res.json({
          name: user.fullname,
          email: user.email,
          avatar: 'images/icon/avatar-01.jpg', // Example static avatar path
          usertype: user.usertype // Include usertype
      });
  });
});

// Endpoint to fetch all users
app.get('/users', (req, res) => {
  mongoose.connection.db.collection('users').find({}).toArray((err, users) => {
      if (err) {
          return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(users);
  });
});

// Endpoint to fetch all electric fences
app.get('/electricFences', (req, res) => {
  mongoose.connection.db.collection('electricFences').find({}).toArray((err, fences) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(fences);
  });
});

// Endpoint to fetch all cameras
app.get('/cameras', (req, res) => {
  mongoose.connection.db.collection('cameras').find({}).toArray((err, cameras) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(cameras);
  });
});

// Endpoint to get device details by type and ID
app.get('/getDevice', (req, res) => {
  const { type, id } = req.query; // type = 'Camera' or 'Electric Fence', id = device ID

  let collectionName;
  let idField;

  if (type === 'Camera') {
    collectionName = 'cameras';
    idField = 'cam_id';
  } else if (type === 'Electric Fence') {
    collectionName = 'electricFences';
    idField = 'ef_id';
  } else {
    return res.status(400).json({ error: 'Invalid device type' });
  }

  mongoose.connection.db.collection(collectionName).findOne({ [idField]: id }, (err, device) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json(device);
  });
});

// Endpoint to update device details
app.post('/updateDevice', (req, res) => {
  const { type, id } = req.query; // type = 'Camera' or 'Electric Fence', id = device ID
  const updateData = req.body;

  let collectionName;
  let idField;

  if (type === 'Camera') {
    collectionName = 'cameras';
    idField = 'cam_id';
  } else if (type === 'Electric Fence') {
    collectionName = 'electricFences';
    idField = 'ef_id';
  } else {
    return res.status(400).json({ error: 'Invalid device type' });
  }

  mongoose.connection.db.collection(collectionName).updateOne(
    { [idField]: id },
    { $set: updateData },
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to update device' });
      }
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Device not found' });
      }
      res.status(200).json({ success: true, message: 'Device updated successfully' });
    }
  );
});

// Endpoint to add a new device
app.post('/addDevice', (req, res) => {
  const deviceType = req.body['device-type'];
  let typePrefix;

  if (deviceType === 'Camera') {
    typePrefix = 'cam';
  } else if (deviceType === 'Electric Fence') {
    typePrefix = 'ef';
  } else {
    return res.status(400).json({ error: 'Invalid device type' });
  }

  const deviceData = {
    [`${typePrefix}_id`]: req.body['device-id'],
    [`${typePrefix}Name`]: req.body['device-name'],
    [`${typePrefix}Location`]: req.body['device-location'],
    [`${typePrefix}Lat`]: req.body['device-latitude'],
    [`${typePrefix}Long`]: req.body['device-longitude'],
    [`${typePrefix}Stat`]: req.body.status
  };

  const collectionName = deviceType === 'Camera' ? 'cameras' : 'electricFences';

  mongoose.connection.db.collection(collectionName).insertOne(deviceData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to add device' });
    }
    res.status(200).json({ success: true, message: 'Device added successfully' });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
