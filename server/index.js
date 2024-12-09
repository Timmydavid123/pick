require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(bodyParser.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Models

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  hasPicked: { type: Boolean, default: false },
  pickedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'Wishlist', default: null }, // Stores picked user
});

const User = mongoose.model('User', userSchema);

// Wishlist Schema
const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wishlist: { type: String, required: true },
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

// Utility function: Authenticate middleware
const authenticate = async (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    const verified = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};

// Routes

// Signup route
app.post(
  '/auth/signup',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create and save user
      const user = new User({ name, email, password: hashedPassword });
      await user.save();

      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error creating user', error: err.message });
    }
  }
);

// Login route
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Create token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

// Submit wishlist route (authenticated)
app.post('/wishlist/submit', authenticate, async (req, res) => {
  const { wishlist } = req.body;

  if (!wishlist) return res.status(400).json({ message: 'Wishlist is required' });

  try {
    const existingWishlist = await Wishlist.findOne({ user: req.user.id });
    if (existingWishlist)
      return res.status(400).json({ message: 'You have already submitted a wishlist' });

    const newWishlist = new Wishlist({ user: req.user.id, wishlist });
    await newWishlist.save();

    res.json({ message: 'Wishlist submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving wishlist', error: err.message });
  }
});

// Pick a wishlist route (authenticated)
app.post('/wishlist/pick', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('pickedUser');

    if (user.hasPicked) {
      return res.status(400).json({
        message: 'You have already picked a wishlist',
        pickedUser: user.pickedUser,
      });
    }

    // Find a random wishlist that doesn't belong to the user
    const wishlistToPick = await Wishlist.aggregate([
      { $match: { user: { $ne: mongoose.Types.ObjectId(req.user.id) } } },
      { $sample: { size: 1 } },
    ]);

    if (wishlistToPick.length === 0) {
      return res.status(404).json({ message: 'No wishlists available to pick' });
    }

    const pickedWishlist = wishlistToPick[0];
    user.hasPicked = true;
    user.pickedUser = pickedWishlist.user;
    await user.save();

    res.json({ message: 'Wishlist picked successfully', pickedUser: pickedWishlist });
  } catch (err) {
    res.status(500).json({ message: 'Error picking wishlist', error: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
