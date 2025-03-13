// HealthSync Server - Build 1.2.7
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const app = express();
const secretKey = process.env.JWT_SECRET || 'your-secret-key';
const PORT = process.env.PORT || 3000;
const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, 'data.json');

// Ensure data.json exists
if (!fs.existsSync(DATA_PATH)) {
  fs.writeFileSync(DATA_PATH, '{}', 'utf8');
  fs.chmodSync(DATA_PATH, 0o666);  // Read/write for all
}

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
    if (username === 'testuser' && password === 'testpass') {
      const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get('/api/data', authenticateToken, (req, res) => {
  try {
    if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, '{}', 'utf8');
    const data = fs.readFileSync(DATA_PATH, 'utf8');
    res.json(JSON.parse(data || '{}'));
  } catch (err) {
    console.error('Error fetching data:', err);
    res.json({});
  }
});

app.post('/api/data', authenticateToken, (req, res) => {
  try {
    const newData = req.body;
    if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, '{}', 'utf8');
    fs.writeFileSync(DATA_PATH, JSON.stringify(newData, null, 2));
    console.log('Data saved to', DATA_PATH);
    res.json({ message: 'Data saved' });
  } catch (err) {
    console.error('Error saving data:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});