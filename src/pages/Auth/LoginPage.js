import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginWithEDevlet, clearError } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import './LoginPage.css';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    tcNo: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  
  const from = location.state?.from || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    // Clear any existing errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  const validateForm = () => {
    const newErrors = {};

    if (!credentials.tcNo) {
      newErrors.tcNo = 'T.C. Kimlik Numarası gereklidir';
    } else if (!/^\d{11}$/.test(credentials.tcNo)) {
      newErrors.tcNo = 'T.C. Kimlik Numarası 11 haneli olmalıdır';
    }

    if (!credentials.password) {
      newErrors.password = 'E-Devlet şifresi gereklidir';
    } else if (credentials.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Only allow numbers for TC No
    if (name === 'tcNo' && !/^\d*$/.test(value)) {
      return;
    }

    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field-specific error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear general error
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(loginWithEDevlet({
        ...credentials,
        rememberMe
      })).unwrap();
      
      // Navigation will be handled by useEffect
    } catch (error) {
      // Error is handled by Redux slice
      console.error('Login error:', error);
    }
  };

  const handleEDevletRedirect = () => {
    // In a real application, this would redirect to E-Devlet authentication
    window.open('https://giris.turkiye.gov.tr', '_blank');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="logo">
            <img 
              src="/assets/logo-tc.png" 
              alt="T.C. Logo" 
              className="tc-logo"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <h1>Mahkeme Randevu Sistemi</h1>
          <p>E-Devlet ile güvenli giriş yapın</p>
        </div>

        <div className="login-form-container">
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="tcNo">T.C. Kimlik Numarası</label>
              <input
                type="text"
                id="tcNo"
                name="tcNo"
                value={credentials.tcNo}
                onChange={handleInputChange}
                placeholder="11 haneli T.C. Kimlik Numaranız"
                maxLength="11"
                className={errors.tcNo ? 'error' : ''}
                disabled={loading}
              />
              {errors.tcNo && <span className="error-message">{errors.tcNo}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">E-Devlet Şifreniz</label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                placeholder="E-Devlet şifrenizi giriniz"
                className={errors.password ? 'error' : ''}
                disabled={loading}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span className="checkmark"></span>
                Beni hatırla
              </label>
            </div>

            {error && (
              <div className="error-banner">
                <div className="error-content">
                  <span className="error-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" color="white" />
                  Giriş yapılıyor...
                </>
              ) : (
                'E-Devlet ile Giriş Yap'
              )}
            </button>
          </form>

          <div className="login-alternatives">
            <div className="divider">
              <span>veya</span>
            </div>
            
            <button 
              type="button"
              onClick={handleEDevletRedirect}
              className="edevlet-redirect-btn"
              disabled={loading}
            >
              <img 
                src="/assets/edevlet-logo.png" 
                alt="E-Devlet" 
                className="edevlet-logo"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              E-Devlet'e Git
            </button>
          </div>
        </div>

        <div className="login-footer">
          <div className="help-links">
            <a href="#" className="help-link">E-Devlet şifremi unuttum</a>
            <a href="#" className="help-link">Yardım</a>
            <a href="#" className="help-link">İletişim</a>
          </div>
          
          <div className="security-info">
            <div className="security-badge">
              <span className="security-icon">🔒</span>
              <div className="security-text">
                <strong>Güvenli Bağlantı</strong>
                <span>SSL ile korunmaktadır</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-sidebar">
        <div className="sidebar-content">
          <h2>Mahkeme Randevu Sistemi</h2>
          <ul className="feature-list">
            <li>
              <span className="feature-icon">📅</span>
              <div>
                <strong>Kolay Randevu Alma</strong>
                <p>Mahkeme randevularınızı kolayca alın</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">⏰</span>
              <div>
                <strong>Zaman Tasarrufu</strong>
                <p>Kuyrukta beklemeyin, online işlem yapın</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">🔐</span>
              <div>
                <strong>Güvenli İşlem</strong>
                <p>E-Devlet güvencesiyle işlem yapın</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">📱</span>
              <div>
                <strong>Mobil Uyumlu</strong>
                <p>Her cihazdan erişim sağlayın</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;