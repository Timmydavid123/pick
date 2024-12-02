require('dotenv').config();  // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 5000;

// CORS Configuration
const corsOptions = {
  origin: 'https://pick-six.vercel.app',  // Allow this domain
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'wishlist-app/build')));

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'wishlist-app/build', 'index.html'));
});

// MongoDB connection using the URL from the .env file
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define Schema and Model for Wishlists
const wishlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  wishlist: { type: String, required: true },
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

// Routes

// Root Route
app.get('/', (req, res) => {
  res.send('Wishlist API is working!');
});

// Show wishlist form
app.get('/wishlist/form', (req, res) => {
  res.json({ message: 'Display wishlist form' });
});

// Submit wishlist
app.post('/wishlist/submit', async (req, res) => {
  const { name, wishlist } = req.body;
  if (!name || !wishlist) {
    return res.status(400).json({ message: 'Name and wishlist are required' });
  }

  try {
    const newWishlist = new Wishlist({ name, wishlist });
    const savedWishlist = await newWishlist.save();
    res.json({ message: 'Wishlist submitted successfully', id: savedWishlist._id });
  } catch (err) {
    res.status(500).json({ message: 'Error saving wishlist', error: err.message });
  }
});

// Display the secret box (all users)
app.get('/wishlist/pick', async (req, res) => {
  try {
    const wishlists = await Wishlist.find();
    res.json(wishlists);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching wishlists' });
  }
});

// Pick a name and delete it
app.get('/wishlist/pick/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await Wishlist.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Wishlist.findByIdAndDelete(id);
    res.json({ name: user.name, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
