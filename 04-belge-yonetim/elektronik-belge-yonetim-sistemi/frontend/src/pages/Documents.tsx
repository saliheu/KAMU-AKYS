import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  GetApp as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { RootState, AppDispatch } from '../store';
import { fetchDocuments } from '../store/slices/documentSlice';
import documentService from '../services/documentService';

export default function Documents() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { documents, totalCount, loading } = useSelector(
    (state: RootState) => state.documents
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  useEffect(() => {
    dispatch(
      fetchDocuments({
        search: searchTerm,
        page: page + 1,
        page_size: pageSize,
      })
    );
  }, [dispatch, searchTerm, page, pageSize]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, document: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedDocument(document);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDocument(null);
  };

  const handleDownload = async () => {
    if (selectedDocument) {
      try {
        const response = await documentService.downloadDocument(selectedDocument.id);
        window.open(response.url, '_blank');
      } catch (error) {
        console.error('İndirme hatası:', error);
      }
    }
    handleMenuClose();
  };

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Belge Adı',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => navigate(`/documents/${params.row.id}`)}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: 'file_type',
      headerName: 'Tür',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value.toUpperCase()} size="small" />
      ),
    },
    {
      field: 'file_size',
      headerName: 'Boyut',
      width: 100,
      valueFormatter: (params) => {
        const size = params.value;
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
      },
    },
    {
      field: 'status',
      headerName: 'Durum',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const statusMap: any = {
          active: { label: 'Aktif', color: 'success' },
          draft: { label: 'Taslak', color: 'default' },
          archived: { label: 'Arşivlenmiş', color: 'warning' },
        };
        const status = statusMap[params.value] || statusMap.draft;
        return <Chip label={status.label} color={status.color} size="small" />;
      },
    },
    {
      field: 'created_by_name',
      headerName: 'Oluşturan',
      width: 150,
    },
    {
      field: 'created_at',
      headerName: 'Oluşturma Tarihi',
      width: 150,
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleDateString('tr-TR');
      },
    },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuClick(e, params.row)}
        >
          <MoreIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Belgeler</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/upload')}
        >
          Yeni Belge
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            placeholder="Belge ara..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, maxWidth: 400 }}
          />
          <Button startIcon={<FilterIcon />}>Filtreler</Button>
        </Box>
      </Paper>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={documents}
          columns={columns}
          rowCount={totalCount}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          paginationModel={{ page, pageSize }}
          paginationMode="server"
          onPaginationModelChange={(model) => {
            setPage(model.page);
            setPageSize(model.pageSize);
          }}
          disableRowSelectionOnClick
        />
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => navigate(`/documents/${selectedDocument?.id}`)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Görüntüle/Düzenle
        </MenuItem>
        <MenuItem onClick={handleDownload}>
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
          İndir
        </MenuItem>
        <MenuItem
          onClick={handleMenuClose}
          disabled={!selectedDocument?.can_delete}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Sil
        </MenuItem>
      </Menu>
    </Box>
  );
}