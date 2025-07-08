import React, { useEffect } from 'react'
import { Layout, Menu, Typography, Divider, Dropdown, Button, Tag } from 'antd'
import { 
  UserOutlined, 
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  BankOutlined,
  SettingOutlined,
  LogoutOutlined,
  CrownOutlined,
  UserAddOutlined
} from '@ant-design/icons'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout, selectUser, loadTokenFromStorage } from '../../store/slices/authSlice'
import type { AppDispatch } from '../../store/store'

const { Header, Sider, Content } = Layout
const { Title, Text } = Typography

interface AppLayoutProps {
  children: React.ReactNode
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector(selectUser)

  // Component mount olduğunda token'ı localStorage'dan yükle
  useEffect(() => {
    dispatch(loadTokenFromStorage())
  }, [dispatch])

  // 401 hatalarını dinle (axios interceptor'dan gelen)
  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch(logout())
      navigate('/login')
    }

    window.addEventListener('unauthorized', handleUnauthorized)
    
    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized)
    }
  }, [dispatch, navigate])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  // User dropdown menu items
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profil Bilgileri',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Ayarlar',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Çıkış Yap',
      onClick: handleLogout,
    },
  ]

  // Role-based menu items
  const getMenuItems = () => {
    const baseItems = [
      {
        key: '/',
        icon: <DashboardOutlined />,
        label: <Link to="/">Ana Panel</Link>,
      },
    ]

    // Admin kullanıcılar için tüm menüler
    if (user?.role === 'admin') {
      return [
        ...baseItems,
        {
          key: '/employees',
          icon: <TeamOutlined />,
          label: <Link to="/employees">Çalışan Yönetimi</Link>,
        },
        {
          key: '/payrolls',
          icon: <FileTextOutlined />,
          label: <Link to="/payrolls">Bordro İşlemleri</Link>,
        },
        {
          key: '/registration-requests',
          icon: <UserAddOutlined />,
          label: <Link to="/registration-requests">Kayıt Talepleri</Link>,
        },
        {
          key: '/system-settings',
          icon: <SettingOutlined />,
          label: <Link to="/system-settings">Sistem Yönetimi</Link>,
        },
      ]
    }

    // Employee kullanıcılar için sadece kendi bilgileri
    return [
      ...baseItems,
      {
        key: '/my-profile',
        icon: <UserOutlined />,
        label: <Link to="/my-profile">Bilgilerim</Link>,
      },
      {
        key: '/my-payrolls',
        icon: <FileTextOutlined />,
        label: <Link to="/my-payrolls">Bordrolarım</Link>,
      },
    ]
  }

  const menuItems = getMenuItems()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="modern-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}>
              <BankOutlined style={{ fontSize: '24px', color: 'white' }} />
            </div>
            <div>
              <Title className="header-title">
                Bordro ve Maaş Yönetim Sistemi
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '14px', fontWeight: '500' }}>
                T.C. Kamu Kurumları İnsan Kaynakları Yönetim Sistemi
              </Text>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '8px 16px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {user?.role === 'admin' && (
                <CrownOutlined style={{ color: '#ffd700', fontSize: '14px' }} />
              )}
              <Text style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>
                {user?.email}
              </Text>
              <Tag 
                color={user?.role === 'admin' ? 'gold' : 'blue'} 
                style={{ 
                  marginLeft: '4px',
                  fontSize: '11px',
                  fontWeight: '500'
                }}
              >
                {user?.role === 'admin' ? 'YÖNETİCİ' : 'PERSONEL'}
              </Tag>
            </div>
            
            <Dropdown 
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Button
                type="text"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  transition: 'all 0.3s ease'
                }}
                icon={<UserOutlined style={{ fontSize: '16px' }} />}
              />
            </Dropdown>
          </div>
        </div>
      </Header>
      
      <Layout>
        <Sider
          width={280}
          className="modern-sidebar"
        >
          <div style={{ padding: '32px 24px 24px' }}>
            <div style={{
              textAlign: 'center',
              padding: '20px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <BankOutlined style={{ 
                fontSize: '32px', 
                color: '#4a5568',
                marginBottom: '12px',
                display: 'block'
              }} />
              <Text style={{ 
                fontWeight: '600', 
                color: '#2d3748',
                fontSize: '16px',
                display: 'block',
                marginBottom: '4px'
              }}>
                İnsan Kaynakları
              </Text>
              <Text style={{ 
                color: '#718096',
                fontSize: '12px'
              }}>
                Yönetim Sistemi
              </Text>
            </div>
          </div>
          
          <Divider style={{ margin: '0 24px 24px', borderColor: '#e2e8f0' }} />
          
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            className="sidebar-menu"
            items={menuItems}
            style={{ 
              border: 'none',
              background: 'transparent'
            }}
          />
          
          <div style={{ 
            position: 'absolute', 
            bottom: '24px', 
            left: '24px', 
            right: '24px'
          }}>
            <Divider style={{ margin: '0 0 20px', borderColor: '#e2e8f0' }} />
            <div style={{
              background: '#f8fafc',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
              border: '1px solid #e2e8f0'
            }}>
              <SettingOutlined style={{ 
                fontSize: '18px', 
                marginBottom: '8px',
                color: '#4a5568',
                display: 'block'
              }} />
              <Text style={{ 
                color: '#4a5568', 
                fontSize: '13px',
                fontWeight: '500'
              }}>
                Sistem Yönetimi
              </Text>
            </div>
          </div>
        </Sider>
        
        <Layout>
          <Content style={{ 
            background: '#f8fafc',
            minHeight: 'calc(100vh - 80px)',
            position: 'relative'
          }}>
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default AppLayout 