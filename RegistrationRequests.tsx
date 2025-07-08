import React, { useEffect, useState } from 'react'
import { Card, Table, Typography, Button, Space, Tag, Modal, message, Descriptions, Empty } from 'antd'
import { CheckOutlined, CloseOutlined, UserAddOutlined, EyeOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import axios from 'axios'

const { Title, Text } = Typography

interface RegistrationRequest {
  id: number
  email: string
  full_name: string
  role: string
  requested_at: string
}

const RegistrationRequests: React.FC = () => {
  const [requests, setRequests] = useState<RegistrationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      
      if (!token) {
        message.error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.')
        return
      }

      console.log('Kayıt talepleri getiriliyor...')
      const response = await axios.get('http://localhost:8001/admin/registrations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('Kayıt talepleri yanıtı:', response.data)
      setRequests(response.data)
      
    } catch (error: any) {
      console.error('Fetch requests error:', error)
      if (error.response?.status === 403) {
        message.error('Bu işlem için admin yetkisi gerekli')
      } else if (error.response?.status === 401) {
        message.error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.')
      } else {
        message.error('Kayıt talepleri yüklenirken hata oluştu')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: number) => {
    try {
      setProcessingId(requestId)
      const token = localStorage.getItem('auth_token')
      
      await axios.post(`http://localhost:8001/admin/registrations/approve/${requestId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      message.success('Kayıt talebi onaylandı!')
      fetchRequests()
      
    } catch (error: any) {
      console.error('Approve error:', error)
      if (error.response?.data?.detail) {
        message.error(error.response.data.detail)
      } else {
        message.error('Onaylama işlemi sırasında hata oluştu')
      }
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (requestId: number) => {
    Modal.confirm({
      title: 'Kayıt Talebini Reddet',
      content: 'Bu kayıt talebini reddetmek istediğinizden emin misiniz?',
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'İptal',
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          setProcessingId(requestId)
          const token = localStorage.getItem('auth_token')
          
          await axios.post(`http://localhost:8001/admin/registrations/reject/${requestId}`, {}, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          message.success('Kayıt talebi reddedildi')
          fetchRequests()
          
        } catch (error: any) {
          console.error('Reject error:', error)
          message.error('Reddetme işlemi sırasında hata oluştu')
        } finally {
          setProcessingId(null)
        }
      }
    })
  }

  const handleViewDetails = (request: RegistrationRequest) => {
    setSelectedRequest(request)
    setDetailModalVisible(true)
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const columns = [
    {
      title: 'Ad Soyad',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (name: string) => (
        <Text strong style={{ color: '#1e293b' }}>{name}</Text>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => (
        <Text style={{ color: '#0369a1' }}>{email}</Text>
      ),
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? 'Yönetici' : 'Personel'}
        </Tag>
      ),
    },
    {
      title: 'Talep Tarihi',
      dataIndex: 'requested_at',
      key: 'requested_at',
      render: (date: string) => (
        <Text style={{ color: '#6b7280' }}>{formatDate(date)}</Text>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (record: RegistrationRequest) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetails(record)}
          >
            Detay
          </Button>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            size="small"
            loading={processingId === record.id}
            onClick={() => handleApprove(record.id)}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            Onayla
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            size="small"
            loading={processingId === record.id}
            onClick={() => handleReject(record.id)}
          >
            Reddet
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0, color: '#1e293b' }}>
              Kayıt Talepleri
            </Title>
            <Text style={{ color: '#6b7280', fontSize: '16px' }}>
              Onay bekleyen kullanıcı kayıt taleplerini yönetin
            </Text>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <UserAddOutlined />
            {requests.length} Bekleyen Talep
          </div>
        </div>
      </div>

      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClockCircleOutlined />
            Onay Bekleyen Talepler
          </div>
        }
        style={{ borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
      >
        {!loading && requests.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div style={{ textAlign: 'center' }}>
                <Title level={4} style={{ color: '#6b7280', marginTop: '16px' }}>
                  Bekleyen Talep Yok
                </Title>
                <Text style={{ color: '#9ca3af' }}>
                  Şu anda onay bekleyen kayıt talebi bulunmamaktadır.
                </Text>
              </div>
            }
          />
        ) : (
          <Table
            columns={columns}
            dataSource={requests}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} / ${total} talep`
            }}
          />
        )}
      </Card>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserAddOutlined />
            Kayıt Talebi Detayları
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Kapat
          </Button>,
          selectedRequest && (
            <Space key="actions">
              <Button
                type="primary"
                icon={<CheckOutlined />}
                loading={processingId === selectedRequest.id}
                onClick={() => {
                  handleApprove(selectedRequest.id)
                  setDetailModalVisible(false)
                }}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Onayla
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                loading={processingId === selectedRequest.id}
                onClick={() => {
                  handleReject(selectedRequest.id)
                  setDetailModalVisible(false)
                }}
              >
                Reddet
              </Button>
            </Space>
          )
        ]}
        width={600}
      >
        {selectedRequest && (
          <Descriptions 
            title="Talep Bilgileri"
            bordered 
            column={1}
            style={{ marginTop: '16px' }}
          >
            <Descriptions.Item label="Ad Soyad">
              <Text strong>{selectedRequest.full_name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Email Adresi">
              <Text copyable>{selectedRequest.email}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Talep Edilen Rol">
              <Tag color={selectedRequest.role === 'admin' ? 'red' : 'blue'}>
                {selectedRequest.role === 'admin' ? 'Yönetici' : 'Personel'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Talep Tarihi">
              {formatDate(selectedRequest.requested_at)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default RegistrationRequests 