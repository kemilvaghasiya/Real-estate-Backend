const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var bodyParser = require('body-parser')
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to the database
mongoose.connect('mongodb://localhost/real-state', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Create a schema for user data
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String
});

// Create a model using the schema
const User = mongoose.model('User', userSchema);

// Define a route for user signup
app.post('/signup', async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Create a new user
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ name, email, password: hashedPassword, phone });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err.message });
  }
});

// Define a route for user login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // Create a JWT token
    const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, 'mysecret', { expiresIn: '12h' });
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start the server
app.listen(5000, () => {
  console.log('Server started on port 5000');
});
