import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { meetingService } from '../services/meetingService';
import { Meeting } from '../types';
import dayjs from 'dayjs';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Meetings: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchMeetings();
  }, [tabValue, page, rowsPerPage]);
  
  const fetchMeetings = async () => {
    try {
      setLoading(true);
      let response;
      
      if (searchQuery) {
        response = await meetingService.searchMeetings(searchQuery, page, rowsPerPage);
      } else if (tabValue === 0) {
        response = await meetingService.getMyMeetings(page, rowsPerPage);
      } else {
        response = await meetingService.getOrganizedMeetings(page, rowsPerPage);
      }
      
      setMeetings(response.content || []);
      setTotalElements(response.totalElements || 0);
    } catch (err: any) {
      setError('Toplantılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchMeetings();
  };
  
  const getStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'SCHEDULED':
        return 'primary';
      case 'IN_PROGRESS':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const getStatusText = (status: Meeting['status']) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Planlandı';
      case 'IN_PROGRESS':
        return 'Devam Ediyor';
      case 'COMPLETED':
        return 'Tamamlandı';
      case 'CANCELLED':
        return 'İptal Edildi';
      default:
        return status;
    }
  };
  
  const getTypeIcon = (type: Meeting['type']) => {
    switch (type) {
      case 'IN_PERSON':
        return '🏢';
      case 'ONLINE':
        return '💻';
      case 'HYBRID':
        return '🔄';
      default:
        return '';
    }
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Toplantılar</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/meetings/new')}
        >
          Yeni Toplantı
        </Button>
      </Box>
      
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <form onSubmit={handleSearch}>
            <TextField
              fullWidth
              placeholder="Toplantı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <Button
                      size="small"
                      onClick={() => {
                        setSearchQuery('');
                        setPage(0);
                        fetchMeetings();
                      }}
                    >
                      Temizle
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Katıldığım Toplantılar" />
            <Tab label="Düzenlediğim Toplantılar" />
          </Tabs>
          
          <TabPanel value={tabValue} index={0}>
            {renderMeetingsTable()}
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            {renderMeetingsTable()}
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
  
  function renderMeetingsTable() {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }
    
    if (meetings.length === 0) {
      return (
        <Typography color="textSecondary" align="center" py={3}>
          Toplantı bulunamadı
        </Typography>
      );
    }
    
    return (
      <>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Başlık</TableCell>
                <TableCell>Tarih ve Saat</TableCell>
                <TableCell>Tür</TableCell>
                <TableCell>Oda/Konum</TableCell>
                <TableCell>Düzenleyen</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {meetings.map((meeting) => (
                <TableRow key={meeting.id}>
                  <TableCell>{meeting.title}</TableCell>
                  <TableCell>
                    {dayjs(meeting.startTime).format('DD.MM.YYYY HH:mm')}
                  </TableCell>
                  <TableCell>
                    <span style={{ marginRight: 4 }}>{getTypeIcon(meeting.type)}</span>
                    {meeting.type === 'IN_PERSON' && 'Yüz yüze'}
                    {meeting.type === 'ONLINE' && 'Çevrimiçi'}
                    {meeting.type === 'HYBRID' && 'Hibrit'}
                  </TableCell>
                  <TableCell>
                    {meeting.room?.name || meeting.location || '-'}
                  </TableCell>
                  <TableCell>
                    {meeting.organizer.firstName} {meeting.organizer.lastName}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(meeting.status)}
                      color={getStatusColor(meeting.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/meetings/${meeting.id}`)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    {meeting.status === 'SCHEDULED' && (
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/meetings/${meeting.id}/edit`)}
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Sayfa başına:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </>
    );
  }
};

export default Meetings;