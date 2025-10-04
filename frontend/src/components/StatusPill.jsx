// frontend/src/components/StatusPill.jsx
import React from 'react';

const StatusPill = ({ status }) => {
    let style = "bg-gray-100 text-gray-800 border border-gray-300"; 

    switch (status) {
        case 'Completed':
            style = "bg-accent-teal/10 text-accent-teal border border-accent-teal";
            break;
        case 'Accepted':
            style = "bg-blue-100 text-blue-800 border border-blue-400";
            break;
        case 'Rejected':
            style = "bg-red-100 text-red-800 border border-red-400";
            break;
        case 'Pending':
            style = "bg-yellow-100 text-yellow-800 border border-yellow-400 animate-pulse";
            break;
        default:
            break;
    }

    return (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${style}`}>
            {status}
        </span>
    );
};

export default StatusPill;