const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 5000;
const path = require('path');


// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'wishlist-app/build')));



// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'wishlist-app/build', 'index.html'));
});


// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Replace with your MySQL username
  password: '', // Replace with your MySQL password
  database: 'wishlist',
  port: 3307,
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Routes
app.get('/', (req, res) => {
  res.send('Wishlist API is working!');
});

// Show wishlist form
app.get('/wishlist/form', (req, res) => {
  res.json({ message: 'Display wishlist form' });
});

// Submit wishlist
app.post('/wishlist/submit', (req, res) => {
  const { name, wishlist } = req.body;
  if (!name || !wishlist) {
    return res.status(400).json({ message: 'Name and wishlist are required' });
  }

  const query = 'INSERT INTO wishlists (name, wishlist) VALUES (?, ?)';
  db.query(query, [name, wishlist], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error inserting wishlist' });
    }
    res.json({ message: 'Wishlist submitted successfully', id: results.insertId });
  });
});

// Display the secret box (all users)
app.get('/wishlist/pick', (req, res) => {
  const query = 'SELECT * FROM wishlists';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching wishlists' });
    }
    res.json(results);
  });
});

// Pick a name and delete it
app.get('/wishlist/pick/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM wishlists WHERE id = ?';
  
  db.query(query, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = results[0];
    db.query('DELETE FROM wishlists WHERE id = ?', [id], (deleteErr) => {
      if (deleteErr) {
        return res.status(500).json({ message: 'Error deleting user' });
      }
      res.json({ name: user.name, wishlist: user.wishlist });
    });
  });
});



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
