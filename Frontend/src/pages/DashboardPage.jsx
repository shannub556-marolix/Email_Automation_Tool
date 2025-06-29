import React, { useState } from 'react';
import SMTPForm from '../components/SMTPForm';
import UploadForm from '../components/UploadForm';
import EmailStatusView from '../components/EmailStatusView';
import {
  Container,
  Paper,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Avatar,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Upload as UploadIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';

const DashboardPage = () => {
  const [currentView, setCurrentView] = useState('smtp');
  const [currentBatchId, setCurrentBatchId] = useState(null);

  const getActiveStep = () => {
    switch (currentView) {
      case 'smtp': return 0;
      case 'upload': return 1;
      case 'status': return 2;
      default: return 0;
    }
  };

  const steps = [
    { label: 'SMTP Setup', icon: <SettingsIcon /> },
    { label: 'Upload File', icon: <UploadIcon /> },
    { label: 'Email Status', icon: <BarChartIcon /> },
  ];

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', pt: 10, pb: 4 }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              color: 'white',
              p: 3,
            }}
          >
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Dashboard
            </Typography>
            <Typography variant="body1">
              Configure SMTP settings and send automated emails
            </Typography>
          </Box>

          {/* Stepper */}
          <Box sx={{ p: 3, bgcolor: '#fafafa' }}>
            <Stepper activeStep={getActiveStep()} alternativeLabel>
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    StepIconComponent={({ active, completed }) => (
                      <Avatar
                        sx={{
                          bgcolor: completed ? 'success.main' : active ? 'primary.main' : 'grey.400',
                          width: 32,
                          height: 32,
                        }}
                      >
                        {step.icon}
                      </Avatar>
                    )}
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Content */}
          <Box sx={{ p: 4 }}>
            {currentView === 'smtp' && (
              <SMTPForm onNext={() => setCurrentView('upload')} />
            )}
            
            {currentView === 'upload' && (
              <UploadForm 
                onBack={() => setCurrentView('smtp')}
                onUploadSuccess={(batchId) => {
                  setCurrentBatchId(batchId);
                  setCurrentView('status');
                }}
              />
            )}
            
            {currentView === 'status' && (
              <EmailStatusView batchId={currentBatchId} onDone={() => setCurrentView('smtp')} />
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default DashboardPage;
