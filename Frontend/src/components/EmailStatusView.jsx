
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import ProgressBar from './ProgressBar';
import { updateProgress, resetProgress } from '../store/slices/emailSlice';

const EmailStatusView = ({ onDone }) => {
  const dispatch = useDispatch();
  const { sendingProgress } = useSelector((state) => state.email);
  const [emails, setEmails] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  // Simulate real-time email status updates
  useEffect(() => {
    if (sendingProgress.total === 0) return;

    // Generate mock email data
    const mockEmails = Array.from({ length: sendingProgress.total }, (_, i) => ({
      id: i + 1,
      email: `user${i + 1}@example.com`,
      status: 'pending',
      error: null,
    }));
    setEmails(mockEmails);

    // Simulate email sending process
    const interval = setInterval(() => {
      setEmails((prevEmails) => {
        const pendingEmails = prevEmails.filter(email => email.status === 'pending');
        
        if (pendingEmails.length === 0) {
          setIsComplete(true);
          clearInterval(interval);
          return prevEmails;
        }

        const emailToUpdate = pendingEmails[0];
        const success = Math.random() > 0.1; // 90% success rate
        const newStatus = success ? 'sent' : 'failed';
        const error = success ? null : 'SMTP connection failed';

        // Update Redux state
        dispatch(updateProgress({ status: newStatus }));
        
        // Show toast notification
        if (success) {
          toast.success(`Email sent to ${emailToUpdate.email}`);
        } else {
          toast.error(`Failed to send email to ${emailToUpdate.email}`);
        }

        return prevEmails.map(email =>
          email.id === emailToUpdate.id
            ? { ...email, status: newStatus, error }
            : email
        );
      });
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [sendingProgress.total, dispatch]);

  const handleDone = () => {
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
          <h4 className="text-lg font-medium text-gray-900 mb-4">Email Status</h4>
          
          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {emails.map((email) => (
                <div
                  key={email.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{email.email}</p>
                    {email.error && (
                      <p className="text-xs text-red-600 mt-1">{email.error}</p>
                    )}
                  </div>
                  <div className="ml-4">
                    {getStatusBadge(email.status, email.error)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailStatusView;
