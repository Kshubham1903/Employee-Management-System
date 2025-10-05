// frontend/src/components/EmployeeNotificationCenter.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { createPortal } from 'react-dom';

const EmployeeNotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    
    // Fetch notifications (unread tasks)
    const fetchNotifications = useCallback(async () => {
        try {
            const res = await axios.get('/api/employee/notifications/count');
            setNotifications(res.data.tasks || []); 
            setUnreadCount(res.data.count);
        } catch (err) {
            console.error("Error fetching employee notifications:", err);
            setUnreadCount(0);
        }
    }, []);

    // Function to perform the mark as read API call
    const performMarkAsRead = async () => {
        try {
            if (unreadCount > 0) {
                await axios.post('/api/employee/notifications/mark-read');
            }
        } catch (err) {
            console.error("Error marking as read:", err);
        }
    };


    // Handler for the "Mark All Read & Close" button
    const handleMarkReadAndClose = async () => {
        await performMarkAsRead();
        setIsOpen(false);
        setUnreadCount(0); // Clear badge immediately
    };
    
    // --- NEW HANDLER FOR DELETION/CLEARANCE ---
    const handleClearAllAlerts = async () => {
        if (!window.confirm("Mark all new task alerts as read? This will clear the badge count and dismiss alerts.")) return;
        
        // This performs the action and updates the UI
        await handleMarkReadAndClose();
    };
    // ----------------------------------------

    // Initial fetch and continuous polling
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); 
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleIconClick = () => {
        setIsOpen(true);
    };

    // Helper to format date nicely
    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        return "Just now";
    };

    // --- MODAL RENDERING LOGIC ---
    const NotificationModal = ({ tasks, onClose, onMarkRead }) => {
        if (!tasks) return null;

        return createPortal(
            // Backdrop
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm"
                onClick={onClose} 
            >
                {/* Modal Container */}
                <div 
                    className="bg-white w-full max-w-xl max-h-[90vh] rounded-xl shadow-2xl transform transition-all duration-300 ease-out scale-100"
                    onClick={(e) => e.stopPropagation()} 
                >
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <p className="text-xl font-bold text-primary-blue">New Task Assignments</p>
                        <button onClick={onClose} className="text-gray-500 hover:text-red-600 transition">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto divide-y divide-gray-100">
                        {tasks.length === 0 ? (
                            <p className="p-10 text-lg text-gray-500 text-center">You have no new task alerts.</p>
                        ) : (
                            tasks.map((task) => (
                                <div 
                                    key={task._id} 
                                    className="px-6 py-4 border-b bg-indigo-50/50 hover:bg-indigo-100 transition"
                                >
                                    <p className="text-sm font-bold text-gray-800">
                                        🔔 Task: {task.title}
                                    </p>
                                    <p className="text-xs text-indigo-600 mt-1">
                                        Assigned by: {task.adminCreatedBy?.name || 'Admin'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Deadline: {new Date(task.deadline).toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* --- FIXED: MODAL FOOTER WITH BOTH BUTTONS --- */}
                    <div className="px-6 py-3 border-t flex justify-between items-center space-x-4">
                        
                        {/* 1. Delete All Button (Simulates clearing the read alerts) */}
                        <button 
                            onClick={handleClearAllAlerts} 
                            className="text-sm bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition"
                        >
                            Delete All Alerts
                        </button>
                        
                        {/* 2. Mark Read and Continue Button */}
                        <button 
                            onClick={handleMarkReadAndClose} 
                            className="text-sm bg-accent-teal text-white px-4 py-2 rounded-lg shadow-md hover:bg-teal-600 transition"
                        >
                            Mark All Read & Close
                        </button>
                    </div>
                    {/* ------------------------------------------- */}
                </div>
            </div>,
            document.body
        );
    };

    // --- MAIN RENDER (Icon) ---
    return (
        <div className="relative">
            {/* Notification Icon and Badge */}
            <button 
                onClick={handleIconClick}
                className="p-2 rounded-full text-gray-600 hover:text-primary-blue transition relative"
                title="New Task Alerts"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.446L4 17h5m6 0v1a3 3 0 11-6 0v-1" /></svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Modal is rendered only if isOpen is true */}
            {isOpen && <NotificationModal 
                tasks={notifications} 
                onClose={() => setIsOpen(false)} 
                onMarkRead={handleMarkReadAndClose}
            />}
        </div>
    );
};

export default EmployeeNotificationCenter;