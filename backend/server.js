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
// 1. Tell Express to trust the external proxy (REQUIRED for platforms like Render/Vercel)
app.set('trust proxy', 1);
// ------------------------------------

// --- Middleware Setup ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// 2. Session middleware (Includes FIX for cross-origin local dev)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        httpOnly: true, 
        // Must be TRUE in production for HTTPS cookies
        secure: process.env.NODE_ENV === 'production' ? true : false, 
        // Set to 'lax' for local development (different ports)
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

// --- Database Connection ---
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));


// --- Import and Use Routes ---
const authRoutes = require('./routes/auth'); 
const adminRoutes = require('./routes/admin'); 
const employeeRoutes = require('./routes/employee');

app.use('/', authRoutes); 
app.use('/api/admin', adminRoutes);
app.use('/api/employee', employeeRoutes);

// --- Frontend (Vite) Integration ---
const buildPath = path.join(__dirname, 'frontend/dist');
app.use(express.static(buildPath));

// Final Fallback for client-side routing (Vite HTML file)
app.get('/', (req, res) => {
    // Prevent API routes from accidentally hitting the index.html fallback
    if (req.url.startsWith('/api') || req.url.startsWith('/login') || req.url.startsWith('/register')) {
         return res.status(404).json({ message: 'API endpoint not found' });
    }
    res.sendFile(path.join(buildPath, 'index.html'));
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});