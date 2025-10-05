// routes/employee.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Task = require('../models/Task');
const Notification = require('../models/Notification'); 

const isEmployee = (req, res, next) => {
    if (req.session.userId && req.session.role === 'employee') {
        next();
    } else {
        res.status(403).json({ error: 'Access Denied: Employee role required.' });
    }
};

router.use(isEmployee); 

// --- EMPLOYEE DASHBOARD (SHOW ADMIN NAME) ---
router.get('/dashboard', async (req, res) => {
    try {
        // CRITICAL FIX: Populate adminCreatedBy to display Admin Name on employee dashboard
        const tasks = await Task.find({ assignedTo: req.session.userId })
                                 .populate('adminCreatedBy', 'name') 
                                 .sort({ deadline: 1 });
        
        res.json({ tasks, employeeName: req.session.name });
    } catch (err) {
        res.status(500).json({ error: 'Server Error loading dashboard data.' });
    }
});

// --- TASK ACTION (ACCEPT/REJECT/COMPLETE) & NOTIFICATION CREATION ---
router.post('/tasks/:taskId/update', async (req, res) => {
    const { taskId } = req.params;
    const { action } = req.body; 
    let newStatus;

    if (action === 'accept') newStatus = 'Accepted';
    else if (action === 'reject') newStatus = 'Rejected';
    else if (action === 'complete') newStatus = 'Completed';
    else return res.status(400).json({ error: 'Invalid task action.' });

    try {
        // 1. Update the task status and populate admin ID for notification targeting
        const task = await Task.findOneAndUpdate(
            { _id: taskId, assignedTo: req.session.userId },
            { status: newStatus },
            { new: true } 
        ).populate('adminCreatedBy', '_id'); 

        if (!task) { return res.status(404).json({ error: 'Task not found or not assigned to you.' }); }

        // 2. Generate and Send Notification to Admin
        const senderName = req.session.name;
        const adminId = task.adminCreatedBy._id;
        
        const message = `${senderName} has ${action}d task: "${task.title}". New status: ${newStatus}.`;

        const newNotification = new Notification({
            recipient: adminId,
            senderName: senderName,
            message: message,
            taskId: taskId
        });
        await newNotification.save();
        // ---------------------------------------------

        res.json({ message: `Task status updated to ${newStatus}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error updating task status.' });
    }
});

// --- Employee Notification Routes (Unread Count and Mark Read) ---
// routes/employee.js (CRITICAL FIX for Employee Notification Data)

router.get('/notifications/count', async (req, res) => {
    const userId = req.session.userId;
    try {
        // Fetch tasks that are unread AND populate the Admin name 
        const unreadTasks = await Task.find({ 
            assignedTo: userId, 
            isRead: false 
        })
        .populate('adminCreatedBy', 'name') // <-- CRITICAL: Populates Admin name
        .select('title adminCreatedBy deadline'); // Select only necessary fields
        
        // Return both the list of tasks (for the modal display) and the count
        res.json({ 
            tasks: unreadTasks, 
            count: unreadTasks.length 
        });
    } catch (err) {
        console.error("Employee Notification Count Error:", err);
        res.status(500).json({ error: 'Failed to fetch notification count.' });
    }
});

router.post('/notifications/mark-read', isEmployee, async (req, res) => {
    const userId = req.session.userId;
    try {
        const result = await Task.updateMany({ assignedTo: userId, isRead: false }, { $set: { isRead: true } });
        res.json({ message: `Marked ${result.nModified} tasks as read.` });
    } catch (err) {
        res.status(500).json({ error: 'Failed to mark notifications as read.' });
    }
});

module.exports = router;