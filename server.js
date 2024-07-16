const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
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
app.use(session({
  secret: '10c31eb407c92a61755317c61114e93490c77ac6082b33824b4b29c3b2d2ee91a29b3b4f5e7abce2d37cec4bc0271a54c60df01e813327a18a8a53aecae3dd9b',
  resave: false,
  saveUninitialized: true
}));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Routes
app.get('/', (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    res.redirect('/login.html');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await mongoose.model('User').findOne({ email });

  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = { name: user.fullname, email: user.email };
    res.redirect('/');
  } else {
    res.status(401).send('Invalid credentials');
  }
});

app.get('/user-info', (req, res) => {
  if (req.session.user) {
      res.json(req.session.user);
  } else {
      res.status(401).json(null);
  }
});


app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Failed to log out');
    }
    res.redirect('/login.html');
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
