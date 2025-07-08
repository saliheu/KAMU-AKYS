import React from 'react'
import { Card, Typography, Button, Result } from 'antd'
import { CheckCircleOutlined, HomeOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

const { Title, Text } = Typography

const RegisterSuccess: React.FC = () => {
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
          maxWidth: '600px',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}
      >
        <Result
          icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '72px' }} />}
          title="Kayıt Talebiniz Alındı!"
          subTitle="Kayıt talebiniz başarıyla sistem yöneticisine iletildi."
          extra={[
            <div key="info" style={{ marginBottom: '24px' }}>
              <div style={{ 
                background: '#f6ffed', 
                border: '1px solid #b7eb8f',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
                textAlign: 'left'
              }}>
                <Title level={4} style={{ color: '#389e0d', marginBottom: '8px' }}>
                  📋 Sonraki Adımlar:
                </Title>
                <ul style={{ color: '#52c41a', marginBottom: 0, paddingLeft: '20px' }}>
                  <li>Sistem yöneticisi talebinizi inceleyecek</li>
                  <li>Onaylandığında email ile bilgilendirileceksiniz</li>
                  <li>Onay sonrası giriş yapabilirsiniz</li>
                </ul>
              </div>
              
              <div style={{ 
                background: '#fff7e6', 
                border: '1px solid #ffd591',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'left'
              }}>
                <Title level={4} style={{ color: '#d46b08', marginBottom: '8px' }}>
                  ⏱️ Bekleme Süresi:
                </Title>
                <Text style={{ color: '#fa8c16' }}>
                  Kayıt onayı genellikle 1-2 iş günü içinde tamamlanır. 
                  Acil durumlar için sistem yöneticisiyle iletişime geçebilirsiniz.
                </Text>
              </div>
            </div>,
            
            <Link key="home" to="/login">
              <Button 
                type="primary" 
                icon={<HomeOutlined />}
                size="large"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: '500',
                  borderRadius: '8px'
                }}
              >
                Giriş Sayfasına Dön
              </Button>
            </Link>
          ]}
        />
      </Card>
    </div>
  )
}

export default RegisterSuccess 