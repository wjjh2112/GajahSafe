const express = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const crypto = require('crypto');
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

// Init GridFS
let gfs;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
  console.log('Connected to MongoDB');
});

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  options: { useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({ storage });

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

// Endpoint to generate a registration link
app.post('/generateLink', (req, res) => {
  const { token, expiryDays, role } = req.body;
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDays));

  mongoose.connection.db.collection('registrationLinks').insertOne({
    token,
    role,
    expiryDate,
    used: false
  }, (err, result) => {
    if (err) {
      res.json({ success: false, message: 'Error generating link.' });
    } else {
      res.json({ success: true });
    }
  });
});

// Function to generate a unique user ID
function generateUserId() {
  return 'U' + uuidv4();
}

// Endpoint to register a new user
app.post('/registerUser', (req, res) => {
  const { email, fullname, password, token } = req.body;

  mongoose.connection.db.collection('users').findOne({ email }, (err, existingUser) => {
    if (err) {
      res.json({ success: false, message: 'Error checking existing email.' });
      return;
    }

    if (existingUser) {
      res.json({ success: false, message: 'Email already registered.' });
      return;
    }

    mongoose.connection.db.collection('registrationLinks').findOne({ token }, (err, link) => {
      if (err || !link) {
        res.json({ success: false, message: 'Invalid or expired registration link.' });
        return;
      }

      if (link.used || new Date() > link.expiryDate) {
        res.json({ success: false, message: 'Registration link has expired or already been used.' });
        return;
      }

      const newUser = {
        user_id: generateUserId(),
        email,
        fullname,
        password,
        usertype: link.role
      };

      mongoose.connection.db.collection('users').insertOne(newUser, (err, result) => {
        if (err) {
          res.json({ success: false, message: 'Error registering user.' });
        } else {
          mongoose.connection.db.collection('registrationLinks').updateOne({ token }, { $set: { used: true } }, (err, updateResult) => {
            if (err) {
              res.json({ success: false, message: 'Error updating registration link status.' });
            } else {
              res.json({ success: true });
            }
          });
        }
      });
    });
  });
});

// Endpoint to update user details
app.put('/updateUser', (req, res) => {
  const { id, fullname, usertype } = req.body;
  
  mongoose.connection.db.collection('users').updateOne(
    { user_id: id },
    { $set: { fullname, usertype } },
    (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, error: 'Failed to update user' });
      }
      if (result.modifiedCount === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      res.status(200).json({ success: true, message: 'User updated successfully' });
    }
  );
});

// Endpoint to delete a user
app.delete('/deleteUser', (req, res) => {
  const { id } = req.body;

  mongoose.connection.db.collection('users').deleteOne({ user_id: id }, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Failed to delete user' });
    }
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User deleted successfully' });
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

// Define the schema and model
const reportSchema = new mongoose.Schema({
  reportID: String,
  reportLocation: String,
  reportDamages: {
    fence: { damaged: Boolean, value: Number },
    vehicle: { damaged: Boolean, value: Number },
    assets: { damaged: Boolean, value: Number },
    paddock: { damaged: Boolean, value: Number },
    pipe: { damaged: Boolean, value: Number },
    casualties: { damaged: Boolean, value: Number },
    other: { damaged: Boolean, damagedName: String, value: Number }
  },
  reportEFDamage: String,
  reportCAMDamage: String,
  reportDateTime: Date,
  reportImages: [String],
  reportingOfficer: String
});

const Report = conn.model('Report', reportSchema);

// Submit report
app.post('/submit-report', upload.array('reportImages[]'), async (req, res) => {
  try {
    const reportID = 'REP' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const imageIds = req.files.map(file => file.id.toString());

    const report = new Report({
      reportID: reportID,
      reportLocation: req.body.reportLocation,
      reportDamages: {
        fence: { damaged: req.body.fenceDamaged === 'on', value: Number(req.body.fenceValue) || 0 },
        vehicle: { damaged: req.body.vehicleDamaged === 'on', value: Number(req.body.vehicleValue) || 0 },
        assets: { damaged: req.body.assetsDamaged === 'on', value: Number(req.body.assetsValue) || 0 },
        paddock: { damaged: req.body.paddockDamaged === 'on', value: Number(req.body.paddockValue) || 0 },
        pipe: { damaged: req.body.pipeDamaged === 'on', value: Number(req.body.pipeValue) || 0 },
        casualties: { damaged: req.body.casualtiesDamaged === 'on', value: Number(req.body.casualtiesValue) || 0 },
        other: { 
          damaged: req.body.otherDamaged === 'on', 
          damagedName: req.body.otherName || '',
          value: Number(req.body.otherValue) || 0 
        }
      },
      reportEFDamage: req.body.reportEFDamage,
      reportCAMDamage: req.body.reportCAMDamage,
      reportDateTime: new Date(req.body.reportDateTime),
      reportImages: imageIds,
      reportingOfficer: req.body.reportingOfficer
    });

    await report.save();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error saving report' });
  }
});

// Get all reports
app.get('/reports', async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific report
app.get('/reports/:id', async (req, res) => {
  try {
    const report = await Report.findOne({ reportID: req.params.id });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve images
app.get('/image/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }

    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
