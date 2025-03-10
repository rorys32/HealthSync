// HealthSync Version 1.2.000 - Backend
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'your-secret-key'; // Replace with secure key in production

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// In-memory data store (replace with DB later)
let userDailyData = {};
let supplements = [];
let foods = [];

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// API Endpoints
app.post('/api/login', (req, res) => {
    // Dummy user for testing (replace with real auth)
    const user = { id: 1, username: 'testuser' };
    const token = jwt.sign(user, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

app.get('/api/data', authenticateToken, (req, res) => {
    res.json({ userDailyData, supplements, foods });
});

app.post('/api/data', authenticateToken, (req, res) => {
    const { userDailyData: newData, supplements: newSupps, foods: newFoods } = req.body;
    userDailyData = { ...userDailyData, ...newData };
    supplements = newSupps || supplements;
    foods = newFoods || foods;
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});