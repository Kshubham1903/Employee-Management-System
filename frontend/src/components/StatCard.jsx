// frontend/src/components/StatCard.jsx
import React from 'react';

const StatCard = ({ title, value, icon, color }) => {
  return (
    // Added dark:bg-gray-800, dark:text-white, dark:shadow-lg for dark mode
    <div className="bg-white dark:bg-gray-800 shadow-smooth dark:shadow-lg rounded-xl p-6 flex items-center justify-between transform transition-all duration-300 hover:scale-[1.02] hover:shadow-elevate">
      <div>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
      <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center text-white text-xl shadow-md`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;