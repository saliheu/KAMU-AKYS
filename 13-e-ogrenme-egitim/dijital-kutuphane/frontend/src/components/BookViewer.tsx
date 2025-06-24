import { Dialog, DialogContent, IconButton, Box } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { closeBookViewer } from '@/store/slices/uiSlice';

const BookViewer = () => {
  const dispatch = useAppDispatch();
  const { bookViewerOpen, currentBookFile, bookViewerType } = useAppSelector((state) => state.ui);

  const handleClose = () => {
    dispatch(closeBookViewer());
  };

  return (
    <Dialog
      open={bookViewerOpen}
      onClose={handleClose}
      maxWidth={false}
      fullScreen
    >
      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
        <IconButton onClick={handleClose} color="inherit">
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent sx={{ p: 0, bgcolor: 'grey.900' }}>
        {currentBookFile && bookViewerType === 'pdf' && (
          <iframe
            src={currentBookFile}
            style={{ width: '100%', height: '100vh', border: 'none' }}
            title="PDF Viewer"
          />
        )}
        {currentBookFile && bookViewerType === 'epub' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <p style={{ color: 'white' }}>EPUB viewer will be implemented</p>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookViewer;