// HealthSync Version 1.3.0 - Backend with HTTP and MongoDB Persistence
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your-secret-key';
const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'healthsync';

app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client'), { etag: false }));

let client;
let db;

async function connectMongo() {
    try {
        client = await MongoClient.connect(MONGO_URI, { useUnifiedTopology: true });
        db = client.db(DB_NAME);
        console.log('Connected to MongoDB 8.0.5');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    }
}

async function loadData() {
    try {
        const data = await db.collection('userData').findOne({ id: 'userData' }) || {};
        return {
            userDailyData: data.userDailyData || {},
            supplements: data.supplements || [],
            foods: data.foods || []
        };
    } catch (err) {
        console.error('Failed to load data from MongoDB:', err);
        return { userDailyData: {}, supplements: [], foods: [] };
    }
}

async function saveData(userDailyData, supplements, foods) {
    try {
        await db.collection('userData').updateOne(
            { id: 'userData' },
            { $set: { userDailyData, supplements, foods } },
            { upsert: true }
        );
        console.log('Successfully saved data to MongoDB:', { userDailyData, supplements, foods });
    } catch (err) {
        console.error('Failed to save data to MongoDB:', err);
    }
}

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

app.get('/api/data', authenticateToken, async (req, res) => {
    const { userDailyData, supplements, foods } = await loadData();
    console.log('Sending data:', { userDailyData, supplements, foods });
    res.json({ userDailyData, supplements, foods });
});

app.post('/api/data', authenticateToken, async (req, res) => {
    const { userDailyData: newData, supplements: newSupps, foods: newFoods } = req.body;
    console.log('Received data:', req.body);
    await saveData(newData,NIK newSupps, newFoods);
    res.sendStatus(200);
});

app.get('/', (req, res) => {
    console.log('Serving index.html');
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Cleanup on exit
process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, closing MongoDB connection...');
    if (client) await client.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('Received SIGINT, closing MongoDB connection...');
    if (client) await client.close();
    process.exit(0);
});

// Start server with MongoDB connection
connectMongo().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`HTTP server running on http://0.0.0.0:${PORT}`);
        console.log(`Local access: http://localhost:${PORT}`);
        console.log(`External access: http://your-public-ip:23748`);
    });
}).catch(err => {
    console.error('Failed to start server:', err);
});