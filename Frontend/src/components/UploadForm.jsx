
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { setUploading, setSendingProgress } from '../store/slices/emailSlice';
import { emailAPI } from '../services/api';

const UploadForm = ({ onBack, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  const dispatch = useDispatch();
  const smtp = useSelector((state) => state.smtp);
  const { uploading } = useSelector((state) => state.email);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile.name.endsWith('.xlsx')) {
      toast.error('Only .xlsx files are allowed');
      return;
    }
    setFile(selectedFile);
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    dispatch(setUploading(true));

    try {
      const response = await emailAPI.uploadFile(file, smtp);
      toast.success(response.message);
      
      // Extract total count from message (e.g., "10 emails queued for sending.")
      const totalMatch = response.message.match(/(\d+) emails queued/);
      const total = totalMatch ? parseInt(totalMatch[1]) : 0;
      
      dispatch(setSendingProgress({
        total,
        sent: 0,
        failed: 0,
        pending: total,
      }));
      
      onUploadSuccess();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Upload failed';
      toast.error(errorMessage);
    } finally {
      dispatch(setUploading(false));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Upload Excel File</h3>
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          ← Back to SMTP Config
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Current SMTP Configuration:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><span className="font-medium">Email:</span> {smtp.smtpEmail}</p>
          <p><span className="font-medium">Subject:</span> {smtp.subject}</p>
          <p><span className="font-medium">Body Preview:</span> {smtp.body.substring(0, 100)}...</p>
        </div>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                {file ? file.name : 'Drop Excel file here or click to browse'}
              </span>
              <span className="mt-1 block text-xs text-gray-500">
                Only .xlsx files are supported
              </span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept=".xlsx"
                onChange={handleFileInput}
              />
            </label>
          </div>
        </div>
      </div>

      {file && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                File selected: {file.name}
              </p>
              <p className="text-sm text-green-700">
                Size: {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => setFile(null)}
          disabled={!file}
          className="text-gray-500 hover:text-gray-700 text-sm disabled:opacity-50"
        >
          Clear File
        </button>
        
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload & Send Emails'}
        </button>
      </div>
    </div>
  );
};

export default UploadForm;
