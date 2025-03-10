// HealthSync Version 1.2.2 - Backend with HTTP (Temporary)
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your-secret-key';

app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client'), { etag: false }));

let userDailyData = {};
let supplements = [];
let foods = [];

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    res.set('Cache-Control', 'no-store');
    res.on('finish', () => {
        console.log(`Response sent: ${res.statusCode}`);
    });
    next();
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log('Auth token received:', token);
    if (!token) {
        console.log('No token provided');
        return res.sendStatus(401);
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            console.log('Token verification failed:', err);
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};

app.post('/api/login', (req, res) => {
    const user = { id: 1, username: 'testuser' };
    const token = jwt.sign(user, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

app.get('/api/data', authenticateToken, (req, res) => {
    console.log('Sending data:', { userDailyData, supplements, foods });
    res.json({ userDailyData, supplements, foods });
});

app.post('/api/data', authenticateToken, (req, res) => {
    const { userDailyData: newData, supplements: newSupps, foods: newFoods } = req.body;
    console.log('Received data:', req.body);
    userDailyData = { ...userDailyData, ...newData };
    supplements = newSupps || supplements;
    foods = newFoods || foods;
    console.log('Updated server data:', { userDailyData, supplements, foods });
    res.sendStatus(200);
});

app.get('/', (req, res) => {
    console.log('Serving index.html');
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`HTTP server running on http://0.0.0.0:${PORT}`);
    console.log(`Local access: http://localhost:${PORT}`);
    console.log(`External access: http://your-public-ip:23748`);
});