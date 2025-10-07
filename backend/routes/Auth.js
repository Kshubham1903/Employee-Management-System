
const express = require('express');
const router = express.Router(); 

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Helper for session check (Used by /me route for profile data)
const middlewareIsAuth = (req, res, next) => {
    if (req.session.userId) { next(); } 
    else { res.status(401).json({ error: 'Unauthorized: Please log in.' }); }
};

// --- Nodemailer Setup ---
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// --- AUTHENTICATION ROUTES ---

router.post('/register', async (req, res) => {
    // Includes secretToken from the frontend form
    const { username, password, email, name, secretToken } = req.body; 
    
    if (!username || !password || !email || !name) { return res.status(400).json({ error: 'All required fields are missing.' }); }

    try {
        if (await User.findOne({ $or: [{ username }, { email }] })) { return res.status(400).json({ error: 'Username or Email already exists.' }); }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        let userRole = 'pending';
        let isApproved = false;
        
        // --- ADMIN TOKEN CHECK ---
        if (secretToken && secretToken.length > 0) {
            if (secretToken === process.env.ADMIN_SECRET_TOKEN) {
                userRole = 'admin';
                isApproved = true; // Admin is automatically approved
            } else {
                return res.status(401).json({ error: 'Invalid secret token for Admin registration.' });
            }
        } 
        // -------------------------
        
        const user = new User({ username, password: hashedPassword, email, name, role: userRole, isApproved: isApproved });
        await user.save();
        
        if (isApproved) {
            // Admin logs in immediately
            req.session.userId = user._id;
            req.session.role = user.role;
            req.session.name = user.name;
            return res.status(201).json({ message: 'Admin account created and logged in.', user: { id: user._id, name: user.name, role: user.role } });
        } else {
            // Employee needs approval
            return res.status(202).json({ message: 'Registration successful. Your account is pending Admin approval.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error during registration.' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        
        // 1. Check if user exists and password matches
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid Credentials.' });
        }
        
        // 2. Check for Approval Status (Causes 403 Access Denied if false)
        if (!user.isApproved) {
            return res.status(403).json({ error: 'Account not yet approved. Please wait for authorization.' });
        }

        // 3. Successful Login: Create Session
        req.session.userId = user._id;
        req.session.role = user.role; 
        req.session.name = user.name;

        res.json({ message: 'Login successful', user: { id: user._id, name: user.name, role: user.role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error during login.' });
    }
});

router.get('/check-auth', (req, res) => {
    if (req.session.userId) { return res.json({ isAuthenticated: true, user: { id: req.session.userId, name: req.session.name, role: req.session.role }}); }
    res.json({ isAuthenticated: false });
});

router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) { return res.status(500).json({ error: 'Could not log out.' }); }
        res.clearCookie('connect.sid'); 
        res.json({ message: 'Logged out successfully' });
    });
});

// --- PROFILE ROUTES (Used by frontend components to fetch user details) ---
router.get('/me', middlewareIsAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).select('-password'); 
        if (!user) { return res.status(404).json({ error: 'User not found.' }); }
        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching user data.' });
    }
});

// --- FORGOT PASSWORD ROUTES ---
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) { return res.json({ message: 'If the email is registered, a password reset link has been sent.' }); }

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        const mailOptions = {
            to: user.email, from: process.env.EMAIL_USER, subject: 'Optimistic TaskFlow Password Reset',
            text: `Please click on the following link, or paste this into your browser to complete the process:\n\n${resetURL}\n\n`
        };
        await transporter.sendMail(mailOptions);
        res.json({ message: 'If the email is registered, a password reset link has been sent.' });
    } catch (err) {
        res.status(500).json({ error: 'Error resetting password.' });
    }
});

router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) { return res.status(400).json({ error: 'Password reset token is invalid or has expired.' }); }
        if (!newPassword || newPassword.length < 6) { return res.status(400).json({ error: 'New password must be at least 6 characters long.' }); }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password has been successfully reset. You can now log in.' });
    } catch (err) {
        res.status(500).json({ error: 'Error resetting password.' });
    }
});

module.exports = router;