import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, Alert, Select, message } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const { Title, Text } = Typography
const { Option } = Select

interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  first_name: string
  last_name: string
  role: string
}

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const navigate = useNavigate()

  const onFinish = async (values: RegisterForm) => {
    try {
      setLoading(true)
      
      // IAM servisine kayıt talebi gönder
      await axios.post('http://localhost:8001/register', {
        email: values.email,
        password: values.password,
        first_name: values.first_name,
        last_name: values.last_name,
        role: values.role
      })

      message.success('Kayıt talebiniz başarıyla gönderildi!')
      
      // Success sayfasına yönlendir
      navigate('/register-success')
      
    } catch (error: any) {
      console.error('Registration error:', error)
      if (error.response?.data?.detail) {
        message.error(error.response.data.detail)
      } else {
        message.error('Kayıt olurken bir hata oluştu')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: '500px',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2} style={{ color: '#1e293b', marginBottom: '8px' }}>
            Kayıt Ol
          </Title>
          <Text style={{ color: '#64748b', fontSize: '16px' }}>
            Yeni hesap oluşturun
          </Text>
        </div>

        <Alert
          message="Kayıt Onay Süreci"
          description="Kayıt talebiniz sistem yöneticisi tarafından incelendikten sonra onaylanacaktır. Onaylandığında email adresinize bilgilendirme gönderilecektir."
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="first_name"
            label="Ad"
            rules={[
              { required: true, message: 'Ad gereklidir!' },
              { min: 2, message: 'Ad en az 2 karakter olmalıdır!' }
            ]}
          >
            <Input 
              prefix={<IdcardOutlined />} 
              placeholder="Adınız"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Soyad"
            rules={[
              { required: true, message: 'Soyad gereklidir!' },
              { min: 2, message: 'Soyad en az 2 karakter olmalıdır!' }
            ]}
          >
            <Input 
              prefix={<IdcardOutlined />} 
              placeholder="Soyadınız"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email adresi gereklidir!' },
              { type: 'email', message: 'Geçerli bir email adresi girin!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="email@ornek.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="Kullanıcı Rolü"
            rules={[{ required: true, message: 'Rol seçimi gereklidir!' }]}
          >
            <Select placeholder="Rol seçiniz" size="large">
              <Option value="employee">Personel</Option>
              <Option value="admin">Yönetici</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            label="Parola"
            rules={[
              { required: true, message: 'Parola gereklidir!' },
              { min: 6, message: 'Parola en az 6 karakter olmalıdır!' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Parolanız"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Parola Tekrar"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Parola tekrarı gereklidir!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Parolalar eşleşmiyor!'))
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Parolanızı tekrar girin"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '16px' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{
                width: '100%',
                height: '48px',
                fontSize: '16px',
                fontWeight: '500',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              Kayıt Talebini Gönder
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: '#64748b' }}>
              Zaten hesabınız var mı?{' '}
              <Link 
                to="/login" 
                style={{ 
                  color: '#667eea',
                  fontWeight: '500',
                  textDecoration: 'none'
                }}
              >
                Giriş Yap
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default Register 