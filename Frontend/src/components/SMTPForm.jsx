
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  setSMTPConfig,
  validateSMTPStart,
  validateSMTPSuccess,
  validateSMTPFailure,
} from '../store/slices/smtpSlice';
import { smtpAPI } from '../services/api';

const SMTPForm = ({ onNext }) => {
  const dispatch = useDispatch();
  const smtp = useSelector((state) => state.smtp);

  const handleChange = (field, value) => {
    dispatch(setSMTPConfig({ field, value }));
  };

  const handleValidate = async () => {
    if (!smtp.smtpEmail || !smtp.smtpPassword) {
      toast.error('Please fill in SMTP email and password');
      return;
    }

    dispatch(validateSMTPStart());

    try {
      await smtpAPI.validate(smtp.smtpEmail, smtp.smtpPassword);
      dispatch(validateSMTPSuccess());
      toast.success('SMTP connected successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'SMTP validation failed';
      dispatch(validateSMTPFailure(errorMessage));
      toast.error(errorMessage);
    }
  };

  const handleNext = () => {
    if (!smtp.isValidated) {
      toast.error('Please validate SMTP credentials first');
      return;
    }
    if (!smtp.subject || !smtp.body) {
      toast.error('Please fill in email subject and body');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">SMTP Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMTP Email
            </label>
            <input
              type="email"
              value={smtp.smtpEmail}
              onChange={(e) => handleChange('smtpEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="your-email@gmail.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMTP Password
            </label>
            <input
              type="password"
              value={smtp.smtpPassword}
              onChange={(e) => handleChange('smtpPassword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="App password"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleValidate}
            disabled={smtp.validating}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {smtp.validating ? 'Validating...' : 'Validate SMTP'}
          </button>
          
          {smtp.isValidated && (
            <span className="ml-3 text-green-600 text-sm">✓ SMTP Connected</span>
          )}
          
          {smtp.error && (
            <div className="mt-2 text-red-600 text-sm">{smtp.error}</div>
          )}
        </div>
      </div>

      {smtp.isValidated && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email Template</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Subject
              </label>
              <input
                type="text"
                value={smtp.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Hello {name}"
              />
              <p className="mt-1 text-xs text-gray-500">
                Use {'{name}'} placeholder to personalize emails
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Body
              </label>
              <textarea
                rows={6}
                value={smtp.body}
                onChange={(e) => handleChange('body', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Dear {name}, your verification code is {code}"
              />
              <p className="mt-1 text-xs text-gray-500">
                Use placeholders like {'{name}'}, {'{code}'} to personalize emails with Excel data
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={!smtp.isValidated || !smtp.subject || !smtp.body}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Upload File
        </button>
      </div>
    </div>
  );
};

export default SMTPForm;
