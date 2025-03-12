const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const helmet = require('helmet');

const app = express();
app.use(express.json());

// Content Security Policy configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles temporarily
      scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts temporarily
      connectSrc: ["'self'"], // Allow connections to self
    },
  },
}));

// MongoDB Connection (Insecure for now, to be secured later)
mongoose.connect('mongodb://localhost:27017/healthsync', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// JWT Secret (To be moved to .env)
const JWT_SECRET = 'your-secret-key';

// User Schema (Temporary, for authentication placeholder)
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model('User', userSchema);

// Health Data Schema
const healthDataSchema = new mongoose.Schema({
  id: String,
  foods: [String],
  supplements: [String],
  userDailyData: {
    type: Map,
    of: {
      steps: Number,
      water: Number,
      weight: Number,
      bloodPressure: [Number],
      log: [String],
      exercises: [String],
      stepsLog: [Number],
      moods: [String],
      symptoms: [String]
    }
  }
});
const HealthData = mongoose.model('HealthData', healthDataSchema);

// Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Login Route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user._id, username }, JWT_SECRET, { expiresIn: '24h' });
    console.log(`[${new Date().toISOString()}] POST /api/login - Generated JWT: { id: ${user._id}, username: '${username}' }`);
    res.status(200).json({ token });
  } else {
    res.sendStatus(401);
  }
});

// Log Weight Route (Updated to Float)
app.post('/api/logWeight', authenticateToken, async (req, res) => {
  const { weight } = req.body;
  const parsedWeight = parseFloat(weight);
  if (isNaN(parsedWeight)) {
    return res.status(400).json({ error: 'Weight must be a number' });
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const healthData = await HealthData.findOneAndUpdate(
      { id: 'userData' },
      {
        $set: {
          [`userDailyData.${today}.weight`]: parsedWeight,
          [`userDailyData.${today}.log`]: [`Weight: ${parsedWeight} lbs`]
        }
      },
      { upsert: true, new: true }
    );

    console.log(`[${new Date().toISOString()}] POST /api/logWeight - Weight saved: ${parsedWeight}`);
    res.status(200).json({ message: 'Weight logged' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Data Route
app.get('/api/data', authenticateToken, async (req, res) => {
  try {
    const healthData = await HealthData.findOne({ id: 'userData' });
    const data = healthData ? healthData.toObject() : { userDailyDataKeys: [], supplementCount: 0, foodCount: 0 };
    if (healthData) {
      data.supplementCount = healthData.supplements.length;
      data.foodCount = healthData.foods.length;
    }
    console.log(`[${new Date().toISOString()}] GET /api/data - Loaded from MongoDB healthsync.userData:`, data);
    console.log(`[${new Date().toISOString()}] GET /api/data - Sending MongoDB data to client:`, data);
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));