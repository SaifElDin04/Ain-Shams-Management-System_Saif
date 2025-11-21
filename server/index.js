
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load only the root .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

const UPLOAD_DIR = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = express();
app.use(cors({
  origin: (origin, cb) => cb(null, true),
  credentials: true,
  exposedHeaders: ['Content-Disposition', 'X-Total-Count'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Staff-Id', 'X-Staff-Token', 'X-Requested-With'],
}));
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

// Track Mongo status and limit retries
let mongoConnected = false;
let mongoFailed = false;
let connectAttempts = 0;
const MAX_ATTEMPTS = 5;

// Connect to MongoDB with retry and force IPv4 (family: 4)
const connectWithRetry = () => {
  if (mongoFailed) return;
  connectAttempts += 1;
  console.log(`Attempting MongoDB connection to ${MONGO_URI} (attempt ${connectAttempts}/${MAX_ATTEMPTS}) ...`);
  mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    family: 4,
  })
    .then(() => {
      mongoConnected = true;
      app.set('mongoConnected', true);
      app.set('mongoFailed', false);
      console.log('MongoDB connected');
    })
    .catch((err) => {
      mongoConnected = false;
      app.set('mongoConnected', false);
      console.error('MongoDB connection error', err.message || err);
      if (connectAttempts >= MAX_ATTEMPTS) {
        mongoFailed = true;
        app.set('mongoFailed', true);
        console.error(`MongoDB connection failed after ${MAX_ATTEMPTS} attempts. Server will run in in-memory fallback mode. Start MongoDB and restart the server to enable persistence.`);
      } else {
        console.log(`Retrying MongoDB connection in 3s...`);
        setTimeout(connectWithRetry, 3000);
      }
    });
};
connectWithRetry();

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/curriculum', courseRoutes);
app.use('/api/applications', applicationRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
