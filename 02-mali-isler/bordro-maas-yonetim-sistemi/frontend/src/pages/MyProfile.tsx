import React, { useEffect, useState } from 'react'
import { Card, Descriptions, Typography, Spin, Alert, Tag, Divider } from 'antd'
import { UserOutlined, CalendarOutlined, DollarOutlined, IdcardOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import { employeeApi } from '../services/api'
import { selectUser } from '../store/slices/authSlice'
import type { Employee } from '../types'

const { Title, Text } = Typography

const MyProfile: React.FC = () => {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const user = useSelector(selectUser)

  useEffect(() => {
    fetchEmployeeProfile()
  }, [])

  const fetchEmployeeProfile = async () => {
    try {
      setLoading(true)
      const response = await employeeApi.getAll()
      if (response.data && response.data.length > 0) {
        setEmployee(response.data[0]) // Employee sadece kendi bilgisini görebilir
      } else {
        setError('Profil bilgisi bulunamadı')
      }
    } catch (error) {
      console.error('Profile fetch error:', error)
      setError('Profil bilgileri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text style={{ color: '#6b7280' }}>Profil bilgileriniz yükleniyor...</Text>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert
        message="Hata"
        description={error}
        type="error"
        showIcon
        style={{ margin: '32px' }}
      />
    )
  }

  if (!employee) {
    return (
      <Alert
        message="Profil Bulunamadı"
        description="Personel profil bilgileriniz bulunamadı. Lütfen sistem yöneticisiyle iletişime geçin."
        type="warning"
        showIcon
        style={{ margin: '32px' }}
      />
    )
  }

  return (
    <div className="page-container fade-in-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <Title className="page-title">
            Kişisel Bilgilerim
          </Title>
          <Text style={{ color: '#6b7280', fontSize: '16px' }}>
            Personel profil bilgilerim ve iş durumum
          </Text>
        </div>
        <div style={{
          background: 'var(--primary-gradient)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <UserOutlined />
          Personel Profili
        </div>
      </div>

      {/* Profil Kartı */}
      <Card className="modern-card" style={{ marginBottom: '24px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '20px',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '32px'
          }}>
            <UserOutlined />
          </div>
          <div>
            <Title level={2} style={{ margin: 0, color: '#1e293b' }}>
              {employee.first_name} {employee.last_name}
            </Title>
            <Text style={{ fontSize: '18px', color: '#64748b', marginTop: '4px', display: 'block' }}>
              {employee.title}
            </Text>
            <Tag color="blue" style={{ marginTop: '8px' }}>
              Aktif Personel
            </Tag>
          </div>
        </div>

        <Divider />

        <Descriptions 
          title="Kişisel Bilgiler"
          bordered
          column={2}
          size="middle"
          labelStyle={{ 
            backgroundColor: '#f8fafc',
            fontWeight: '500'
          }}
        >
          <Descriptions.Item 
            label={
              <span>
                <IdcardOutlined style={{ marginRight: '8px', color: '#059669' }} />
                TC Kimlik No
              </span>
            }
            span={2}
          >
            <Text strong>{employee.national_id}</Text>
          </Descriptions.Item>
          
          <Descriptions.Item 
            label={
              <span>
                <UserOutlined style={{ marginRight: '8px', color: '#0369a1' }} />
                Ad
              </span>
            }
          >
            {employee.first_name}
          </Descriptions.Item>
          
          <Descriptions.Item 
            label={
              <span>
                <UserOutlined style={{ marginRight: '8px', color: '#0369a1' }} />
                Soyad
              </span>
            }
          >
            {employee.last_name}
          </Descriptions.Item>
          
          <Descriptions.Item 
            label={
              <span>
                <CalendarOutlined style={{ marginRight: '8px', color: '#d97706' }} />
                İşe Başlama Tarihi
              </span>
            }
          >
            {formatDate(employee.hire_date)}
          </Descriptions.Item>
          
          <Descriptions.Item 
            label={
              <span>
                <DollarOutlined style={{ marginRight: '8px', color: '#059669' }} />
                Brüt Maaş
              </span>
            }
          >
            <Text strong style={{ color: '#059669', fontSize: '16px' }}>
              {formatCurrency(employee.gross_salary)}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Hesap Bilgileri */}
      <Card className="modern-card" title="Hesap Bilgileri">
        <Descriptions 
          bordered
          column={1}
          size="middle"
          labelStyle={{ 
            backgroundColor: '#f8fafc',
            fontWeight: '500'
          }}
        >
          <Descriptions.Item 
            label={
              <span>
                <UserOutlined style={{ marginRight: '8px', color: '#7c3aed' }} />
                Email Adresi
              </span>
            }
          >
            {user?.email}
          </Descriptions.Item>
          
          <Descriptions.Item 
            label={
              <span>
                <IdcardOutlined style={{ marginRight: '8px', color: '#dc2626' }} />
                Kullanıcı Rolü
              </span>
            }
          >
            <Tag color="blue">PERSONEL</Tag>
          </Descriptions.Item>
          
          <Descriptions.Item 
            label={
              <span>
                <CalendarOutlined style={{ marginRight: '8px', color: '#059669' }} />
                Hesap Durumu
              </span>
            }
          >
            <Tag color="green">Aktif</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Bilgi Notu */}
      <Alert
        message="Bilgilendirme"
        description="Kişisel bilgilerinizde herhangi bir değişiklik yapmanız gerekiyorsa, lütfen İnsan Kaynakları departmanıyla iletişime geçiniz."
        type="info"
        showIcon
        style={{ marginTop: '24px' }}
      />
    </div>
  )
}

export default MyProfile 