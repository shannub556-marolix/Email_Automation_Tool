import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  toggleEmailSelection,
  selectAllEmails,
  clearSelection,
} from '../store/slices/emailSlice';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

const EmailTable = ({ emails }) => {
  const dispatch = useDispatch();
  const { selectedEmails } = useSelector((state) => state.email);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      dispatch(selectAllEmails());
    } else {
      dispatch(clearSelection());
    }
  };

  const handleSelectEmail = (emailId) => {
    dispatch(toggleEmailSelection(emailId));
  };

  const getStatusBadge = (status) => {
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

  const currentTime = dayjs().format('DD-MM-YYYY HH:mm:ss');

  if (emails.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No emails found</p>
      </div>
    );
  }

  const allSelected = emails.length > 0 && emails.every(email => selectedEmails.includes(email.id));
  const someSelected = selectedEmails.length > 0 && !allSelected;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200" style={{ width: '100%' }}>
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) input.indeterminate = someSelected;
                }}
                onChange={handleSelectAll}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Recipient
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subject
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Timestamp
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {emails.map((email) => (
            <tr key={email.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedEmails.includes(email.id)}
                  onChange={() => handleSelectEmail(email.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{email.recipient}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900 max-w-xs truncate">{email.subject}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(email.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {email.timestamp ? dayjs(email.timestamp).add(5, 'hour').add(30, 'minute').format('DD-MM-YYYY HH:mm:ss') : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmailTable;
