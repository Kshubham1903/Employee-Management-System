// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// --- CRITICAL DEPLOYMENT SETTINGS ---
app.set('trust proxy', 1);
// ------------------------------------

// --- Middleware Setup ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production' ? true : false, 
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

// --- Database Connection ---
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));


// --- Import Routes ---
const authRoutes = require('./routes/auth'); 
const adminRoutes = require('./routes/admin'); 
const employeeRoutes = require('./routes/employee');

// --- Use Routes ---
app.use('/', authRoutes); 
app.use('/api/admin', adminRoutes);
app.use('/api/employee', employeeRoutes);

// --- Frontend (Vite) Integration ---
const buildPath = path.join(__dirname, 'frontend/dist');
app.use(express.static(buildPath));

// Fallback for client-side routing
app.get('/', (req, res) => {
    if (req.url.startsWith('/api') || req.url.startsWith('/login') || req.url.startsWith('/register')) {
         return res.status(404).json({ message: 'API endpoint not found' });
    }
    res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});