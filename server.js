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

// Store for registration tokens (temporary storage, ideally use a more permanent solution)
const tokenStore = {};

// Endpoint to generate registration link
app.post('/generateRegistrationLink', (req, res) => {
  const { expiryDays, role } = req.body;

  if (!expiryDays || !role) {
      return res.status(400).json({ error: 'Expiry days and role are required.' });
  }

  // Generate a unique token for the link
  const token = crypto.randomBytes(32).toString('hex');
  
  // Calculate expiry date
  const expiryDate = moment().add(expiryDays, 'days').toDate();

  // Store token, role, and expiry date
  tokenStore[token] = { role, expiryDate };

  // Generate the link
  const link = `http://13.229.129.54/register.html?token=${token}&role=${role}&expiry=${expiryDate.toISOString()}`;

  res.json({ link });
});

// Endpoint to handle user registration
app.post('/register', (req, res) => {
  const { email, fullname, password, confirmpassword, token, role } = req.body;

  if (password !== confirmpassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  const storedToken = tokenStore[token];

  if (!storedToken || moment().isAfter(storedToken.expiryDate)) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  // Create a new user
  const newUser = {
    user_id: `U${Math.floor(Math.random() * 1000)}`, // Generate a unique user ID
    fullname,
    email,
    password, // In a real-world scenario, use hashed passwords
    usertype: role
  };

  // Save user to the database
  mongoose.connection.db.collection('users').insertOne(newUser, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to register user' });
    }

    // Remove the used token from the store
    delete tokenStore[token];

    res.status(200).json({ success: true, message: 'User registered successfully' });
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

// Endpoint to fetch a specific electric fence by ID
app.get('/electricFences/:id', (req, res) => {
  mongoose.connection.db.collection('electricFences').findOne({ ef_id: req.params.id }, (err, fence) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!fence) {
      return res.status(404).json({ error: 'Electric Fence not found' });
    }
    res.json(fence);
  });
});

// Endpoint to fetch a specific camera by ID
app.get('/cameras/:id', (req, res) => {
  mongoose.connection.db.collection('cameras').findOne({ cam_id: req.params.id }, (err, camera) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!camera) {
      return res.status(404).json({ error: 'Camera not found' });
    }
    res.json(camera);
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

// Endpoint to update device details
app.put('/updateDevice', (req, res) => {
  const { id, location, latitude, longitude, status, type } = req.body;
  const collection = type === 'Electric Fence' ? 'electricFences' : 'cameras';
  const updateData = {
    $set: {
      [`${type === 'Electric Fence' ? 'efLocation' : 'camLocation'}`]: location,
      [`${type === 'Electric Fence' ? 'efLat' : 'camLat'}`]: latitude,
      [`${type === 'Electric Fence' ? 'efLong' : 'camLong'}`]: longitude,
      [`${type === 'Electric Fence' ? 'efStat' : 'camStat'}`]: status
    }
  };

  mongoose.connection.db.collection(collection).updateOne({ [`${type === 'Electric Fence' ? 'ef_id' : 'cam_id'}`]: id }, updateData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to update device' });
    }
    res.status(200).json({ success: true, message: 'Device updated successfully' });
  });
});

// Endpoint to delete a device
app.delete('/deleteDevice', (req, res) => {
  const { id, type } = req.body;
  const collection = type === 'Electric Fence' ? 'electricFences' : 'cameras';

  mongoose.connection.db.collection(collection).deleteOne({ [`${type === 'Electric Fence' ? 'ef_id' : 'cam_id'}`]: id }, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete device' });
    }
    res.status(200).json({ success: true, message: 'Device deleted successfully' });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
