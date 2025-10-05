// frontend/src/components/NotificationCenter.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { createPortal } from 'react-dom';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    
    const fetchNotifications = useCallback(async () => {
        try {
            const res = await axios.get('/api/admin/notifications');
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        }
    }, []);

    const markAllAsRead = async () => {
        try {
            if (unreadCount > 0) {
                await axios.post('/api/admin/notifications/mark-read');
                setUnreadCount(0); // Optimistic UI update
            }
        } catch (err) {
            console.error("Error marking as read:", err);
        }
    };
    
    const handleDeleteNotification = async (notificationId) => {
        if (!window.confirm("Delete this notification permanently?")) return;
        
        try {
            await axios.delete(`/api/admin/notifications/${notificationId}`);
            // Update UI by filtering out the deleted notification
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
            // Check and adjust unread count if the deleted one was unread (requires full refetch for accurate count)
            fetchNotifications(); 
        } catch (err) {
            alert("Failed to delete notification.");
            console.error("Error deleting notification:", err);
        }
    };
    
    // --- NEW: Handle clearing the entire list ---
    const handleClearAll = async () => {
        if (!window.confirm("Are you sure you want to delete ALL notifications? This action cannot be undone.")) return;
        
        try {
            await axios.delete('/api/admin/notifications/all');
            setNotifications([]); // Clear the list immediately
            setUnreadCount(0);
            alert("All notifications successfully cleared!");
        } catch (err) {
            alert("Failed to clear all notifications.");
        }
    };
    // -------------------------------------------

    // Fetch notifications on mount and periodically
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); 
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleIconClick = () => {
        setIsOpen(true);
        markAllAsRead(); // Mark as read when the user opens the modal
    };
    
    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    };

    // --- MODAL RENDERING LOGIC ---
    const NotificationModal = ({ notifications, onClose }) => {
        if (!notifications) return null;

        return createPortal(
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm"
                onClick={onClose} 
            >
                <div 
                    className="bg-white w-full max-w-xl max-h-[90vh] rounded-xl shadow-2xl transform transition-all duration-300 ease-out scale-100"
                    onClick={(e) => e.stopPropagation()} 
                >
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <p className="text-xl font-bold text-primary-blue">Admin Activity Feed</p>
                        <button onClick={onClose} className="text-gray-500 hover:text-red-600 transition">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto divide-y divide-gray-100">
                        {notifications.length === 0 ? (
                            <p className="p-10 text-lg text-gray-500 text-center">No recent employee activity to show.</p>
                        ) : (
                            notifications.map((n) => (
                                <div 
                                    key={n._id} 
                                    className={`px-6 py-4 border-b flex justify-between items-start transition hover:bg-gray-50 
                                                ${!n.isRead ? 'bg-indigo-50/50 font-semibold' : 'bg-white font-normal'}`}
                                >
                                    <div className='flex-grow pr-4'>
                                        <p className="text-sm text-gray-800">{n.message}</p>
                                        <p className="text-xs text-gray-500 mt-1">{timeAgo(n.createdAt)}</p>
                                    </div>
                                    
                                    {/* DELETE BUTTON - Individual Delete */}
                                    <button 
                                        onClick={() => handleDeleteNotification(n._id)}
                                        className="ml-4 p-1 rounded-full text-red-500 hover:text-white hover:bg-red-500 transition duration-200"
                                        title="Delete Notification"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10H8a1 1 0 00-1 1v1h10v-1a1 1 0 00-1-1z"></path></svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="px-6 py-3 border-t flex justify-center space-x-4">
                        <button 
                            onClick={handleClearAll} 
                            className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition"
                        >
                            Clear All Notifications
                        </button>
                        <button 
                            onClick={onClose} 
                            className="text-sm bg-gray-200 text-gray-800 px-4 py-2 rounded-lg shadow-md hover:bg-gray-300 transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    // --- MAIN RENDER ---
    return (
        <div className="relative z-50">
            {/* Notification Icon and Badge */}
            <button 
                onClick={handleIconClick}
                className="p-2 rounded-full text-gray-600 hover:text-primary-blue transition relative"
                title="Notifications"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.446L4 17h5m6 0v1a3 3 0 11-6 0v-1" /></svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Modal is rendered only if isOpen is true */}
            {isOpen && <NotificationModal notifications={notifications} onClose={() => setIsOpen(false)} />}
        </div>
    );
};

export default NotificationCenter;