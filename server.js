const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/dummydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
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

// Endpoint to add a new device
app.post('/addDevice', (req, res) => {
  const deviceType = req.body['device-type'];
  const deviceData = {
    cam_id: req.body['device-id'],
    camName: req.body['device-name'],
    camLocation: req.body['device-location'],
    camLatitude: req.body['device-latitude'],
    camLongitude: req.body['device-longitude'],
    camStat: req.body.status
  };

  let collectionName;

  if (deviceType === 'Camera') {
    collectionName = 'cameras';
  } else if (deviceType === 'Electric Fence') {
    collectionName = 'electricFences';
  } else {
    return res.status(400).json({ error: 'Invalid device type' });
  }

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
