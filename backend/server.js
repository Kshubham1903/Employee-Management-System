// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const cors = require('cors'); // <-- CRITICAL: For cross-origin requests
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// --- CORS Configuration (CRITICAL FIX) ---
// Whitelist your Vercel URL and localhost for secure cross-origin requests.
const allowedOrigins = [
    'http://localhost:5173', 
    'https://employee-management-system-delta-three.vercel.app', // <-- YOUR LIVE VERCEL URL
    // Add your Render URL here if you encounter issues making calls to Render's internal API domain
    // Example: 'https://optimistic-taskflow-api.onrender.com' 
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin: ' + origin;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true, // MUST be true for session cookies to be sent across domains
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
// ------------------------------------------

// --- CRITICAL DEPLOYMENT SETTINGS ---
// 1. Tell Express to trust the proxy (REQUIRED for platforms like Render/Vercel)
app.set('trust proxy', 1);
// ------------------------------------

// --- Middleware Setup ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// 2. Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24, 
        httpOnly: true, 
        // Must be TRUE in production (HTTPS)
        secure: process.env.NODE_ENV === 'production' ? true : false, 
        // Set to 'none' for cross-origin deployment (Vercel/Render)
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
    if (req.url.startsWith('/api') || req.url.startsWith('/login') || req.url.startsWith('/register')) {
         return res.status(404).json({ message: 'API endpoint not found' });
    }
    res.sendFile(path.join(buildPath, 'index.html'));
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});