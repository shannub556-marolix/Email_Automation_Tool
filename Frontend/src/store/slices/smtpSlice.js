
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  smtpEmail: '',
  smtpPassword: '',
  subject: '',
  body: '',
  isValidated: false,
  validating: false,
  error: null,
};

const smtpSlice = createSlice({
  name: 'smtp',
  initialState,
  reducers: {
    setSMTPConfig: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
    },
    validateSMTPStart: (state) => {
      state.validating = true;
      state.error = null;
    },
    validateSMTPSuccess: (state) => {
      state.validating = false;
      state.isValidated = true;
      state.error = null;
    },
    validateSMTPFailure: (state, action) => {
      state.validating = false;
      state.isValidated = false;
      state.error = action.payload;
    },
    resetSMTPValidation: (state) => {
      state.isValidated = false;
      state.error = null;
    },
    clearSMTPConfig: (state) => {
      return initialState;
    },
  },
});

export const {
  setSMTPConfig,
  validateSMTPStart,
  validateSMTPSuccess,
  validateSMTPFailure,
  resetSMTPValidation,
  clearSMTPConfig,
} = smtpSlice.actions;
export default smtpSlice.reducer;
