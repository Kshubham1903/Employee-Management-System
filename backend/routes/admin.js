// // routes/admin.js
// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const Task = require('../models/Task');
// const bcrypt = require('bcryptjs');

// // --- Middleware Check: Only Admin can access these routes ---
// const isAdmin = (req, res, next) => {
//     if (req.session.userId && req.session.role === 'admin') {
//         next();
//     } else {
//         res.status(403).json({ error: 'Access Denied: Admin role required.' });
//     }
// };

// router.use(isAdmin); // Apply Admin middleware to all routes in this file

// // --- Standard Admin Routes (Task Management) ---
// router.get('/dashboard', async (req, res) => {
//     try {
//         const tasks = await Task.find().populate('assignedTo', 'name username').sort({ createdAt: -1 });
//         const employees = await User.find({ role: 'employee', isApproved: true }).select('_id name username'); 
//         res.json({ tasks, employees, adminName: req.session.name });
//     } catch (err) {
//         res.status(500).json({ error: 'Server Error loading dashboard data.' });
//     }
// });
// // ... (rest of Task CRUD routes: POST /tasks, DELETE /tasks/:taskId)

// // --- Employee View Routes ---
// router.get('/employees/all', async (req, res) => {
//     try {
//         const employees = await User.find({ isApproved: true }).select('-password -resetPasswordToken -resetPasswordExpires');
//         res.json({ employees });
//     } catch (err) {
//         res.status(500).json({ error: 'Server error fetching employee list.' });
//     }
// });

// // --- User Management (Approval & Edit) Routes ---

// router.get('/pending-users', async (req, res) => {
//     try {
//         // Fetch all users awaiting approval
//         const pendingUsers = await User.find({ isApproved: false }).select('-password');
//         res.json({ users: pendingUsers });
//     } catch (err) {
//         res.status(500).json({ error: 'Server error fetching pending users.' });
//     }
// });

// // Approve/Assign Role
// router.post('/user/approve/:userId', async (req, res) => {
//     const { userId } = req.params;
//     const { newRole } = req.body; 

//     // Admin can only approve users as 'employee'
//     if (newRole !== 'employee') {
//         return res.status(403).json({ error: 'Admin can only approve users as "employee".' });
//     }

//     try {
//         const user = await User.findByIdAndUpdate(userId, 
//             { role: newRole, isApproved: true }, 
//             { new: true, runValidators: true } 
//         ).select('-password');

//         if (!user) { return res.status(404).json({ error: 'User not found.' }); }
//         res.json({ message: `User ${user.name} approved as ${newRole}.`, user });
//     } catch (err) {
//         res.status(500).json({ error: 'Server error during user approval.' });
//     }
// });

// // DELETE Employee
// router.delete('/user/:userId', async (req, res) => {
//     try {
//         if (req.params.userId === req.session.userId) { return res.status(400).json({ error: 'Cannot delete own Admin account.' }); }
        
//         const result = await User.findByIdAndDelete(req.params.userId);
        
//         if (!result) { return res.status(404).json({ error: 'User not found.' }); }
        
//         await Task.deleteMany({ assignedTo: req.params.userId });

//         res.json({ message: 'Employee deleted and associated tasks cleared successfully!' });
//     } catch (err) {
//         res.status(500).json({ error: 'Server error during employee deletion.' });
//     }
// });

// // UPDATE Employee Details and Password (Admin can manage others' accounts)
// router.post('/user/update/:userId', async (req, res) => {
//     const { name, email, newRole, newPassword } = req.body;
//     const userId = req.params.userId;

//     try {
//         const user = await User.findById(userId);
//         if (!user) { return res.status(404).json({ error: 'User not found.' }); }

//         if (name) user.name = name;
//         if (email) user.email = email;
        
//         // Admin can promote/demote (must use 'admin' or 'employee')
//         if (newRole && ['admin', 'employee'].includes(newRole)) { 
//             user.role = newRole;
//         }

//         if (newPassword) {
//             user.password = await bcrypt.hash(newPassword, 10);
//         }

//         await user.save();
        
//         const updatedUser = user.toObject();
//         delete updatedUser.password;
        
//         res.json({ message: 'Employee profile updated successfully!', user: updatedUser });

//     } catch (err) {
//         if (err.code === 11000) { return res.status(400).json({ error: 'Email or Username already in use.' }); }
//         res.status(500).json({ error: 'Server error during update.' });
//     }
// });

// module.exports = router;
// routes/admin.js
const express = require('express');
const router = express.Router(); // <--- FIX APPLIED

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

router.post('/tasks', async (req, res) => {
    const { title, description, deadline, assignedTo } = req.body;
    if (!title || !description || !deadline || !assignedTo) { return res.status(400).json({ error: 'All task fields are required.' }); }

    try {
        const newTask = new Task({ title, description, deadline: new Date(deadline), assignedTo, adminCreatedBy: req.session.userId });
        await newTask.save();
        res.status(201).json({ message: 'Task created successfully!' });
    } catch (err) {
        // Log error detail in terminal for debugging purposes
        console.error("Task Creation Error:", err.message); 
        res.status(500).json({ error: 'Server Error creating task.' });
    }
});

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

module.exports = router;