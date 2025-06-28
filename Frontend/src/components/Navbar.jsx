
import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { toast } from 'react-hot-toast';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Avatar,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Email as EmailIcon,
  Dashboard as DashboardIcon,
  History as HistoryIcon,
} from '@mui/icons-material';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar
      position="fixed"
      sx={{
        background: 'linear-gradient(45deg, #667eea, #764ba2)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Avatar sx={{ mr: 2, bgcolor: 'rgba(255,255,255,0.2)' }}>
            <EmailIcon />
          </Avatar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, fontWeight: 'bold' }}
          >
            Email Automation
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              color="inherit"
              startIcon={<DashboardIcon />}
              onClick={() => navigate('/dashboard')}
              sx={{
                backgroundColor: isActive('/dashboard') ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Dashboard
            </Button>
            <Button
              color="inherit"
              startIcon={<HistoryIcon />}
              onClick={() => navigate('/history')}
              sx={{
                backgroundColor: isActive('/history') ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              History
            </Button>
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                ml: 2,
                backgroundColor: 'rgba(244, 63, 94, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.9)',
                },
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
