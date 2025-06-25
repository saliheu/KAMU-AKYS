import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchUserAppointments, fetchUpcomingAppointments } from '../../store/slices/appointmentSlice';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { formatDateTime, isToday, isTomorrow } from '../../utils/formatters';
import './DashboardPage.css';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { 
    userAppointments, 
    upcomingAppointments, 
    loading 
  } = useSelector((state) => state.appointments);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserAppointments(user.id));
      dispatch(fetchUpcomingAppointments(user.id));
    }
  }, [dispatch, user?.id]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  const getAppointmentDateLabel = (date) => {
    const appointmentDate = new Date(date);
    if (isToday(appointmentDate)) return 'Bugün';
    if (isTomorrow(appointmentDate)) return 'Yarın';
    return formatDateTime(appointmentDate).split(' ')[0];
  };

  const stats = [
    {
      title: 'Toplam Randevular',
      value: userAppointments?.length || 0,
      icon: '📅',
      color: 'blue'
    },
    {
      title: 'Yaklaşan Randevular',
      value: upcomingAppointments?.length || 0,
      icon: '⏰',
      color: 'orange'
    },
    {
      title: 'Bu Ay',
      value: userAppointments?.filter(apt => {
        const aptDate = new Date(apt.date);
        const now = new Date();
        return aptDate.getMonth() === now.getMonth() && 
               aptDate.getFullYear() === now.getFullYear();
      }).length || 0,
      icon: '📊',
      color: 'green'
    }
  ];

  const quickActions = [
    {
      title: 'Yeni Randevu Al',
      description: 'Mahkeme randevusu almak için tıklayın',
      icon: '➕',
      path: '/appointments/booking',
      color: 'primary'
    },
    {
      title: 'Randevularım',
      description: 'Mevcut randevularınızı görüntüleyin',
      icon: '📋',
      path: '/appointments/my-appointments',
      color: 'secondary'
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner size="large" text="Dashboard yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1 className="welcome-title">
            {getGreeting()}, {user?.name || 'Kullanıcı'}!
          </h1>
          <p className="welcome-subtitle">
            Mahkeme Randevu Sistemi ana sayfasına hoş geldiniz
          </p>
        </div>
        <div className="welcome-date">
          <div className="current-date">
            {new Date().toLocaleDateString('tr-TR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.color}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-title">{stat.title}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2 className="section-title">Hızlı İşlemler</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className={`quick-action-card ${action.color}`}
            >
              <div className="action-icon">{action.icon}</div>
              <div className="action-content">
                <h3 className="action-title">{action.title}</h3>
                <p className="action-description">{action.description}</p>
              </div>
              <div className="action-arrow">→</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="dashboard-content">
        <div className="content-grid">
          {/* Upcoming Appointments */}
          <div className="content-card">
            <div className="card-header">
              <h3 className="card-title">Yaklaşan Randevular</h3>
              <Link to="/appointments/my-appointments" className="card-link">
                Tümünü Gör
              </Link>
            </div>
            <div className="card-content">
              {upcomingAppointments && upcomingAppointments.length > 0 ? (
                <div className="appointments-list">
                  {upcomingAppointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="appointment-item">
                      <div className="appointment-date">
                        <div className="date-label">
                          {getAppointmentDateLabel(appointment.date)}
                        </div>
                        <div className="date-time">
                          {formatDateTime(new Date(appointment.date)).split(' ')[1]}
                        </div>
                      </div>
                      <div className="appointment-details">
                        <div className="appointment-court">
                          {appointment.courtName}
                        </div>
                        <div className="appointment-type">
                          {appointment.appointmentType}
                        </div>
                      </div>
                      <div className={`appointment-status ${appointment.status}`}>
                        {appointment.status === 'confirmed' ? 'Onaylandı' :
                         appointment.status === 'pending' ? 'Beklemede' :
                         appointment.status === 'cancelled' ? 'İptal Edildi' : 
                         appointment.status}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  <p>Yaklaşan randevunuz bulunmamaktadır</p>
                  <Link to="/appointments/booking" className="btn btn-primary btn-sm">
                    Randevu Al
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="content-card">
            <div className="card-header">
              <h3 className="card-title">Son Randevular</h3>
              <Link to="/appointments/my-appointments" className="card-link">
                Tümünü Gör
              </Link>
            </div>
            <div className="card-content">
              {userAppointments && userAppointments.length > 0 ? (
                <div className="appointments-list">
                  {userAppointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="appointment-item">
                      <div className="appointment-date">
                        <div className="date-label">
                          {formatDateTime(new Date(appointment.createdAt)).split(' ')[0]}
                        </div>
                        <div className="date-time">Oluşturuldu</div>
                      </div>
                      <div className="appointment-details">
                        <div className="appointment-court">
                          {appointment.courtName}
                        </div>
                        <div className="appointment-type">
                          {appointment.appointmentType}
                        </div>
                      </div>
                      <div className={`appointment-status ${appointment.status}`}>
                        {appointment.status === 'confirmed' ? 'Onaylandı' :
                         appointment.status === 'pending' ? 'Beklemede' :
                         appointment.status === 'cancelled' ? 'İptal Edildi' : 
                         appointment.status}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <p>Henüz randevu oluşturmadınız</p>
                  <Link to="/appointments/booking" className="btn btn-primary btn-sm">
                    İlk Randevunuzu Alın
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="help-section">
        <div className="help-card">
          <div className="help-icon">❓</div>
          <div className="help-content">
            <h3>Yardıma mı ihtiyacınız var?</h3>
            <p>Randevu alma konusunda sorunuz varsa yardım dökümanlarımıza göz atabilirsiniz.</p>
          </div>
          <div className="help-actions">
            <button className="btn btn-outline">Yardım</button>
            <button className="btn btn-outline">İletişim</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;