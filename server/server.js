const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the 'client' folder at the root
app.use(express.static(path.join(__dirname, '..', 'client')));

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});