// frontend/src/components/StatCard.jsx
import React from 'react';

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-smooth flex items-center justify-between transition duration-300 hover:shadow-elevate hover:border-b-4 hover:border-primary-blue/50">
        <div>
            <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
            <h2 className="text-3xl font-bold text-gray-900 mt-1">{value}</h2>
        </div>
        <div className={`p-3 rounded-full ${color} text-white text-2xl`}>
            {icon}
        </div>
    </div>
);

export default StatCard;