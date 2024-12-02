require('dotenv').config();  // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;  // Use environment port or default to 5000

// CORS Configuration - Adjust it properly
const corsOptions = {
  origin: 'https://pick-six.vercel.app', // Allow this domain
  methods: ['GET', 'POST', 'OPTIONS'], // Allow these HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
  credentials: true, // Include credentials (cookies, authentication headers, etc.)
  preflightContinue: false, // Preflight request handling is done automatically by express-cors
  optionsSuccessStatus: 200, // For legacy browser support (200 OK)
};

// Middleware to handle CORS and preflight requests
app.use(cors(corsOptions));  // Apply CORS middleware globally
app.use(bodyParser.json()); // Parse incoming JSON requests

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

// Root Route for API check
app.get('/', (req, res) => {
  res.json({ message: 'Wishlist API is working!' });
});

// Show wishlist form (simple message for frontend)
app.get('/wishlist/form', (req, res) => {
  res.json({ message: 'Display wishlist form' });
});

// Submit wishlist (POST request to submit wishlist)
app.post('/wishlist/submit', async (req, res) => {
  const { name, wishlist } = req.body;

  if (!name || !wishlist) {
    return res.status(400).json({ message: 'Name and wishlist are required' });
  }

  try {
    // Check if the user with the same name already exists
    const existingUser = await Wishlist.findOne({ name });
    if (existingUser) {
      return res.status(400).json({ message: 'You have already submitted your wishlist' });
    }

    const newWishlist = new Wishlist({ name, wishlist });
    const savedWishlist = await newWishlist.save();
    res.json({ message: 'Wishlist submitted successfully', id: savedWishlist._id });
  } catch (err) {
    res.status(500).json({ message: 'Error saving wishlist', error: err.message });
  }
});

// Display the wishlists (GET request)
app.get('/wishlist/pick', async (req, res) => {
  try {
    const wishlists = await Wishlist.find();
    res.json(wishlists);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching wishlists', error: err.message });
  }
});

// Pick a name and delete it (GET request to delete by ID)
// Routes - Modify this to handle ObjectId correctly
app.get('/wishlist/pick/:id', async (req, res) => {
  const { id } = req.params; // Extract ID from the route parameter

  try {
    const user = await Wishlist.findById(id); // Use findById with the correct ID
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Wishlist.findByIdAndDelete(id); // Delete using the ObjectId
    res.json({ name: user.name, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
