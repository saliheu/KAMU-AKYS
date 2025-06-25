import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCourts, createAppointment } from '../../store/slices/appointmentSlice';
import { APPOINTMENT_TYPES, PROVINCES } from '../../utils/constants';
import AppointmentCalendar from '../Calendar/AppointmentCalendar';
import LoadingSpinner from '../UI/LoadingSpinner';
import './AppointmentForm.css';

const AppointmentForm = () => {
  const [formData, setFormData] = useState({
    province: '',
    courtType: '',
    courtId: '',
    appointmentType: '',
    description: '',
    date: '',
    slotId: '',
  });
  
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);

  const dispatch = useDispatch();
  const { 
    courts, 
    loading, 
    error, 
    createLoading 
  } = useSelector((state) => state.appointments);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (formData.province && formData.courtType) {
      dispatch(fetchCourts({
        province: formData.province,
        type: formData.courtType
      }));
    }
  }, [formData.province, formData.courtType, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear related errors
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSlotSelect = ({ date, slot }) => {
    setFormData(prev => ({
      ...prev,
      date,
      slotId: slot?.id || ''
    }));
    setSelectedSlot(slot);
  };

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.province) newErrors.province = 'İl seçimi zorunludur';
      if (!formData.courtType) newErrors.courtType = 'Mahkeme türü seçimi zorunludur';
      if (!formData.courtId) newErrors.courtId = 'Mahkeme seçimi zorunludur';
      if (!formData.appointmentType) newErrors.appointmentType = 'Randevu türü seçimi zorunludur';
    }

    if (currentStep === 2) {
      if (!formData.date) newErrors.date = 'Tarih seçimi zorunludur';
      if (!formData.slotId) newErrors.slotId = 'Saat seçimi zorunludur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(2)) return;

    try {
      const appointmentData = {
        ...formData,
        userId: user.id,
        courtName: courts.find(c => c.id === formData.courtId)?.name,
        slotInfo: selectedSlot
      };

      await dispatch(createAppointment(appointmentData)).unwrap();
      
      // Reset form on success
      setFormData({
        province: '',
        courtType: '',
        courtId: '',
        appointmentType: '',
        description: '',
        date: '',
        slotId: '',
      });
      setSelectedSlot(null);
      setStep(1);
      
      alert('Randevunuz başarıyla oluşturuldu!');
    } catch (error) {
      console.error('Randevu oluşturma hatası:', error);
    }
  };

  const selectedCourt = courts.find(c => c.id === formData.courtId);

  const courtTypes = [
    { value: 'civil', label: 'Hukuk Mahkemesi' },
    { value: 'criminal', label: 'Ceza Mahkemesi' },
    { value: 'commercial', label: 'Ticaret Mahkemesi' },
    { value: 'labor', label: 'İş Mahkemesi' },
    { value: 'family', label: 'Aile Mahkemesi' },
  ];

  return (
    <div className="appointment-form-container">
      <div className="form-header">
        <h2>Mahkeme Randevusu Al</h2>
        <div className="step-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className="step-line"></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>
      </div>

      <form className="appointment-form" onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="form-step">
            <h3>Mahkeme Bilgileri</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="province">İl *</label>
                <select
                  id="province"
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  className={errors.province ? 'error' : ''}
                >
                  <option value="">İl Seçiniz</option>
                  {PROVINCES.map(province => (
                    <option key={province.value} value={province.value}>
                      {province.label}
                    </option>
                  ))}
                </select>
                {errors.province && <span className="error-message">{errors.province}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="courtType">Mahkeme Türü *</label>
                <select
                  id="courtType"
                  name="courtType"
                  value={formData.courtType}
                  onChange={handleInputChange}
                  className={errors.courtType ? 'error' : ''}
                >
                  <option value="">Mahkeme Türü Seçiniz</option>
                  {courtTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.courtType && <span className="error-message">{errors.courtType}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="courtId">Mahkeme *</label>
              <select
                id="courtId"
                name="courtId"
                value={formData.courtId}
                onChange={handleInputChange}
                disabled={!courts.length || loading}
                className={errors.courtId ? 'error' : ''}
              >
                <option value="">
                  {loading ? 'Mahkemeler yükleniyor...' : 'Mahkeme Seçiniz'}
                </option>
                {courts.map(court => (
                  <option key={court.id} value={court.id}>
                    {court.name}
                  </option>
                ))}
              </select>
              {errors.courtId && <span className="error-message">{errors.courtId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="appointmentType">Randevu Türü *</label>
              <select
                id="appointmentType"
                name="appointmentType"
                value={formData.appointmentType}
                onChange={handleInputChange}
                className={errors.appointmentType ? 'error' : ''}
              >
                <option value="">Randevu Türü Seçiniz</option>
                {APPOINTMENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.appointmentType && <span className="error-message">{errors.appointmentType}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Açıklama</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Randevu ile ilgili detayları belirtiniz (isteğe bağlı)"
                rows="4"
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={handleNext} className="btn btn-primary">
                İleri
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="form-step">
            <h3>Tarih ve Saat Seçimi</h3>
            
            {selectedCourt && (
              <div className="selected-court-info">
                <h4>{selectedCourt.name}</h4>
                <p>{selectedCourt.address}</p>
              </div>
            )}

            <AppointmentCalendar
              selectedCourt={selectedCourt}
              selectedDate={formData.date}
              selectedSlot={selectedSlot}
              onSlotSelect={handleSlotSelect}
            />

            {errors.date && <div className="error-message">{errors.date}</div>}
            {errors.slotId && <div className="error-message">{errors.slotId}</div>}

            <div className="form-actions">
              <button type="button" onClick={handlePrevious} className="btn btn-secondary">
                Geri
              </button>
              <button type="button" onClick={handleNext} className="btn btn-primary">
                İleri
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="form-step">
            <h3>Randevu Özeti</h3>
            
            <div className="appointment-summary">
              <div className="summary-section">
                <h4>Mahkeme Bilgileri</h4>
                <div className="summary-item">
                  <span className="label">İl:</span>
                  <span className="value">
                    {PROVINCES.find(p => p.value === formData.province)?.label}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Mahkeme:</span>
                  <span className="value">{selectedCourt?.name}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Randevu Türü:</span>
                  <span className="value">
                    {APPOINTMENT_TYPES.find(t => t.value === formData.appointmentType)?.label}
                  </span>
                </div>
              </div>

              <div className="summary-section">
                <h4>Randevu Detayları</h4>
                <div className="summary-item">
                  <span className="label">Tarih:</span>
                  <span className="value">{formData.date}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Saat:</span>
                  <span className="value">
                    {selectedSlot && `${selectedSlot.startTime} - ${selectedSlot.endTime}`}
                  </span>
                </div>
                {formData.description && (
                  <div className="summary-item">
                    <span className="label">Açıklama:</span>
                    <span className="value">{formData.description}</span>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-actions">
              <button type="button" onClick={handlePrevious} className="btn btn-secondary">
                Geri
              </button>
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={createLoading}
              >
                {createLoading ? <LoadingSpinner size="small" /> : 'Randevuyu Onayla'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AppointmentForm;