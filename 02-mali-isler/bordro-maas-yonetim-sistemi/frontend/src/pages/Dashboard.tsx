import React, { useEffect, useState } from 'react'
import { Card, Col, Row, Statistic, Typography, Spin, Alert, Progress, Table, Modal, Form, Input, InputNumber, DatePicker, Select, message, Button } from 'antd'
import { 
  UserOutlined, 
  FileTextOutlined, 
  DollarOutlined, 
  CalendarOutlined,
  TeamOutlined,
  BankOutlined,
  LogoutOutlined
} from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import type { RootState, AppDispatch } from '../store/store'
import { fetchDashboardStats } from '../store/slices/dashboardSlice'
import { fetchEmployees, createEmployee, createEmployeeWithAccount } from '../store/slices/employeeSlice'
import { createPayroll } from '../store/slices/payrollSlice'
import { selectUser, selectIsAdmin, logout } from '../store/slices/authSlice'
import { payrollApi } from '../services/api'
import type { PayrollCreate, RecentActivity, DirectEmployeeCreate } from '../types'

const { Title, Text, Paragraph } = Typography
const { RangePicker } = DatePicker

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { stats, loading, error } = useSelector((state: RootState) => state.dashboard)
  const { employees } = useSelector((state: RootState) => state.employee)
  const user = useSelector(selectUser)
  const isAdmin = useSelector(selectIsAdmin)
  
  // Modal states
  const [isDirectEmployeeModalVisible, setIsDirectEmployeeModalVisible] = useState(false)
  const [isPayrollModalVisible, setIsPayrollModalVisible] = useState(false)
  const [isReportModalVisible, setIsReportModalVisible] = useState(false)
  
  // Recent activities state
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(false)
  
  // Forms
  const [directEmployeeForm] = Form.useForm()
  const [payrollForm] = Form.useForm()

  // API call for recent activities
  const fetchRecentActivities = async () => {
    try {
      setActivitiesLoading(true)
      const response = await payrollApi.getRecentActivities(8)
      setRecentActivities(response.data)
    } catch (error) {
      console.error('Activities fetch error:', error)
    } finally {
      setActivitiesLoading(false)
    }
  }



  useEffect(() => {
    dispatch(fetchDashboardStats())
    dispatch(fetchEmployees())
    fetchRecentActivities()
  }, [dispatch])

  // Hızlı İşlem Handlers
  const handleDirectCreateEmployee = () => {
    directEmployeeForm.resetFields()
    setIsDirectEmployeeModalVisible(true)
  }

  const handleCreatePayroll = () => {
    payrollForm.resetFields()
    setIsPayrollModalVisible(true)
  }

  const handleUpdateSalary = () => {
    navigate('/employees')
    message.info('Çalışanlar sayfasında maaş bilgilerini güncelleyebilirsiniz')
  }

  const handleGenerateReport = () => {
    setIsReportModalVisible(true)
  }

  // Modal Submit Handlers
  const handlePayrollSubmit = async () => {
    try {
      const values = await payrollForm.validateFields()
      const [startDate, endDate] = values.period
      
      const formData: PayrollCreate = {
        employee_id: values.employee_id,
        pay_period_start: startDate.format('YYYY-MM-DD'),
        pay_period_end: endDate.format('YYYY-MM-DD')
      }

      await dispatch(createPayroll(formData)).unwrap()
      message.success('Bordro başarıyla oluşturuldu')
      setIsPayrollModalVisible(false)
      payrollForm.resetFields()
      // Dashboard stats'ı ve activities'i yenile
      dispatch(fetchDashboardStats())
      fetchRecentActivities()
    } catch (error) {
      message.error('Bordro oluşturulurken hata oluştu')
    }
  }

  const handleDirectEmployeeSubmit = async () => {
    try {
      const values = await directEmployeeForm.validateFields()
      const formData: DirectEmployeeCreate = {
        ...values,
        hire_date: values.hire_date.format('YYYY-MM-DD')
      }

      const result = await dispatch(createEmployeeWithAccount(formData)).unwrap()
      message.success(`Personel ve kullanıcı hesabı başarıyla oluşturuldu! Email: ${formData.email}`)
      setIsDirectEmployeeModalVisible(false)
      directEmployeeForm.resetFields()
      // Dashboard stats'ı ve activities'i yenile
      dispatch(fetchDashboardStats())
      fetchRecentActivities()
    } catch (error: any) {
      console.error('Direct employee creation error:', error)
      message.error(error.message || 'Personel ve hesap oluşturulurken hata oluştu')
    }
  }

  const handleReportGenerate = () => {
    // Basit rapor oluşturma simülasyonu
    const reportData = {
      totalEmployees: stats?.total_employees || 0,
      totalPayrolls: stats?.total_payrolls || 0,
      totalGross: stats?.total_gross_salary || 0,
      totalNet: stats?.total_net_salary || 0,
      generatedAt: new Date().toLocaleString('tr-TR')
    }

    const reportContent = `
BORDRO VE MAAŞ YÖNETİM SİSTEMİ
İstatistik Raporu

Rapor Tarihi: ${reportData.generatedAt}

GENEL İSTATİSTİKLER:
- Toplam Çalışan Sayısı: ${reportData.totalEmployees}
- Toplam Bordro Sayısı: ${reportData.totalPayrolls}
- Toplam Brüt Maaş: ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(reportData.totalGross)}
- Toplam Net Maaş: ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(reportData.totalNet)}

Bu rapor sistem tarafından otomatik olarak oluşturulmuştur.
    `

    // Raporu yeni pencerede aç
    const newWindow = window.open('', '_blank')
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Sistem Raporu</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; line-height: 1.6; }
              h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
              pre { background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
            </style>
          </head>
          <body>
            <h1>İnsan Kaynakları Sistem Raporu</h1>
            <pre>${reportContent}</pre>
            <button onclick="window.print()" style="background: #1e40af; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-top: 20px;">Yazdır</button>
          </body>
        </html>
      `)
      newWindow.document.close()
    }

    setIsReportModalVisible(false)
    message.success('Rapor başarıyla oluşturuldu')
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text style={{ color: '#6b7280' }}>Veriler yükleniyor...</Text>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert
        message="Sistem Hatası"
        description={error}
        type="error"
        showIcon
        style={{ margin: '32px' }}
      />
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }



  const activityColumns = [
    {
      title: 'İşlem',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Detaylar',
      dataIndex: 'details',
      key: 'details',
    },
    {
      title: 'Zaman',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <span style={{ 
          color: type === 'payroll' ? '#059669' : type === 'employee' ? '#0369a1' : '#d97706',
          fontWeight: '500'
        }}>
          {type === 'payroll' ? 'Bordro' : type === 'employee' ? 'Çalışan' : 'Sistem'}
        </span>
      ),
    },
  ]

  return (
    <div className="page-container fade-in-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <Title className="page-title">
            Sistem Ana Paneli
          </Title>
          <Paragraph style={{ margin: 0, color: '#6b7280', fontSize: '16px' }}>
            İnsan kaynakları yönetim sistemi genel durumu ve istatistikleri
          </Paragraph>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={() => dispatch(logout())}
            style={{
              borderRadius: '8px',
              fontWeight: '500'
            }}
          >
            Çıkış Yap (Test)
          </Button>
          <div style={{
            background: 'var(--primary-gradient)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {new Date().toLocaleDateString('tr-TR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="dashboard-stats-grid">
        <Card className="stats-card">
          <div className="stats-icon">
            <TeamOutlined />
          </div>
          <Statistic
            title="Toplam Çalışan Sayısı"
            value={stats?.total_employees || 0}
            valueStyle={{ 
              color: 'var(--text-primary)',
              fontSize: '2.5rem',
              fontWeight: '800'
            }}
          />
          <div style={{ marginTop: '12px' }}>
            <Text style={{ color: '#059669', fontSize: '14px', fontWeight: '500' }}>
              ↗ Aktif personel
            </Text>
          </div>
        </Card>
        
        <Card className="stats-card">
          <div className="stats-icon">
            <FileTextOutlined />
          </div>
          <Statistic
            title="Toplam Bordro Sayısı"
            value={stats?.total_payrolls || 0}
            valueStyle={{ 
              color: 'var(--text-primary)',
              fontSize: '2.5rem',
              fontWeight: '800'
            }}
          />
          <div style={{ marginTop: '12px' }}>
            <Text style={{ color: '#0369a1', fontSize: '14px', fontWeight: '500' }}>
              → Oluşturulan bordro
            </Text>
          </div>
        </Card>
        
        <Card className="stats-card">
          <div className="stats-icon">
            <CalendarOutlined />
          </div>
          <Statistic
            title="Bu Ay İşlenen"
            value={stats?.current_month_payrolls || 0}
            valueStyle={{ 
              color: 'var(--text-primary)',
              fontSize: '2.5rem',
              fontWeight: '800'
            }}
          />
          <div style={{ marginTop: '12px' }}>
            <Text style={{ color: '#d97706', fontSize: '14px', fontWeight: '500' }}>
              ↑ Aylık işlem
            </Text>
          </div>
        </Card>
        
        <Card className="stats-card">
          <div className="stats-icon">
            <BankOutlined />
          </div>
          <Statistic
            title="Toplam Brüt Maaş"
            value={formatCurrency(stats?.total_gross_salary || 0)}
            valueStyle={{ 
              color: 'var(--text-primary)',
              fontSize: '1.8rem',
              fontWeight: '800'
            }}
          />
          <div style={{ marginTop: '12px' }}>
            <Text style={{ color: '#7c3aed', fontSize: '14px', fontWeight: '500' }}>
              ₺ Brüt tutar
            </Text>
          </div>
        </Card>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: '48px' }}>
        {/* Sol Panel - Net Maaş ve İlerleme */}
        <Col xs={24} lg={12}>
          <Card className="modern-card" style={{ height: '350px' }}>
            <div className="chart-header">
              <Title level={4} className="chart-title">
                Mali Durum Özeti
              </Title>
            </div>
            
            <div style={{ padding: '16px 0' }}>
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <Text style={{ fontSize: '16px', color: '#6b7280', marginBottom: '8px', display: 'block' }}>
                  Ödenen Maaş
                </Text>
                <div style={{ 
                  fontSize: '2.2rem', 
                  fontWeight: '800',
                  color: '#059669',
                  marginBottom: '8px'
                }}>
                  {formatCurrency(stats?.current_month_net_salary || 0)}
                </div>
                <Text style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px', display: 'block' }}>
                  Toplam Maaş: {formatCurrency(stats?.total_net_salary || 0)}
                </Text>
                <Progress 
                  percent={Math.round(((stats?.current_month_net_salary || 0) / (stats?.total_net_salary || 1)) * 100)} 
                  strokeColor={{
                    '0%': '#059669',
                    '100%': '#10b981',
                  }}
                  trailColor="#f3f4f6"
                  strokeWidth={10}
                  showInfo={false}
                />
                <Text style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px', display: 'block' }}>
                  Ödeme oranı: %{Math.round(((stats?.current_month_net_salary || 0) / (stats?.total_net_salary || 1)) * 100)}
                </Text>
              </div>


            </div>
          </Card>
        </Col>
        
        {/* Sağ Panel - Son İşlemler */}
        <Col xs={24} lg={12}>
          <Card className="modern-card" style={{ height: '350px' }}>
            <div className="chart-header">
              <Title level={4} className="chart-title">
                Son İşlemler
              </Title>
            </div>
            
            <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
              <Table
                columns={activityColumns}
                dataSource={recentActivities}
                size="small"
                pagination={false}
                className="modern-table"
                style={{ border: 'none' }}
                loading={activitiesLoading}
                locale={{ emptyText: 'Henüz işlem kaydı bulunmuyor' }}
              />

            </div>
          </Card>
        </Col>
      </Row>

      {/* Alt Panel - Hızlı İşlemler */}
      <div style={{ marginTop: '48px', clear: 'both' }}>
        <Title level={4} style={{ marginBottom: '32px', color: '#374151' }}>
          Hızlı İşlemler
          {!isAdmin && (
            <Text style={{ fontSize: '14px', color: '#6b7280', marginLeft: '12px' }}>
              (Personel görünümü)
            </Text>
          )}
        </Title>
        <div className="quick-actions">
          {/* Admin-only actions */}
          {isAdmin && (
            <>
              <div className="quick-action-card" onClick={handleDirectCreateEmployee}>
                <UserOutlined style={{ fontSize: '32px', color: '#10b981', marginBottom: '12px' }} />
                <Title level={5} style={{ margin: '0 0 8px', color: '#374151' }}>
                  Doğrudan Personel Oluştur
                </Title>
                <Text style={{ color: '#6b7280', fontSize: '14px' }}>
                  Hesap + Personel (Tek Adım)
                </Text>
              </div>
              
              <div className="quick-action-card" onClick={handleCreatePayroll}>
                <FileTextOutlined style={{ fontSize: '32px', color: '#059669', marginBottom: '12px' }} />
                <Title level={5} style={{ margin: '0 0 8px', color: '#374151' }}>
                  Bordro Oluştur
                </Title>
                <Text style={{ color: '#6b7280', fontSize: '14px' }}>
                  Yeni bordro işlemi
                </Text>
              </div>
              
              <div className="quick-action-card" onClick={handleUpdateSalary}>
                <DollarOutlined style={{ fontSize: '32px', color: '#d97706', marginBottom: '12px' }} />
                <Title level={5} style={{ margin: '0 0 8px', color: '#374151' }}>
                  Maaş Güncelle
                </Title>
                <Text style={{ color: '#6b7280', fontSize: '14px' }}>
                  Maaş bilgisi düzenle
                </Text>
              </div>
              
              <div className="quick-action-card" onClick={handleGenerateReport}>
                <BankOutlined style={{ fontSize: '32px', color: '#7c3aed', marginBottom: '12px' }} />
                <Title level={5} style={{ margin: '0 0 8px', color: '#374151' }}>
                  Rapor Al
                </Title>
                <Text style={{ color: '#6b7280', fontSize: '14px' }}>
                  İstatistik raporu
                </Text>
              </div>
            </>
          )}

          {/* Employee-only actions */}
          {!isAdmin && (
            <>
              <div className="quick-action-card" onClick={() => navigate('/my-profile')}>
                <UserOutlined style={{ fontSize: '32px', color: '#1e40af', marginBottom: '12px' }} />
                <Title level={5} style={{ margin: '0 0 8px', color: '#374151' }}>
                  Bilgilerim
                </Title>
                <Text style={{ color: '#6b7280', fontSize: '14px' }}>
                  Kişisel bilgileri görüntüle
                </Text>
              </div>
              
              <div className="quick-action-card" onClick={() => navigate('/my-payrolls')}>
                <FileTextOutlined style={{ fontSize: '32px', color: '#059669', marginBottom: '12px' }} />
                <Title level={5} style={{ margin: '0 0 8px', color: '#374151' }}>
                  Bordrolarım
                </Title>
                <Text style={{ color: '#6b7280', fontSize: '14px' }}>
                  Bordro geçmişi
                </Text>
              </div>

              <div className="quick-action-card" onClick={() => message.info('Bu özellik yakında aktif olacaktır')}>
                <BankOutlined style={{ fontSize: '32px', color: '#7c3aed', marginBottom: '12px' }} />
                <Title level={5} style={{ margin: '0 0 8px', color: '#374151' }}>
                  Bordro İndir
                </Title>
                <Text style={{ color: '#6b7280', fontSize: '14px' }}>
                  PDF olarak indir
                </Text>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bordro Oluşturma Modal */}
      <Modal
        title="Hızlı Bordro Oluşturma"
        open={isPayrollModalVisible}
        onOk={handlePayrollSubmit}
        onCancel={() => setIsPayrollModalVisible(false)}
        width={600}
        okText="Oluştur"
        cancelText="İptal"
      >
        <Form
          form={payrollForm}
          layout="vertical"
          name="quick_payroll_form"
        >
          <Form.Item
            name="employee_id"
            label="Çalışan"
            rules={[{ required: true, message: 'Çalışan seçimi zorunludur' }]}
          >
            <Select
              placeholder="Çalışan seçiniz"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={employees.map(emp => ({
                value: emp.id,
                label: `${emp.first_name} ${emp.last_name} (${emp.title})`
              }))}
            />
          </Form.Item>

          <Form.Item
            name="period"
            label="Bordro Dönemi"
            rules={[{ required: true, message: 'Bordro dönemi zorunludur' }]}
          >
            <RangePicker 
              style={{ width: '100%' }}
              format="DD.MM.YYYY"
              placeholder={['Başlangıç Tarihi', 'Bitiş Tarihi']}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Rapor Modal */}
      <Modal
        title="İstatistik Raporu Oluştur"
        open={isReportModalVisible}
        onOk={handleReportGenerate}
        onCancel={() => setIsReportModalVisible(false)}
        width={500}
        okText="Rapor Oluştur"
        cancelText="İptal"
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <BankOutlined style={{ fontSize: '48px', color: '#1e40af', marginBottom: '16px' }} />
          <Title level={4} style={{ marginBottom: '16px' }}>
            Sistem İstatistik Raporu
          </Title>
          <Paragraph style={{ color: '#6b7280' }}>
            Mevcut sistem verilerine dayalı detaylı istatistik raporu oluşturulacaktır. 
            Rapor yeni pencerede açılacak ve yazdırma seçeneği sunulacaktır.
          </Paragraph>
          <div style={{ 
            background: '#f8fafc', 
            padding: '16px', 
            borderRadius: '8px',
            marginTop: '16px',
            textAlign: 'left'
          }}>
            <Text strong>Rapor İçeriği:</Text>
            <ul style={{ marginTop: '8px', color: '#6b7280' }}>
              <li>Toplam çalışan sayısı</li>
              <li>Toplam bordro sayısı</li>
              <li>Mali özet bilgileri</li>
              <li>Güncel tarih ve saat</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Doğrudan Personel Oluşturma Modal */}
      <Modal
        title="Doğrudan Personel Oluşturma"
        open={isDirectEmployeeModalVisible}
        onOk={handleDirectEmployeeSubmit}
        onCancel={() => setIsDirectEmployeeModalVisible(false)}
        width={700}
        okText="Oluştur"
        cancelText="İptal"
      >
        <Alert
          message="Tek Adımda Hesap + Personel Oluşturma"
          description="Bu form ile hem IAM sisteminde kullanıcı hesabı hem de personel profili tek seferde oluşturulacaktır. Kullanıcı sisteme giriş yapabilecek ve personel verileri otomatik olarak bağlanacaktır."
          type="success"
          showIcon
          style={{ marginBottom: '24px' }}
        />
        
        <Form
          form={directEmployeeForm}
          layout="vertical"
          name="direct_employee_form"
        >
          <div style={{ 
            background: '#f8fafc', 
            padding: '16px', 
            borderRadius: '8px', 
            marginBottom: '16px',
            borderLeft: '4px solid #10b981'
          }}>
            <Title level={5} style={{ color: '#374151', margin: '0 0 12px' }}>
              👤 Kullanıcı Hesabı Bilgileri
            </Title>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="E-posta Adresi"
                  rules={[
                    { required: true, message: 'E-posta adresi zorunludur' },
                    { type: 'email', message: 'Geçerli bir e-posta adresi giriniz' }
                  ]}
                >
                  <Input placeholder="ornek@kurum.gov.tr" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="Parola"
                  rules={[
                    { required: true, message: 'Parola zorunludur' },
                    { min: 6, message: 'Parola en az 6 karakter olmalıdır' }
                  ]}
                >
                  <Input.Password placeholder="Güvenli parola giriniz" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div style={{ 
            background: '#fef3f2', 
            padding: '16px', 
            borderRadius: '8px', 
            marginBottom: '16px',
            borderLeft: '4px solid #f97316'
          }}>
            <Title level={5} style={{ color: '#374151', margin: '0 0 12px' }}>
              👷 Personel Profil Bilgileri
            </Title>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="first_name"
                  label="Ad"
                  rules={[{ required: true, message: 'Ad alanı zorunludur' }]}
                >
                  <Input placeholder="Çalışanın adı" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="last_name"
                  label="Soyad"
                  rules={[{ required: true, message: 'Soyad alanı zorunludur' }]}
                >
                  <Input placeholder="Çalışanın soyadı" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="national_id"
                  label="TC Kimlik Numarası"
                  rules={[
                    { required: true, message: 'TC Kimlik Numarası zorunludur' },
                    { len: 11, message: 'TC Kimlik Numarası 11 haneli olmalıdır' },
                    { pattern: /^\d{11}$/, message: 'TC Kimlik Numarası sadece rakam içermelidir' }
                  ]}
                >
                  <Input placeholder="12345678901" maxLength={11} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="title"
                  label="Unvan"
                  rules={[{ required: true, message: 'Unvan alanı zorunludur' }]}
                >
                  <Input placeholder="Çalışanın unvanı" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="hire_date"
                  label="İşe Başlama Tarihi"
                  rules={[{ required: true, message: 'İşe başlama tarihi zorunludur' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }}
                    format="DD.MM.YYYY"
                    placeholder="Tarih seçiniz"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="gross_salary"
                  label="Brüt Maaş (TL)"
                  rules={[
                    { required: true, message: 'Brüt maaş alanı zorunludur' },
                    { type: 'number', min: 1, message: 'Brüt maaş 0\'dan büyük olmalıdır' }
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Brüt maaş miktarı"
                    formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value!.replace(/₺\s?|(,*)/g, '') as any}
                    min={1}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Form>
        
        <Alert
          message="İşlem Akışı"
          description={
            <div>
              <p><strong>1.</strong> Kullanıcı hesabı IAM servisinde oluşturulacak</p>
              <p><strong>2.</strong> Personel profili bordro servisinde oluşturulacak</p>
              <p><strong>3.</strong> İki sistem otomatik olarak birbirine bağlanacak</p>
              <p><strong>4.</strong> Kullanıcı sisteme giriş yapabilir hale gelecek</p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginTop: '16px' }}
        />
      </Modal>
    </div>
  )
}

export default Dashboard 