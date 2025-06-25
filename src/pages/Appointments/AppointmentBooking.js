import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppointmentForm from '../../components/Forms/AppointmentForm';
import './AppointmentBooking.css';

const AppointmentBooking = () => {
  const navigate = useNavigate();

  return (
    <div className="appointment-booking-page">
      <div className="page-header">
        <button 
          onClick={() => navigate(-1)}
          className="back-button"
          aria-label="Geri dön"
        >
          ← Geri
        </button>
        <div className="header-content">
          <h1 className="page-title">Mahkeme Randevusu Al</h1>
          <p className="page-description">
            Mahkeme randevunuzu kolayca alabilirsiniz. İşlem süreci 3 adımdan oluşmaktadır.
          </p>
        </div>
      </div>

      <div className="booking-content">
        <div className="booking-info">
          <div className="info-card">
            <h3>Randevu Alma Süreci</h3>
            <ul className="process-steps">
              <li>
                <span className="step-number">1</span>
                <div className="step-content">
                  <strong>Mahkeme Seçimi</strong>
                  <p>İl, mahkeme türü ve randevu türünü seçin</p>
                </div>
              </li>
              <li>
                <span className="step-number">2</span>
                <div className="step-content">
                  <strong>Tarih ve Saat</strong>
                  <p>Uygun tarih ve saati seçin</p>
                </div>
              </li>
              <li>
                <span className="step-number">3</span>
                <div className="step-content">
                  <strong>Onay</strong>
                  <p>Bilgilerinizi kontrol edip onaylayın</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="info-card">
            <h3>Dikkat Edilmesi Gerekenler</h3>
            <ul className="important-notes">
              <li>
                <span className="note-icon">⚠️</span>
                Randevu saatinden 15 dakika önce mahkemede bulunmanız gerekmektedir.
              </li>
              <li>
                <span className="note-icon">📋</span>
                Gerekli belgeleri yanınızda getirmeyi unutmayınız.
              </li>
              <li>
                <span className="note-icon">🕒</span>
                Randevu iptali için en az 24 saat önceden bildirim yapılmalıdır.
              </li>
              <li>
                <span className="note-icon">📱</span>
                Randevu detaylarına "Randevularım" sayfasından ulaşabilirsiniz.
              </li>
            </ul>
          </div>

          <div className="info-card">
            <h3>Gerekli Belgeler</h3>
            <div className="required-documents">
              <div className="document-category">
                <h4>Genel Belgeler</h4>
                <ul>
                  <li>T.C. Kimlik Kartı veya Nüfus Cüzdanı</li>
                  <li>Vekil varsa Vekaletname</li>
                </ul>
              </div>
              <div className="document-category">
                <h4>İşleme Özel Belgeler</h4>
                <ul>
                  <li>Dava dosyası (varsa)</li>
                  <li>İlgili evraklar</li>
                  <li>Mahkeme kararları (varsa)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="contact-info">
            <h3>Yardım mı Gerekiyor?</h3>
            <div className="contact-methods">
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <div>
                  <strong>Telefon Desteği</strong>
                  <p>444 1 XXX (Mesai saatleri içinde)</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <div>
                  <strong>E-posta Desteği</strong>
                  <p>destek@mahkeme.gov.tr</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="booking-form">
          <AppointmentForm />
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;