// routes/employee.js
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

const isEmployee = (req, res, next) => {
    if (req.session.userId && req.session.role === 'employee') { next(); } 
    else { res.status(403).json({ error: 'Access Denied: Employee role required.' }); }
};

router.use(isEmployee);

// routes/employee.js (Inside router.get('/dashboard', ...))

router.get('/dashboard', async (req, res) => {
    try {
        // REVERT: Query tasks where assignedTo field DIRECTLY equals the user's ID
        const tasks = await Task.find({ assignedTo: req.session.userId }).sort({ deadline: 1 });
        
        res.json({ tasks, employeeName: req.session.name });
    } catch (err) {
        res.status(500).json({ error: 'Server Error loading dashboard data.' });
    }
});

router.post('/tasks/:taskId/update', async (req, res) => {
    const { taskId } = req.params;
    const { action } = req.body; 
    let newStatus;

    if (action === 'accept') newStatus = 'Accepted';
    else if (action === 'reject') newStatus = 'Rejected';
    else if (action === 'complete') newStatus = 'Completed';
    else return res.status(400).json({ error: 'Invalid task action.' });

    try {
        const task = await Task.findOneAndUpdate(
            { _id: taskId, assignedTo: req.session.userId },
            { status: newStatus },
            { new: true } 
        );

        if (!task) { return res.status(404).json({ error: 'Task not found or not assigned to you.' }); }

        res.json({ message: `Task status updated to ${newStatus}` });
    } catch (err) {
        res.status(500).json({ error: 'Server Error updating task status.' });
    }
});

module.exports = router;