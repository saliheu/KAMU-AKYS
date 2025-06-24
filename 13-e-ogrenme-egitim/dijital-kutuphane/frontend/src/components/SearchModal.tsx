import { Dialog, DialogContent, TextField, Box, List, ListItem, ListItemText, Typography, InputAdornment, IconButton } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { closeSearchModal } from '@/store/slices/uiSlice';
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
import searchService from '@/services/searchService';
import { useDebounce } from '@/hooks/useDebounce';

const SearchModal = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { searchModalOpen } = useAppSelector((state) => state.ui);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length > 2) {
      setLoading(true);
      searchService.getSuggestions(debouncedQuery)
        .then(setSuggestions)
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  const handleClose = () => {
    dispatch(closeSearchModal());
    setQuery('');
    setSuggestions([]);
  };

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      handleClose();
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.type === 'book') {
      navigate(`/books/${suggestion.id}`);
    } else if (suggestion.type === 'author') {
      navigate(`/search?author=${suggestion.id}`);
    } else if (suggestion.type === 'category') {
      navigate(`/search?category=${suggestion.id}`);
    }
    handleClose();
  };

  return (
    <Dialog
      open={searchModalOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          placeholder="Kitap, yazar veya kategori ara..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleClose} size="small">
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        {suggestions.length > 0 && (
          <List sx={{ mt: 2 }}>
            {suggestions.map((suggestion, index) => (
              <ListItem
                key={index}
                button
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <ListItemText
                  primary={suggestion.text}
                  secondary={suggestion.type}
                />
              </ListItem>
            ))}
          </List>
        )}
        
        {loading && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            Aranıyor...
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;