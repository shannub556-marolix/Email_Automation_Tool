import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import EmailTable from '../components/EmailTable';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Avatar,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  History as HistoryIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ClearAll as ClearAllIcon,
} from '@mui/icons-material';
import {
  setEmails,
  setLoading,
  setSearchQuery,
  setCurrentPage,
  clearSelection,
} from '../store/slices/emailSlice';
import { emailAPI } from '../services/api';

const EmailHistoryPage = () => {
  const dispatch = useDispatch();
  const {
    emails,
    totalCount,
    totalPages,
    currentPage,
    searchQuery,
    loading,
    selectedEmails,
  } = useSelector((state) => state.email);

  const [deleting, setDeleting] = useState(false);

  const fetchEmails = async (page = 1, search = '') => {
    dispatch(setLoading(true));
    try {
      const response = await emailAPI.getLogs(page, search);
      dispatch(setEmails(response));
    } catch (error) {
      toast.error('Failed to fetch emails');
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchEmails(currentPage, searchQuery);
  }, [currentPage]);

  const handleSearch = (query) => {
    dispatch(setSearchQuery(query));
    dispatch(setCurrentPage(1));
    fetchEmails(1, query);
  };

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
  };

  const handleDeleteSelected = async () => {
    if (selectedEmails.length === 0) {
      toast.error('Please select emails to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedEmails.length} emails?`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await emailAPI.deleteEmails(selectedEmails);
      toast.success(`${response.deleted} emails deleted successfully`);
      dispatch(clearSelection());
      fetchEmails(currentPage, searchQuery);
    } catch (error) {
      toast.error('Failed to delete emails');
    } finally {
      setDeleting(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL email logs? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await emailAPI.clearAll();
      toast.success(`${response.deleted} emails deleted successfully`);
      dispatch(clearSelection());
      fetchEmails(1, '');
      dispatch(setCurrentPage(1));
      dispatch(setSearchQuery(''));
    } catch (error) {
      toast.error('Failed to clear all emails');
    } finally {
      setDeleting(false);
    }
  };

  const handleRefresh = () => {
    fetchEmails(currentPage, searchQuery);
    toast.success('Email history refreshed');
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', pt: 10, pb: 4 }}>
      <Container maxWidth="xl">
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              color: 'white',
              p: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ mr: 2, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <HistoryIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Email History
                </Typography>
                <Chip
                  label={`Total: ${totalCount} emails sent`}
                  sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
                onClick={handleRefresh}
                disabled={loading}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              >
                Refresh
              </Button>
              
              <Button
                variant="contained"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteSelected}
                disabled={selectedEmails.length === 0 || deleting}
                sx={{ bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}
              >
                Delete ({selectedEmails.length})
              </Button>
              
              <Button
                variant="contained"
                startIcon={<ClearAllIcon />}
                onClick={handleClearAll}
                disabled={deleting}
                sx={{ bgcolor: 'error.dark', '&:hover': { bgcolor: 'error.main' } }}
              >
                Clear All
              </Button>
            </Box>
          </Box>

          <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
              <SearchBar onSearch={handleSearch} />
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress size={60} />
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Loading email history...
                  </Typography>
                </Box>
              </Box>
            ) : (
              <>
                <EmailTable emails={emails} />
                
                {totalPages > 1 && (
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default EmailHistoryPage;
