
import React from 'react';

const ProgressBar = ({ total, sent, failed, pending }) => {
  const sentPercentage = total > 0 ? (sent / total) * 100 : 0;
  const failedPercentage = total > 0 ? (failed / total) * 100 : 0;
  const completedPercentage = sentPercentage + failedPercentage;

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-medium text-gray-900">
        <span>Progress</span>
        <span>{sent + failed} of {total} emails processed</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div className="h-full flex">
          <div
            className="bg-green-500 transition-all duration-500 ease-out"
            style={{ width: `${sentPercentage}%` }}
          />
          <div
            className="bg-red-500 transition-all duration-500 ease-out"
            style={{ width: `${failedPercentage}%` }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{sent}</div>
          <div className="text-gray-500">Sent</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{failed}</div>
          <div className="text-gray-500">Failed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{pending}</div>
          <div className="text-gray-500">Pending</div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
