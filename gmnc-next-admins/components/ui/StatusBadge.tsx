import React from 'react';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'active':
      return <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-600 text-white text-xs font-medium">Active</span>;
    case 'inprogress':
      return <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-medium">In progress</span>;
    case 'completed':
      return <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-medium">Completed</span>;
    default:
      return <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-400 text-white text-xs font-medium">Inactive</span>;
  }
};

export default StatusBadge;