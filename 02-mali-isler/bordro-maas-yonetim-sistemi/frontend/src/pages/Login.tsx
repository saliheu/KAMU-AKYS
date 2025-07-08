import React, { useEffect } from 'react'
import { Form, Input, Button, Card, Typography, Alert } from 'antd'
import { UserOutlined, LockOutlined, BankOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { login, clearError, selectAuth } from '../store/slices/authSlice'
import type { AppDispatch } from '../store/store'

const { Title, Text } = Typography

interface LoginForm {
  email: string
  password: string
}

const Login: React.FC = () => {
  const [form] = Form.useForm()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const location = useLocation()
  const { loading, error, isAuthenticated } = useSelector(selectAuth)

  // Giriş başarılı ise ana sayfaya yönlendir
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  // Error temizle component mount olduğunda
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const handleSubmit = async (values: LoginForm) => {
    try {
      await dispatch(login(values)).unwrap()
      // Navigation authSlice'da başarılı giriş sonrası otomatik olacak
    } catch (error) {
      // Error handling authSlice'da yapılıyor
      console.error('Login failed:', error)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          borderRadius: '12px',
          border: 'none'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <BankOutlined 
            style={{ 
              fontSize: '48px', 
              color: '#1e3c72',
              marginBottom: '16px'
            }} 
          />
          <Title level={3} style={{ 
            color: '#1e3c72', 
            marginBottom: '8px',
            fontWeight: 600
          }}>
            T.C. Kamu Kurumları
          </Title>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            İnsan Kaynakları Yönetim Sistemi
          </Text>
        </div>

        {error && (
          <Alert
            message="Giriş Hatası"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '20px' }}
            closable
            onClose={() => dispatch(clearError())}
          />
        )}

        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
          autoComplete="off"
        >
          <Form.Item
            name="email"
            label="E-posta Adresi"
            rules={[
              { required: true, message: 'E-posta adresi gereklidir' },
              { type: 'email', message: 'Geçerli bir e-posta adresi giriniz' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="kullanici@kurum.gov.tr"
              style={{ borderRadius: '6px' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Parola"
            rules={[
              { required: true, message: 'Parola gereklidir' },
              { min: 6, message: 'Parola en az 6 karakter olmalıdır' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Parolanızı giriniz"
              style={{ borderRadius: '6px' }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: '24px' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: '42px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                border: 'none',
                fontSize: '16px',
                fontWeight: 500
              }}
            >
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Text style={{ color: '#64748b' }}>
              Hesabınız yok mu?{' '}
              <Link 
                to="/register" 
                style={{ 
                  color: '#1e3c72',
                  fontWeight: '500',
                  textDecoration: 'none'
                }}
              >
                Kayıt Ol
              </Link>
            </Text>
          </div>
        </Form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px',
          padding: '15px',
          background: '#f8f9fa',
          borderRadius: '6px'
        }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <strong>Demo Hesaplar:</strong><br />
            Admin: admin@test.com / password<br />
            Personel: employee@test.com / password
          </Text>
        </div>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px',
          borderTop: '1px solid #f0f0f0',
          paddingTop: '15px'
        }}>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            © 2024 T.C. Kamu Kurumları - Tüm hakları saklıdır
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default Login 