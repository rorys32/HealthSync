// HealthSync Version 1.3.5 - Backend with HTTP, MongoDB Persistence, and Debug
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your-secret-key';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthsync';

app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client'), { etag: false }));

let client;
let db;

async function connectMongo() {
    try {
        console.log('Attempting MongoDB connection with URI:', MONGO_URI);
        client = await MongoClient.connect(MONGO_URI, { useUnifiedTopology: true });
        db = client.db();
        const admin = db.admin();
        const ping = await admin.ping();
        console.log('MongoDB 8.0.5 connected, ping:', ping);
        const collections = await db.listCollections().toArray();
        console.log('Collections in healthsync:', collections.map(c => c.name));
    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        process.exit(1);
    }
}

async function loadData() {
    try {
        if (!db) throw new Error('Database not initialized');
        const data = await db.collection('userData').findOne({ id: 'userData' }) || {};
        console.log('Loaded from MongoDB healthsync.userData:', {
            found: !!data._id,
            userDailyDataKeys: Object.keys(data.userDailyData || {}),
            supplementCount: (data.supplements || []).length,
            foodCount: (data.foods || []).length
        });
        return {
            userDailyData: data.userDailyData || {},
            supplements: data.supplements || [],
            foods: data.foods || []
        };
    } catch (err) {
        console.error('Load from MongoDB failed:', err.message);
        return { userDailyData: {}, supplements: [], foods: [] };
    }
}

async function saveData(userDailyData, supplements, foods) {
    try {
        if (!db) throw new Error('Database not initialized');
        const result = await db.collection('userData').updateOne(
            { id: 'userData' },
            { $set: { userDailyData, supplements, foods } },
            { upsert: true }
        );
        console.log('Saved to MongoDB healthsync.userData:', {
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
            upsertedId: result.upsertedId || null,
            userDailyDataKeys: Object.keys(userDailyData),
            supplementCount: supplements.length,
            foodCount: foods.length
        });
    } catch (err) {
        console.error('Save to MongoDB failed:', err.message);
    }
}

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    res.on('finish', () => {
        console.log(`Response sent: ${res.statusCode}`);
    });
    next();
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log('Received JWT:', token ? 'present' : 'missing');
    if (!token) {
        console.log('No JWT provided, rejecting');
        return res.sendStatus(401);
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            console.log('JWT verification failed:', err.message);
            return res.sendStatus(403);
        }
        console.log('JWT verified:', { id: user.id, username: user.username });
        req.user = user;
        next();
    });
};

app.post('/api/login', (req, res) => {
    const user = { id: 1, username: 'testuser' };
    const token = jwt.sign(user, SECRET_KEY, { expiresIn: '1h' });
    console.log('Generated JWT:', { id: user.id, username: user.username });
    res.json({ token });
});

app.get('/api/data', authenticateToken, async (req, res) => {
    const { userDailyData, supplements, foods } = await loadData();
    console.log('Sending MongoDB data to client:', {
        userDailyDataKeys: Object.keys(userDailyData),
        supplementCount: supplements.length,
        foodCount: foods.length
    });
    res.json({ userDailyData, supplements, foods });
});

app.post('/api/data', authenticateToken, async (req, res) => {
    const { userDailyData: newData, supplements: newSupps, foods: newFoods } = req.body;
    console.log('Received data for MongoDB:', {
        userDailyDataKeys: Object.keys(newData),
        supplementCount: newSupps.length,
        foodCount: newFoods.length
    });
    await saveData(newData, newSupps, newFoods);
    res.sendStatus(200);
});

app.get('/', (req, res) => {
    console.log('Serving index.html');
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing MongoDB...');
    if (client) await client.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, closing MongoDB...');
    if (client) await client.close();
    process.exit(0);
});

connectMongo().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`HTTP server running on http://0.0.0.0:${PORT}`);
        console.log(`Local access: http://localhost:${PORT}`);
        console.log(`External access: http://your-public-ip:23748`);
    });
}).catch(err => {
    console.error('Server start failed:', err);
});