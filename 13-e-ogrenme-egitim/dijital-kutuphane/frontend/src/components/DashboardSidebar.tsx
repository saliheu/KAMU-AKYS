import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  LibraryBooks as LibraryBooksIcon,
  BookmarkBorder as BookmarkBorderIcon,
  CollectionsBookmark as CollectionsBookmarkIcon,
  RateReview as RateReviewIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Category as CategoryIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

interface DashboardSidebarProps {
  isAdmin?: boolean;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isAdmin = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const userMenuItems = [
    { title: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { title: 'Kitaplarım', icon: <LibraryBooksIcon />, path: '/dashboard/my-books' },
    { title: 'Rezervasyonlarım', icon: <BookmarkBorderIcon />, path: '/dashboard/reservations' },
    { title: 'Koleksiyonlarım', icon: <CollectionsBookmarkIcon />, path: '/dashboard/collections' },
    { title: 'Yorumlarım', icon: <RateReviewIcon />, path: '/dashboard/reviews' },
    { title: 'Profil', icon: <PersonIcon />, path: '/dashboard/profile' },
    { title: 'Bildirimler', icon: <NotificationsIcon />, path: '/dashboard/notifications' },
  ];

  const adminMenuItems = [
    { title: 'Dashboard', icon: <AdminPanelSettingsIcon />, path: '/admin' },
    { title: 'Kitap Yönetimi', icon: <LibraryBooksIcon />, path: '/admin/books' },
    { title: 'Kullanıcılar', icon: <PeopleIcon />, path: '/admin/users' },
    { title: 'Ödünç İşlemleri', icon: <BookmarkBorderIcon />, path: '/admin/borrowings' },
    { title: 'Kategoriler', icon: <CategoryIcon />, path: '/admin/categories' },
    { title: 'Raporlar', icon: <AssessmentIcon />, path: '/admin/reports' },
    { title: 'Ayarlar', icon: <SettingsIcon />, path: '/admin/settings' },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  return (
    <List>
      {menuItems.map((item) => (
        <ListItem key={item.path} disablePadding>
          <ListItemButton
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.title} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default DashboardSidebar;