import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  fetchUserAppointments, 
  cancelAppointment,
  clearError 
} from '../../store/slices/appointmentSlice';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { formatDateTime, isPastDate, isToday } from '../../utils/formatters';
import { APPOINTMENT_TYPES } from '../../utils/constants';
import './MyAppointments.css';

const MyAppointments = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { 
    userAppointments, 
    loading, 
    error,
    cancelLoading 
  } = useSelector((state) => state.appointments);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserAppointments(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const getStatusLabel = (status) => {
    const statusMap = {
      'confirmed': 'Onaylandı',
      'pending': 'Beklemede',
      'cancelled': 'İptal Edildi',
      'completed': 'Tamamlandı'
    };
    return statusMap[status] || status;
  };

  const getAppointmentTypeLabel = (type) => {
    const appointmentType = APPOINTMENT_TYPES.find(t => t.value === type);
    return appointmentType ? appointmentType.label : type;
  };

  const canCancelAppointment = (appointment) => {
    if (appointment.status === 'cancelled' || appointment.status === 'completed') {
      return false;
    }
    
    const appointmentDate = new Date(appointment.date);
    const now = new Date();
    const hoursDifference = (appointmentDate - now) / (1000 * 60 * 60);
    
    return hoursDifference > 24; // Can cancel if more than 24 hours away
  };

  const filteredAppointments = userAppointments?.filter(appointment => {
    const matchesFilter = filter === 'all' || appointment.status === filter;
    const matchesSearch = searchTerm === '' || 
      appointment.courtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getAppointmentTypeLabel(appointment.appointmentType).toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  }) || [];

  const handleCancelClick = (appointment) => {
    setAppointmentToCancel(appointment);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (appointmentToCancel) {
      try {
        await dispatch(cancelAppointment(appointmentToCancel.id)).unwrap();
        setShowCancelModal(false);
        setAppointmentToCancel(null);
        // Refresh appointments
        dispatch(fetchUserAppointments(user.id));
      } catch (error) {
        console.error('Cancel appointment error:', error);
      }
    }
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
    setAppointmentToCancel(null);
  };

  const getAppointmentPriority = (appointment) => {
    const appointmentDate = new Date(appointment.date);
    
    if (isToday(appointmentDate)) return 'today';
    if (isPastDate(appointmentDate)) return 'past';
    
    const now = new Date();
    const daysDifference = Math.ceil((appointmentDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysDifference <= 7) return 'upcoming';
    return 'future';
  };

  if (loading && !userAppointments) {
    return (
      <div className="appointments-loading">
        <LoadingSpinner size="large" text="Randevularınız yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="my-appointments-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Randevularım</h1>
          <p className="page-description">
            Mevcut ve geçmiş randevularınızı görüntüleyebilir, yönetebilirsiniz.
          </p>
        </div>
        <Link to="/appointments/booking" className="btn btn-primary">
          + Yeni Randevu Al
        </Link>
      </div>

      {error && (
        <div className="error-banner">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="appointments-controls">
        <div className="search-section">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Mahkeme adı veya randevu türü ile arayın..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-buttons">
            <button
              onClick={() => setFilter('all')}
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            >
              Tümü ({userAppointments?.length || 0})
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
            >
              Onaylı ({userAppointments?.filter(a => a.status === 'confirmed').length || 0})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            >
              Beklemede ({userAppointments?.filter(a => a.status === 'pending').length || 0})
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
            >
              İptal Edildi ({userAppointments?.filter(a => a.status === 'cancelled').length || 0})
            </button>
          </div>
        </div>
      </div>

      <div className="appointments-content">
        {filteredAppointments.length > 0 ? (
          <div className="appointments-grid">
            {filteredAppointments.map((appointment) => {
              const priority = getAppointmentPriority(appointment);
              const appointmentDate = new Date(appointment.date);
              
              return (
                <div 
                  key={appointment.id} 
                  className={`appointment-card ${priority} ${appointment.status}`}
                >
                  <div className="appointment-header">
                    <div className="appointment-date-info">
                      <div className="date-primary">
                        {formatDateTime(appointmentDate).split(' ')[0]}
                      </div>
                      <div className="date-secondary">
                        {formatDateTime(appointmentDate).split(' ')[1]}
                      </div>
                    </div>
                    <div className={`status-badge ${appointment.status}`}>
                      {getStatusLabel(appointment.status)}
                    </div>
                  </div>

                  <div className="appointment-body">
                    <h3 className="court-name">{appointment.courtName}</h3>
                    <div className="appointment-details">
                      <div className="detail-item">
                        <span className="detail-label">Randevu Türü:</span>
                        <span className="detail-value">
                          {getAppointmentTypeLabel(appointment.appointmentType)}
                        </span>
                      </div>
                      {appointment.description && (
                        <div className="detail-item">
                          <span className="detail-label">Açıklama:</span>
                          <span className="detail-value">{appointment.description}</span>
                        </div>
                      )}
                      <div className="detail-item">
                        <span className="detail-label">Oluşturma Tarihi:</span>
                        <span className="detail-value">
                          {formatDateTime(new Date(appointment.createdAt))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="appointment-actions">
                    {canCancelAppointment(appointment) && (
                      <button
                        onClick={() => handleCancelClick(appointment)}
                        className="btn btn-outline btn-danger btn-sm"
                        disabled={cancelLoading}
                      >
                        {cancelLoading ? 'İptal Ediliyor...' : 'İptal Et'}
                      </button>
                    )}
                    <button className="btn btn-outline btn-sm">
                      Detaylar
                    </button>
                  </div>

                  {priority === 'today' && (
                    <div className="priority-indicator today-indicator">
                      Bugün!
                    </div>
                  )}
                  {priority === 'upcoming' && (
                    <div className="priority-indicator upcoming-indicator">
                      Yaklaşan
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-appointments">
            <div className="empty-icon">📅</div>
            <h3>
              {searchTerm || filter !== 'all' 
                ? 'Arama kriterlerinize uygun randevu bulunamadı'
                : 'Henüz randevunuz bulunmamaktadır'
              }
            </h3>
            <p>
              {searchTerm || filter !== 'all'
                ? 'Farklı arama kriterleri deneyebilir veya filtreyi değiştirebilirsiniz.'
                : 'İlk randevunuzu almak için aşağıdaki butona tıklayın.'
              }
            </p>
            {!searchTerm && filter === 'all' && (
              <Link to="/appointments/booking" className="btn btn-primary">
                İlk Randevunuzu Alın
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Randevu İptali</h3>
              <button 
                onClick={handleCancelModalClose}
                className="modal-close"
                aria-label="Kapat"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Bu randevuyu iptal etmek istediğinizden emin misiniz?</p>
              {appointmentToCancel && (
                <div className="cancel-appointment-details">
                  <div className="detail-row">
                    <strong>Mahkeme:</strong> {appointmentToCancel.courtName}
                  </div>
                  <div className="detail-row">
                    <strong>Tarih:</strong> {formatDateTime(new Date(appointmentToCancel.date))}
                  </div>
                  <div className="detail-row">
                    <strong>Tür:</strong> {getAppointmentTypeLabel(appointmentToCancel.appointmentType)}
                  </div>
                </div>
              )}
              <div className="cancel-warning">
                <span className="warning-icon">⚠️</span>
                <span>İptal edilen randevular geri alınamaz.</span>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                onClick={handleCancelModalClose}
                className="btn btn-secondary"
                disabled={cancelLoading}
              >
                Vazgeç
              </button>
              <button 
                onClick={handleCancelConfirm}
                className="btn btn-danger"
                disabled={cancelLoading}
              >
                {cancelLoading ? (
                  <>
                    <LoadingSpinner size="small" color="white" />
                    İptal Ediliyor...
                  </>
                ) : (
                  'Randevuyu İptal Et'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;