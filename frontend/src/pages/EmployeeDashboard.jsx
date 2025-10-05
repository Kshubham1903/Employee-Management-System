// frontend/src/pages/EmployeeDashboard.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react'; // Added useRef
import axios from 'axios';
import { useAuth } from '../AuthContext';
import StatusPill from '../components/StatusPill';
import StatCard from '../components/StatCard';
import { Link } from 'react-router-dom'; 
import { createPortal } from 'react-dom'; // CRITICAL: Import createPortal

// --- MODAL RENDERING LOGIC ---
const EmployeeNotificationModal = ({ tasks, onClose, onMarkRead }) => {
    if (!tasks) return null;

    return createPortal(
        // Backdrop: Fixed position, full screen, semi-transparent black
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm"
            onClick={onClose} // Close modal when clicking outside
        >
            {/* Modal Container: Centered, specific width, handles internal scrolling */}
            <div 
                className="bg-white w-full max-w-xl max-h-[90vh] rounded-xl shadow-2xl transform transition-all duration-300 ease-out scale-100"
                onClick={(e) => e.stopPropagation()} // Prevents click inside from closing modal
            >
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <p className="text-xl font-bold text-primary-blue">New Task Assignments</p>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-600 transition">
                        {/* Close Icon (X) */}
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

                <div className="px-6 py-3 border-t text-center">
                    <button 
                        onClick={onMarkRead} 
                        className="text-sm bg-accent-teal text-white px-4 py-2 rounded-lg shadow-md hover:bg-teal-600 transition"
                    >
                        Mark All Read & Continue
                    </button>
                </div>
            </div>
        </div>,
        document.body // Renders the modal outside the root component
    );
};
// --- END MODAL LOGIC ---


function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0); 
  const [unreadTasksList, setUnreadTasksList] = useState([]); // List for the modal
  const [isAlertOpen, setIsAlertOpen] = useState(false); // Modal visibility state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const alertRef = useRef(null); // Not strictly needed with createPortal but good practice

  const fetchNotificationCount = useCallback(async () => {
      try {
          const res = await axios.get('/api/employee/notifications/count');
          setUnreadCount(res.data.count);
          // Assuming the backend sends the list of tasks to be displayed here
          setUnreadTasksList(res.data.tasks || []); 
      } catch (err) {
          console.error("Failed to fetch notification count:", err);
          setUnreadCount(0);
          setUnreadTasksList([]);
      }
  }, []);

  const handleDismissAlerts = async () => {
    if (unreadCount > 0) {
        await axios.post('/api/employee/notifications/mark-read');
    }
    setIsAlertOpen(false);
    setUnreadCount(0); // Clear badge
  };

  const fetchData = useCallback(async () => {
    try {
      const tasksRes = await axios.get('/api/employee/dashboard');
      setTasks(tasksRes.data.tasks);
      setError('');
      
      // Load current notification count state
      fetchNotificationCount(); 

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [fetchNotificationCount]);

  useEffect(() => {
    fetchData(); 
    const interval = setInterval(fetchNotificationCount, 60000); 
    return () => clearInterval(interval);
  }, [fetchData, fetchNotificationCount]);

  const handleTaskAction = async (taskId, action) => {
    try {
      await axios.post(`/api/employee/tasks/${taskId}/update`, { action });
      alert(`Task successfully ${action}d. Admin has been notified.`);
      fetchData(); 
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${action} task.`);
    }
  };
  
  // Helper function for rendering task rows (unchanged)
  const renderTaskRow = (task) => (
    // ... (renderTaskRow JSX) ...
      <tr key={task._id} className="hover:bg-indigo-50/50 transition duration-150">
          <td className="px-6 py-4 text-sm font-medium text-gray-900">
              <p className="font-bold">{task.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(task.deadline).toLocaleDateString()}</td>
          <td className="px-6 py-4">
              <StatusPill status={task.status} />
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
              {task.status === 'Pending' && (
                  <>
                      <button onClick={() => handleTaskAction(task._id, 'accept')} className="text-indigo-600 hover:text-indigo-900 border border-indigo-200 px-3 py-1 rounded text-xs shadow-sm">Accept</button>
                      <button onClick={() => handleTaskAction(task._id, 'reject')} className="text-red-600 hover:text-red-900 border border-red-200 px-3 py-1 rounded text-xs shadow-sm">Reject</button>
                  </>
              )}
              {task.status === 'Accepted' && (
                  <button onClick={() => handleTaskAction(task._id, 'complete')} className="bg-accent-teal text-white px-3 py-1 rounded text-xs hover:bg-accent-teal/90 transition shadow-md">Complete</button>
              )}
              {(task.status === 'Rejected' || task.status === 'Completed') && (
                  <span className="text-gray-400 text-xs">No actions available</span>
              )}
          </td>
      </tr>
  );

  const renderTaskTable = (tasks, title, emptyMessage) => (
      <div className="bg-white p-6 rounded-xl shadow-smooth mb-10">
          <h3 className="text-2xl font-semibold mb-4 text-gray-700 border-b pb-2">{title} ({tasks.length})</h3>
          {tasks.length === 0 ? (
              <p className="text-center text-gray-500 py-4">{emptyMessage}</p>
          ) : (
              <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                          <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Details</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                          {tasks.map(renderTaskRow)}
                      </tbody>
                  </table>
              </div>
          )}
      </div>
  );

  const totalAssigned = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending');
  const acceptedTasks = tasks.filter(t => t.status === 'Accepted');
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const pendingTasksCount = pendingTasks.length;
  const completedTasksCount = completedTasks.length;

  return (
    <div className="min-h-screen bg-secondary-gray">
        {/* Header/Nav Bar */}
        <header className="bg-white shadow-lg sticky top-0 z-10">
            <div className="container mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-primary-blue">
                    Optimistic <span className="text-accent-teal">TaskFlow</span>
                </h1>
                <div className="flex items-center space-x-4">
                    
                    {/* --- NOTIFICATION ICON (Clickable Modal Trigger) --- */}
                    <div ref={alertRef} className="relative z-20"> 
                        <button 
                            onClick={() => setIsAlertOpen(true)} // Opens the modal
                            className="p-2 rounded-full text-gray-600 hover:text-primary-blue transition relative"
                            title="Unread Tasks"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.446L4 17h5m6 0v1a3 3 0 11-6 0v-1" />
                            </svg>
                            {/* Red Dot/Count Badge */}
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                    </div>
                    {/* ------------------------------------- */}
                    
                    <span className="text-gray-600 hidden sm:inline">Welcome, {user.name}</span>
                    
                    {/* Edit Profile Link */}
                    <Link 
                        to="/employee/profile-edit"
                        className="text-primary-blue border-2 border-primary-blue px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-blue hover:text-white transition duration-300 shadow-md"
                    >
                        Edit Profile
                    </Link>
                    
                    {/* Logout Button */}
                    <button 
                        onClick={logout} 
                        className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition shadow-md"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
        
        <div className="container mx-auto p-6 lg:p-10">
            {error && <div className="p-3 mb-4 bg-red-100 text-red-700 border border-red-400 rounded">{error}</div>}

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard title="Total Assigned" value={totalAssigned} icon="📦" color="bg-indigo-600" />
                <StatCard title="Remaining (Pending)" value={pendingTasksCount} icon="⚠️" color="bg-yellow-600" />
                <StatCard title="Completed" value={completedTasksCount} icon="🎉" color="bg-accent-teal" />
            </div>

            {/* --- 1. PENDING TASKS --- */}
            {renderTaskTable(
                pendingTasks, 
                "1. Pending Tasks (Awaiting Action)", 
                "All tasks are accepted or completed. You're waiting for new assignments!"
            )}

            {/* --- 2. ACCEPTED TASKS --- */}
            {renderTaskTable(
                acceptedTasks, 
                "2. Accepted Tasks (In Progress)", 
                "No tasks currently in progress. Complete a pending task to move it here."
            )}
            
            {/* --- 3. COMPLETED TASKS --- */}
            {renderTaskTable(
                completedTasks, 
                "3. Completed Tasks (Archived)", 
                "No tasks have been finished yet."
            )}
        </div>
        
        {/* MODAL RENDERING */}
        {isAlertOpen && <EmployeeNotificationModal 
            tasks={unreadTasksList} 
            onClose={() => setIsAlertOpen(false)} 
            onMarkRead={handleDismissAlerts}
        />}
    </div>
  );
}

export default EmployeeDashboard;