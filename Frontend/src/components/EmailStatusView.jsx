import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import ProgressBar from './ProgressBar';
import { updateProgress, resetProgress, setEmails } from '../store/slices/emailSlice';
import { emailAPI } from '../services/api';

const EmailStatusView = ({ batchId, onDone }) => {
  const dispatch = useDispatch();
  const { sendingProgress } = useSelector((state) => state.email);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef(null);
  const totalRef = useRef(sendingProgress.total);
  const isPollingRef = useRef(false);
  const hasShownToastRef = useRef(false);

  // Update ref when total changes
  useEffect(() => {
    totalRef.current = sendingProgress.total;
  }, [sendingProgress.total]);

  // Create a stable polling function using useRef
  const pollEmailStatusRef = useRef(async () => {
    if (totalRef.current === 0) return;

    try {
      const statusResponse = await emailAPI.getEmailStatus(batchId);
      
      // Update progress with real data from backend
      dispatch(updateProgress({ 
        sent: statusResponse.sent || 0, 
        failed: statusResponse.failed || 0, 
        pending: statusResponse.pending || 0,
        total: statusResponse.total || totalRef.current 
      }));

      // Check if all emails are processed
      const totalProcessed = (statusResponse.sent || 0) + (statusResponse.failed || 0);
      // Stop polling if pending is zero or all processed
      if (((statusResponse.pending === 0 && totalRef.current > 0) || totalProcessed === totalRef.current) && totalRef.current > 0) {
        setIsComplete(true);
        isPollingRef.current = false;
        
        // Clear the interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        // Only show toast once
        if (!hasShownToastRef.current) {
          if (statusResponse.failed > 0) {
            toast.error(`${statusResponse.failed} emails failed to send. Check email history for details.`);
          } else {
            toast.success('All emails sent successfully!');
          }
          hasShownToastRef.current = true;
        }
      }
    } catch (error) {
      console.error('Error polling email status:', error);
    }
  });

  // Start polling when component mounts or when total changes
  useEffect(() => {
    if (sendingProgress.total > 0 && !isPollingRef.current) {
      isPollingRef.current = true;
      intervalRef.current = setInterval(() => pollEmailStatusRef.current(), 2000); // Poll every 2 seconds
    }
    // Reset toast shown state only when batchId changes
    hasShownToastRef.current = false;
    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      isPollingRef.current = false;
    };
  }, [sendingProgress.total, batchId]);

  const handleDone = () => {
    // Clear interval if still running
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isPollingRef.current = false;
    dispatch(resetProgress());
    onDone();
  };

  const getStatusBadge = (status, error) => {
    switch (status) {
      case 'sent':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Sent
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
    }
  };

  if (sendingProgress.total === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No emails to send. Please upload a file first.</p>
        <button
          onClick={onDone}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Back to Upload
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Email Sending Progress</h3>
        {isComplete && (
          <button
            onClick={handleDone}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium"
          >
            Done
          </button>
        )}
      </div>

      <ProgressBar
        total={sendingProgress.total}
        sent={sendingProgress.sent}
        failed={sendingProgress.failed}
        pending={sendingProgress.pending}
      />

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center text-sm text-gray-900 font-medium">
  <h4 className="text-lg mr-2">Email Status:</h4>

  {!isComplete && (
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
  )}

  <span className={isComplete ? 'text-green-600' : 'text-gray-500'}>
    {isComplete ? 'Completed' : 'Pending...'}
  </span>
</div>

          
          <div className="text-center py-8">
            <div className="space-y-4">
              {/* <div className="flex justify-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{sendingProgress.sent}</div>
                  <div className="text-sm text-gray-500">Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{sendingProgress.failed}</div>
                  <div className="text-sm text-gray-500">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{sendingProgress.pending}</div>
                  <div className="text-sm text-gray-500">Pending</div>
                </div>
              </div> */}
              
              {isComplete && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    {sendingProgress.failed > 0 
                      ? `${sendingProgress.failed} emails failed to send. Check the email history page for details.`
                      : 'All emails sent successfully!'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailStatusView;
