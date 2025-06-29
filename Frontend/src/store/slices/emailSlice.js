import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  emails: [],
  currentEmails: [],
  totalCount: 0,
  totalPages: 0,
  currentPage: 1,
  searchQuery: '',
  loading: false,
  uploading: false,
  sendingProgress: {
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
  },
  selectedEmails: [],
  error: null,
};

const emailSlice = createSlice({
  name: 'email',
  initialState,
  reducers: {
    setEmails: (state, action) => {
      state.emails = action.payload.emails;
      state.totalCount = action.payload.totalCount;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.page;
    },
    setCurrentEmails: (state, action) => {
      state.currentEmails = action.payload;
    },
    updateEmailStatus: (state, action) => {
      const { id, status, error } = action.payload;
      const email = state.currentEmails.find(email => email.id === id);
      if (email) {
        email.status = status;
        if (error) email.error = error;
      }
    },
    setSendingProgress: (state, action) => {
      state.sendingProgress = action.payload;
    },
    updateProgress: (state, action) => {
      const { sent, failed, pending, total } = action.payload;
      if (sent !== undefined) state.sendingProgress.sent = sent;
      if (failed !== undefined) state.sendingProgress.failed = failed;
      if (pending !== undefined) state.sendingProgress.pending = pending;
      if (total !== undefined) state.sendingProgress.total = total;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUploading: (state, action) => {
      state.uploading = action.payload;
    },
    setSelectedEmails: (state, action) => {
      state.selectedEmails = action.payload;
    },
    toggleEmailSelection: (state, action) => {
      const emailId = action.payload;
      const index = state.selectedEmails.indexOf(emailId);
      if (index > -1) {
        state.selectedEmails.splice(index, 1);
      } else {
        state.selectedEmails.push(emailId);
      }
    },
    selectAllEmails: (state) => {
      state.selectedEmails = state.emails.map(email => email.id);
    },
    clearSelection: (state) => {
      state.selectedEmails = [];
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetProgress: (state) => {
      state.sendingProgress = {
        total: 0,
        sent: 0,
        failed: 0,
        pending: 0,
      };
      state.currentEmails = [];
    },
  },
});

export const {
  setEmails,
  setCurrentEmails,
  updateEmailStatus,
  setSendingProgress,
  updateProgress,
  setSearchQuery,
  setCurrentPage,
  setLoading,
  setUploading,
  setSelectedEmails,
  toggleEmailSelection,
  selectAllEmails,
  clearSelection,
  setError,
  clearError,
  resetProgress,
} = emailSlice.actions;
export default emailSlice.reducer;
