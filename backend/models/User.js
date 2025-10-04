// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    
    role: { 
        type: String, 
        enum: ['admin', 'employee', 'pending'], 
        required: true,
        default: 'pending'
    },
    isApproved: { 
        type: Boolean,
        default: false
    },
    name: { type: String, required: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date 
});

module.exports = mongoose.model('User', UserSchema);