
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import smtpSlice from './slices/smtpSlice';
import emailSlice from './slices/emailSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    smtp: smtpSlice,
    email: emailSlice,
  },
});

export default store;
