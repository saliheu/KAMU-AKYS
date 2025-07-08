import React, { useState, useEffect } from 'react'
import { 
  Typography, 
  Table, 
  Button, 
  Space, 
  message, 
  Card, 
  Tag, 
  Popconfirm,
  Empty,
  Spin,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Row,
  Col,
  Divider
} from 'antd'
import { CheckOutlined, CloseOutlined, UserOutlined, MailOutlined, ClockCircleOutlined, IdcardOutlined, CalendarOutlined, DollarOutlined } from '@ant-design/icons'
import { iamApi, employeeApi } from '../services/api'
import type { RegistrationRequest, ApproveRegistrationRequest } from '../types'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const RegistrationRequests: React.FC = () => {
  const [requests, setRequests] = useState<RegistrationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({})
  
  // Modal state
  const [approveModalVisible, setApproveModalVisible] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null)
  const [approveForm] = Form.useForm()

  // Kayıt taleplerini getir
  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await iamApi.getRegistrationRequests()
      setRequests(response.data)
      if (response.data.length > 0) {
        message.success(`${response.data.length} kayıt talebi yüklendi`)
      }
    } catch (error: any) {
      console.error('Kayıt talepleri yüklenirken hata:', error)
      message.error('Kayıt talepleri yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  // Onayla butonuna tıklandığında modal'ı aç
  const handleApproveClick = (request: RegistrationRequest) => {
    setSelectedRequest(request)
    setApproveModalVisible(true)
    // Formu varsayılan değerlerle doldur
    approveForm.setFieldsValue({
      title: '',
      hire_date: dayjs(),
      gross_salary: 15000,
      national_id: ''
    })
  }

  // Modal'daki nihai onay işlemi
  const handleApproveSubmit = async () => {
    if (!selectedRequest) return

    try {
      const values = await approveForm.validateFields()
      
      setActionLoading(prev => ({ ...prev, [selectedRequest.id]: true }))
      
      // ApproveRegistrationRequest formatına çevir
      const approvalData: ApproveRegistrationRequest = {
        title: values.title,
        hire_date: values.hire_date.format('YYYY-MM-DD'),
        gross_salary: values.gross_salary,
        national_id: values.national_id
      }

      // Kayıt talebini onayla ve personel oluştur
      await employeeApi.approveRegistrationAndCreateEmployee(selectedRequest.id, approvalData)
      
      message.success(`${selectedRequest.first_name} ${selectedRequest.last_name} kullanıcısının kayıt talebi onaylandı ve personel profili oluşturuldu!`)
      
      // Modal'ı kapat ve formu temizle
      setApproveModalVisible(false)
      setSelectedRequest(null)
      approveForm.resetFields()
      
      // Listeyi yenile
      await fetchRequests()
      
    } catch (error: any) {
      console.error('Kayıt talebi onaylanırken hata:', error)
      message.error('Kayıt talebi onaylanırken bir hata oluştu: ' + (error.response?.data?.detail || error.message))
    } finally {
      setActionLoading(prev => ({ ...prev, [selectedRequest?.id || 0]: false }))
    }
  }

  // Modal'ı kapat
  const handleApproveCancel = () => {
    setApproveModalVisible(false)
    setSelectedRequest(null)
    approveForm.resetFields()
  }

  // Kayıt talebini reddet (eski fonksiyon)
  const handleReject = async (requestId: number) => {
    try {
      setActionLoading(prev => ({ ...prev, [requestId]: true }))
      await iamApi.rejectRegistrationRequest(requestId)
      message.success('Kayıt talebi reddedildi')
      await fetchRequests()
    } catch (error: any) {
      console.error('Kayıt talebi reddedilirken hata:', error)
      message.error('Kayıt talebi reddedilirken bir hata oluştu')
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }))
    }
  }

  // Sayfa yüklendiğinde kayıt taleplerini getir
  useEffect(() => {
    fetchRequests()
  }, [])

  // Tablo sütunları
  const columns: ColumnsType<RegistrationRequest> = [
    {
      title: 'Ad Soyad',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (_, record) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <Text strong>{`${record.first_name} ${record.last_name}`}</Text>
        </Space>
      ),
      sorter: (a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`),
    },
    {
      title: 'E-posta',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => (
        <Space>
          <MailOutlined style={{ color: '#52c41a' }} />
          <Text copyable>{text}</Text>
        </Space>
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
      filters: [
        { text: 'Yönetici', value: 'admin' },
        { text: 'Personel', value: 'employee' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Talep Tarihi',
      dataIndex: 'requested_at',
      key: 'requested_at',
      render: (date: string) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#faad14' }} />
          <Text>{new Date(date).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</Text>
        </Space>
      ),
      sorter: (a, b) => new Date(a.requested_at).getTime() - new Date(b.requested_at).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            loading={actionLoading[record.id]}
            size="small"
            onClick={() => handleApproveClick(record)}
          >
            Onayla
          </Button>
          
          <Popconfirm
            title="Kayıt Talebini Reddet"
            description={`${record.first_name} ${record.last_name} kullanıcısının kayıt talebini reddetmek istediğinizden emin misiniz?`}
            onConfirm={() => handleReject(record.id)}
            okText="Evet, Reddet"
            cancelText="İptal"
            okButtonProps={{ danger: true, loading: actionLoading[record.id] }}
          >
            <Button
              danger
              icon={<CloseOutlined />}
              loading={actionLoading[record.id]}
              size="small"
            >
              Reddet
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px' }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            <UserOutlined style={{ marginRight: '8px' }} />
            Kayıt Talepleri
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            Onay bekleyen kullanıcı kayıt taleplerini yönetebilirsiniz
          </Text>
        </div>

        <Spin spinning={loading}>
          {requests.length === 0 && !loading ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Text strong style={{ fontSize: '16px', color: '#595959' }}>
                    Onay bekleyen yeni kayıt talebi bulunmamaktadır
                  </Text>
                  <br />
                  <Text type="secondary">
                    Yeni kullanıcılar kayıt olduktan sonra talepleri burada görünecektir
                  </Text>
                </div>
              }
            />
          ) : (
            <Table
              columns={columns}
              dataSource={requests}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} / ${total} kayıt`,
              }}
              scroll={{ x: 800 }}
              bordered
              size="middle"
            />
          )}
        </Spin>
      </Card>

      {/* Onaylama Modal'ı */}
      <Modal
        title={
          <div>
            <CheckOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
            Kayıt Talebini Onayla ve Personel Oluştur
          </div>
        }
        open={approveModalVisible}
        onOk={handleApproveSubmit}
        onCancel={handleApproveCancel}
        okText="Onayı Tamamla ve Personel Oluştur"
        cancelText="İptal"
        okButtonProps={{ 
          loading: actionLoading[selectedRequest?.id || 0],
          size: 'large'
        }}
        cancelButtonProps={{ size: 'large' }}
        width={600}
        destroyOnClose
      >
        {selectedRequest && (
    <div>
            {/* Kullanıcı Bilgileri */}
            <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
              <Title level={4} style={{ marginBottom: '12px', color: '#1890ff' }}>
                <UserOutlined style={{ marginRight: '8px' }} />
                Kullanıcı Bilgileri
              </Title>
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text strong>Ad Soyad:</Text>
                  <br />
                  <Text>{`${selectedRequest.first_name} ${selectedRequest.last_name}`}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>E-posta:</Text>
                  <br />
                  <Text>{selectedRequest.email}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Rol:</Text>
                  <br />
                  <Tag color={selectedRequest.role === 'admin' ? 'red' : 'blue'}>
                    {selectedRequest.role === 'admin' ? 'Yönetici' : 'Personel'}
                  </Tag>
                </Col>
                <Col span={12}>
                  <Text strong>Talep Tarihi:</Text>
                  <br />
                  <Text>{new Date(selectedRequest.requested_at).toLocaleDateString('tr-TR')}</Text>
                </Col>
              </Row>
            </div>

            <Divider>Personel Bilgilerini Tamamlayın</Divider>

            {/* Personel Bilgileri Formu */}
            <Form
              form={approveForm}
              layout="vertical"
              requiredMark={false}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="title"
                    label={
                      <span>
                        <IdcardOutlined style={{ marginRight: '4px' }} />
                        Unvan
                      </span>
                    }
                    rules={[{ required: true, message: 'Unvan gereklidir' }]}
                  >
                    <Input 
                      placeholder="örn. Yazılım Geliştirici, İK Uzmanı"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="national_id"
                    label={
                      <span>
                        <IdcardOutlined style={{ marginRight: '4px' }} />
                        TC Kimlik No
                      </span>
                    }
                    rules={[
                      { required: true, message: 'TC Kimlik No gereklidir' },
                      { len: 11, message: 'TC Kimlik No 11 haneli olmalıdır' },
                      { pattern: /^\d+$/, message: 'Sadece rakam girebilirsiniz' }
                    ]}
                  >
                    <Input 
                      placeholder="TC Kimlik No (11 hane)"
                      maxLength={11}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="hire_date"
                    label={
                      <span>
                        <CalendarOutlined style={{ marginRight: '4px' }} />
                        İşe Başlama Tarihi
                      </span>
                    }
                    rules={[{ required: true, message: 'İşe başlama tarihi gereklidir' }]}
                  >
                    <DatePicker 
                      style={{ width: '100%' }}
                      placeholder="Tarih seçin"
                      format="DD/MM/YYYY"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="gross_salary"
                    label={
                      <span>
                        <DollarOutlined style={{ marginRight: '4px' }} />
                        Brüt Maaş (TL)
                      </span>
                    }
                    rules={[
                      { required: true, message: 'Brüt maaş gereklidir' },
                      { type: 'number', min: 1, message: 'Maaş 0\'dan büyük olmalıdır' }
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Brüt maaş tutarı"
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fff7e6', borderRadius: '6px', border: '1px solid #ffd591' }}>
              <Text type="warning" style={{ fontSize: '14px' }}>
                <strong>Bilgilendirme:</strong> Bu işlem tamamlandığında kullanıcı hesabı aktifleştirilecek ve personel profili oluşturulacaktır. Bu işlem geri alınamaz.
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default RegistrationRequests
