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

// Define the schema and model for electric fences and cameras
const electricFenceSchema = new mongoose.Schema({
  ef_id: String,
  efName: String,
  efLocation: String,
  efLat: String,
  efLong: String,
  efStat: String
});

const cameraSchema = new mongoose.Schema({
  cam_id: String,
  camName: String,
  camLocation: String,
  camLat: String,
  camLong: String,
  camStat: String
});

const ElectricFence = mongoose.model('ElectricFence', electricFenceSchema);
const Camera = mongoose.model('Camera', cameraSchema);

// Endpoint to fetch electric fences
app.get('/electricFences', (req, res) => {
  ElectricFence.find({}, (err, electricFences) => {
      if (err) {
          return res.status(500).send(err);
      }
      res.send(electricFences);
  });
});

// Endpoint to fetch cameras
app.get('/cameras', (req, res) => {
  Camera.find({}, (err, cameras) => {
      if (err) {
          return res.status(500).send(err);
      }
      res.send(cameras);
  });
});

// Endpoint to update a device
app.put('/updateDevice/:deviceType/:deviceId', (req, res) => {
  const { deviceType, deviceId } = req.params;
  const updateData = req.body;

  let Model;
  if (deviceType === 'Electric Fence') {
      Model = ElectricFence;
  } else if (deviceType === 'Camera') {
      Model = Camera;
  } else {
      return res.status(400).send({ success: false, message: 'Invalid device type' });
  }

  Model.findOneAndUpdate({ [`${deviceType === 'Electric Fence' ? 'ef_id' : 'cam_id'}`]: deviceId }, updateData, { new: true }, (err, updatedDevice) => {
      if (err) {
          return res.status(500).send({ success: false, message: 'Failed to update device' });
      }
      res.send({ success: true, updatedDevice });
  });
});

// Endpoint to delete a device
app.delete('/deleteDevice/:deviceType/:deviceId', (req, res) => {
  const { deviceType, deviceId } = req.params;

  let Model;
  if (deviceType === 'Electric Fence') {
      Model = ElectricFence;
  } else if (deviceType === 'Camera') {
      Model = Camera;
  } else {
      return res.status(400).send({ success: false, message: 'Invalid device type' });
  }

  Model.findOneAndDelete({ [`${deviceType === 'Electric Fence' ? 'ef_id' : 'cam_id'}`]: deviceId }, (err) => {
      if (err) {
          return res.status(500).send({ success: false, message: 'Failed to delete device' });
      }
      res.send({ success: true });
  });
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
