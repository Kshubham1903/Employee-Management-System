// routes/admin.js
const express = require('express');
const router = express.Router(); // <--- FIX APPLIED
const Notification = require('../models/Notification'); // NEW IMPORT

const User = require('../models/User');
const Task = require('../models/Task');
const bcrypt = require('bcryptjs');

// --- Middleware Check: Only Admin can access these routes ---
const isAdmin = (req, res, next) => {
    if (req.session.userId && req.session.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access Denied: Admin role required.' });
    }
};

router.use(isAdmin); // Apply Admin middleware to all routes in this file



router.delete('/notifications/all', isAdmin, async (req, res) => { // <-- CRITICAL FIX: isAdmin ADDED
    try {
        const result = await Notification.deleteMany({ 
            recipient: req.session.userId 
        });

        if (result.deletedCount === 0) {
            // It's still a successful operation if there was nothing to delete
            return res.json({ message: 'No notifications found to clear.' });
        }

        res.json({ message: `${result.deletedCount} notifications cleared.` });
    } catch (err) {
        console.error("Error clearing all notifications:", err);
        res.status(500).json({ error: 'Failed to clear all notifications.' });
    }
});




router.delete('/notifications/:notificationId', isAdmin, async (req, res) => {
    const { notificationId } = req.params;
    try {
        // Ensure the notification belongs to the logged-in admin before deleting
        const result = await Notification.deleteOne({ 
            _id: notificationId, 
            recipient: req.session.userId 
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Notification not found or access denied.' });
        }

        res.json({ message: 'Notification deleted.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete notification.' });
    }
});
// --- Standard Admin Routes (Task Management) ---
router.get('/dashboard', async (req, res) => {
    try {
        const tasks = await Task.find().populate('assignedTo', 'name username').sort({ createdAt: -1 });
        const employees = await User.find({ role: 'employee', isApproved: true }).select('_id name username'); 
        res.json({ tasks, employees, adminName: req.session.name });
    } catch (err) {
        res.status(500).json({ error: 'Server Error loading dashboard data.' });
    }
});

// routes/admin.js (Inside router.post('/tasks', ...))

router.post('/tasks', async (req, res) => {
    // assignedTo is now a single ID string
    const { title, description, deadline, assignedTo } = req.body; 
    
    // Validation check ensures assignedTo is present (it will be a single string ID)
    if (!title || !description || !deadline || !assignedTo) { 
        return res.status(400).json({ error: 'All task fields and one employee assignment are required.' }); 
    }

    try {
        const newTask = new Task({ 
            title, 
            description, 
            deadline: new Date(deadline), 
            assignedTo: assignedTo, // Pass the single ID directly
            adminCreatedBy: req.session.userId 
        });
        await newTask.save();
        res.status(201).json({ message: 'Task created successfully!' });
    } catch (err) {
        console.error("Task Creation Error:", err.message); 
        res.status(500).json({ error: 'Server Error creating task.' });
    }
});

// router.post('/tasks', async (req, res) => {
//     // assignedTo will now be an array from the frontend form
//     const { title, description, deadline, assignedTo } = req.body; 
    
//     // Validation: Check if assignedTo exists and has at least one element
//     if (!title || !description || !deadline || !assignedTo || assignedTo.length === 0) { 
//         return res.status(400).json({ error: 'All task fields and at least one employee assignment are required.' }); 
//     }

//     try {
//         const newTask = new Task({ 
//             title, 
//             description, 
//             deadline: new Date(deadline), 
//             // Ensure the input is treated as an array before saving to MongoDB
//             assignedTo: Array.isArray(assignedTo) ? assignedTo : [assignedTo], 
//             adminCreatedBy: req.session.userId 
//         });
//         await newTask.save();
//         res.status(201).json({ message: 'Task created successfully!' });
//     } catch (err) {
//         console.error("Task Creation Error:", err.message); 
//         res.status(500).json({ error: 'Server Error creating task.' });
//     }
// });


router.delete('/tasks/:taskId', async (req, res) => {
    const { taskId } = req.params;
    try {
        const result = await Task.findByIdAndDelete(taskId);
        if (!result) { return res.status(404).json({ error: 'Task not found.' }); }
        res.json({ message: 'Task deleted successfully!' });
    } catch (err) {
        res.status(500).json({ error: 'Server Error deleting task.' });
    }
});

// --- Employee View Routes ---
router.get('/employees/all', async (req, res) => {
    try {
        const employees = await User.find({ isApproved: true }).select('-password -resetPasswordToken -resetPasswordExpires');
        res.json({ employees });
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching employee list.' });
    }
});

// --- User Management (Approval & Edit) Routes ---

router.get('/pending-users', async (req, res) => {
    try {
        const pendingUsers = await User.find({ isApproved: false }).select('-password');
        res.json({ users: pendingUsers });
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching pending users.' });
    }
});

// Approve/Assign Role
router.post('/user/approve/:userId', async (req, res) => {
    const { userId } = req.params;
    const { newRole } = req.body; 

    if (newRole !== 'employee') {
        return res.status(403).json({ error: 'Admin can only approve users as "employee".' });
    }

    try {
        const user = await User.findByIdAndUpdate(userId, 
            { role: newRole, isApproved: true }, 
            { new: true, runValidators: true } 
        ).select('-password');

        if (!user) { return res.status(404).json({ error: 'User not found.' }); }
        res.json({ message: `User ${user.name} approved as ${newRole}.`, user });
    } catch (err) {
        res.status(500).json({ error: 'Server error during user approval.' });
    }
});

// DELETE Employee
router.delete('/user/:userId', async (req, res) => {
    try {
        if (req.params.userId === req.session.userId) { return res.status(400).json({ error: 'Cannot delete own Admin account.' }); }
        
        const result = await User.findByIdAndDelete(req.params.userId);
        
        if (!result) { return res.status(404).json({ error: 'User not found.' }); }
        
        await Task.deleteMany({ assignedTo: req.params.userId });

        res.json({ message: 'Employee deleted and associated tasks cleared successfully!' });
    } catch (err) {
        res.status(500).json({ error: 'Server error during employee deletion.' });
    }
});

// UPDATE Employee Details and Password (Admin can manage others' accounts)
router.post('/user/update/:userId', async (req, res) => {
    const { name, email, newRole, newPassword } = req.body;
    const userId = req.params.userId;

    try {
        const user = await User.findById(userId);
        if (!user) { return res.status(404).json({ error: 'User not found.' }); }

        if (name) user.name = name;
        if (email) user.email = email;
        
        // Admin can promote/demote
        if (newRole && ['admin', 'employee'].includes(newRole)) { 
            user.role = newRole;
        }

        if (newPassword) {
            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();
        
        const updatedUser = user.toObject();
        delete updatedUser.password;
        
        res.json({ message: 'Employee profile updated successfully!', user: updatedUser });

    } catch (err) {
        if (err.code === 11000) { return res.status(400).json({ error: 'Email or Username already in use.' }); }
        res.status(500).json({ error: 'Server error during update.' });
    }
});

router.get('/notifications', isAdmin, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.session.userId })
            .sort({ createdAt: -1 })
            .limit(20); 
        
        const unreadCount = await Notification.countDocuments({ recipient: req.session.userId, isRead: false });

        res.json({ notifications, unreadCount });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch notifications.' });
    }
});

// router.post('/notifications/mark-read', isAdmin, async (req, res) => {
//     try {
//         await Notification.updateMany(
//             { recipient: req.session.userId, isRead: false },
//             { $set: { isRead: true } }
//         );
//         res.json({ message: 'Notifications marked as read.' });
//     } catch (err) {
//         res.status(500).json({ error: 'Failed to mark notifications as read.' });
//     }
// });

router.post('/notifications/mark-read', isAdmin, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.session.userId, isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ message: 'Notifications marked as read.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to mark notifications as read.' });
    }
});

// --- NEW: DELETE SINGLE NOTIFICATION (One-Click Delete) ---


module.exports = router;