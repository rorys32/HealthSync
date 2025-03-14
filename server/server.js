// HealthSync Server - Build 1.3.003
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const app = express();
const secretKey = process.env.JWT_SECRET || 'your-secret-key';
const PORT = process.env.PORT || 3000;
const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, 'data.json');

// Ensure data.json exists with default structure
if (!fs.existsSync(DATA_PATH)) {
  fs.writeFileSync(DATA_PATH, '{}', 'utf8');
  fs.chmodSync(DATA_PATH, 0o666);
}

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

app.get('/api/data', authenticateToken, (req, res) => {
  try {
    const data = fs.existsSync(DATA_PATH) ? fs.readFileSync(DATA_PATH, 'utf8') : '{}';
    res.json(JSON.parse(data || '{}'));
  } catch (err) {
    console.error('Error fetching data:', err.stack);
    res.json({});
  }
});

app.post('/api/data', authenticateToken, (req, res) => {
  try {
    const newData = req.body;
    fs.writeFileSync(DATA_PATH, JSON.stringify(newData, null, 2));
    console.log('Data saved to', DATA_PATH);
    res.json({ message: 'Data saved' });
  } catch (err) {
    console.error('Error saving data:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Rest of server.js unchanged...
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
# Save: Ctrl+O, Enter, Ctrl+X