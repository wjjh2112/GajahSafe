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
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const camerasRoutes = require('./routes/cameras');
const electricFencesRoutes = require('./routes/electricFences');
const devicesRoutes = require('./routes/devices');

app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/cameras', camerasRoutes);
app.use('/electricFences', electricFencesRoutes);
app.use('/addDevice', devicesRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
