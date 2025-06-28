
import React, { useState } from 'react';
import { Box, TextField, Button, InputAdornment } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2 }}>
      <TextField
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by recipient email..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        variant="outlined"
      />
      
      <Button
        type="submit"
        variant="contained"
        sx={{ minWidth: 100 }}
      >
        Search
      </Button>
      
      {query && (
        <Button
          variant="outlined"
          startIcon={<ClearIcon />}
          onClick={handleClear}
          sx={{ minWidth: 100 }}
        >
          Clear
        </Button>
      )}
    </Box>
  );
};

export default SearchBar;
