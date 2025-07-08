import React, { useEffect, useState } from 'react'
import { 
  Card, 
  Tabs, 
  Form, 
  Input, 
  InputNumber, 
  Button, 
  Typography, 
  Space,
  Row, 
  Col,
  Upload,
  message,
  Divider,
  List,
  Modal,
  Tag,
  Switch,
  DatePicker,
  Table,
  Tooltip
} from 'antd'
import { 
  SettingOutlined,
  BankOutlined,
  DollarOutlined,
  FileImageOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  SecurityScanOutlined,
  MailOutlined,
  CalendarOutlined,
  HistoryOutlined
} from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../store/store'
import { settingsApi } from '../services/api'
import type { 
  SystemSettings as SystemSettingsType, 
  CompanyInfoUpdate, 
  TaxBracket, 
  SecuritySettingsUpdate,
  SMTPSettingsUpdate,
  FinancialSettings,
  FinancialSettingsCreate
} from '../types'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography
const { TextArea, Password } = Input
const { TabPane } = Tabs

const SystemSettings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  
  const [activeTab, setActiveTab] = useState('company')
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<Partial<SystemSettingsType>>({})
  const [currentFinancial, setCurrentFinancial] = useState<FinancialSettings | null>(null)
  const [allFinancialSettings, setAllFinancialSettings] = useState<FinancialSettings[]>([])
  
  // Forms
  const [companyForm] = Form.useForm()
  const [securityForm] = Form.useForm()
  const [smtpForm] = Form.useForm()
  const [financialForm] = Form.useForm()
  
  // Modals
  const [financialModal, setFinancialModal] = useState(false)
  const [taxBracketModal, setTaxBracketModal] = useState(false)
  const [editingBracket, setEditingBracket] = useState<TaxBracket | null>(null)
  const [taxBracketForm] = Form.useForm()

  useEffect(() => {
    fetchAllSettings()
  }, [])

  const fetchAllSettings = async () => {
    try {
      setLoading(true)
      
      // Sistem ayarları
      const systemResponse = await settingsApi.getSettings()
      const systemData = systemResponse.data
      setSettings(systemData)
      
      // Mevcut finansal ayarlar
      try {
        const currentFinancialResponse = await settingsApi.getCurrentFinancialSettings()
        setCurrentFinancial(currentFinancialResponse.data)
      } catch (error) {
        console.log('Mevcut finansal ayarlar bulunamadı')
      }
      
      // Tüm finansal ayarlar
      try {
        const allFinancialResponse = await settingsApi.getFinancialSettings()
        setAllFinancialSettings(allFinancialResponse.data)
      } catch (error) {
        console.log('Finansal ayarlar listesi alınamadı')
      }
      
      // Form'ları doldur
      companyForm.setFieldsValue({
        company_name: systemData.company_name,
        company_tax_number: systemData.company_tax_number,
        company_address: systemData.company_address,
        company_phone: systemData.company_phone
      })
      
      securityForm.setFieldsValue({
        min_password_length: systemData.min_password_length,
        require_uppercase: systemData.require_uppercase,
        require_lowercase: systemData.require_lowercase,
        require_numbers: systemData.require_numbers,
        require_special_chars: systemData.require_special_chars
      })
      
      smtpForm.setFieldsValue({
        smtp_server: systemData.smtp_server,
        smtp_port: systemData.smtp_port,
        smtp_username: systemData.smtp_username,
        smtp_use_tls: systemData.smtp_use_tls,
        smtp_from_email: systemData.smtp_from_email,
        smtp_from_name: systemData.smtp_from_name
      })
      
    } catch (error) {
      message.error('Ayarlar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleCompanySubmit = async () => {
    try {
      const values = await companyForm.validateFields()
      setLoading(true)
      
      const response = await settingsApi.updateCompanyInfo(values)
      const updatedSettings = response.data
      
      setSettings(updatedSettings)
      message.success('Kurum bilgileri başarıyla güncellendi')
    } catch (error) {
      message.error('Kurum bilgileri güncellenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSecuritySubmit = async () => {
    try {
      const values = await securityForm.validateFields()
      setLoading(true)
      
      const response = await settingsApi.updateSecuritySettings(values)
      const updatedSettings = response.data
      
      setSettings(updatedSettings)
      message.success('Güvenlik ayarları başarıyla güncellendi')
    } catch (error) {
      message.error('Güvenlik ayarları güncellenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSMTPSubmit = async () => {
    try {
      const values = await smtpForm.validateFields()
      setLoading(true)
      
      const response = await settingsApi.updateSMTPSettings(values)
      const updatedSettings = response.data
      
      setSettings(updatedSettings)
      message.success('E-posta ayarları başarıyla güncellendi')
    } catch (error) {
      message.error('E-posta ayarları güncellenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFinancialSettings = async () => {
    try {
      const values = await financialForm.validateFields()
      setLoading(true)
      
      const data = {
        ...values,
        effective_date: values.effective_date.format('YYYY-MM-DD'),
        income_tax_brackets: currentFinancial?.income_tax_brackets || []
      }
      
      const response = await settingsApi.createFinancialSettings(data)
      
      setFinancialModal(false)
      await fetchAllSettings()
      message.success('Finansal ayarlar başarıyla oluşturuldu')
    } catch (error) {
      message.error('Finansal ayarlar oluşturulurken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return '0 ₺'
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

  const financialColumns = [
    {
      title: 'Yıl',
      dataIndex: 'effective_year',
      key: 'effective_year',
      width: 80,
    },
    {
      title: 'Geçerlilik Tarihi',
      dataIndex: 'effective_date',
      key: 'effective_date',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
      width: 120,
    },
    {
      title: 'Asgari Ücret',
      dataIndex: 'minimum_wage',
      key: 'minimum_wage',
      render: (amount: number) => formatCurrency(amount),
      width: 120,
    },
    {
      title: 'SGK Çalışan',
      dataIndex: 'sgk_employee_rate',
      key: 'sgk_employee_rate',
      render: (rate: number) => `%${rate}`,
      width: 100,
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Durum',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
      width: 80,
    }
  ]

  return (
    <div className="page-container fade-in-up">
      <div className="page-header">
        <div>
          <Title className="page-title">
            <SettingOutlined style={{ marginRight: 12, color: '#1890ff' }} />
            Sistem Yönetimi ve Ayarlar
          </Title>
          <Paragraph style={{ margin: 0, color: '#6b7280', fontSize: '16px' }}>
            Sistem ayarlarını ve kurum bilgilerini yönetin
          </Paragraph>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Text style={{ fontSize: '14px', color: '#6b7280' }}>
            Son güncelleme: {settings.updated_by} - {settings.updated_at ? new Date(settings.updated_at).toLocaleDateString('tr-TR') : ''}
          </Text>
        </div>
      </div>

      <Card loading={loading}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          type="card"
          size="large"
        >
          {/* Kurum Bilgileri Sekmesi */}
          <TabPane 
            tab={
              <span>
                <BankOutlined />
                Kurum Bilgileri
              </span>
            } 
            key="company"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Card title="Kurum Bilgileri" size="small">
                  <Form
                    form={companyForm}
                    layout="vertical"
                    onFinish={handleCompanySubmit}
                  >
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="company_name"
                          label="Kurumun Tam Adı"
                          rules={[{ required: true, message: 'Kurum adı gereklidir' }]}
                        >
                          <Input placeholder="Örn: T.C. Ankara Büyükşehir Belediyesi" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="company_tax_number"
                          label="Vergi Numarası"
                          rules={[
                            { required: true, message: 'Vergi numarası gereklidir' },
                            { len: 10, message: 'Vergi numarası 10 haneli olmalıdır' }
                          ]}
                        >
                          <Input placeholder="1234567890" maxLength={10} />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Form.Item
                      name="company_address"
                      label="Adres Bilgisi"
                      rules={[{ required: true, message: 'Adres gereklidir' }]}
                    >
                      <TextArea 
                        rows={3} 
                        placeholder="Kurumun tam adresi..."
                      />
                    </Form.Item>
                    
                    <Form.Item
                      name="company_phone"
                      label="Telefon Numarası"
                      rules={[{ required: true, message: 'Telefon numarası gereklidir' }]}
                    >
                      <Input placeholder="+90 312 123 45 67" />
                    </Form.Item>
                    
                    <Form.Item>
                      <Button 
                        type="primary" 
                        htmlType="submit"
                        loading={loading}
                        icon={<SaveOutlined />}
                        size="large"
                      >
                        Kurum Bilgilerini Kaydet
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>
              
              <Col xs={24} lg={8}>
                <Card title="Kurum Logosu" size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '200px',
                      height: '120px',
                      border: '2px dashed #d9d9d9',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      background: '#fafafa'
                    }}>
                      {settings.company_logo_url ? (
                        <img 
                          src={settings.company_logo_url} 
                          alt="Kurum Logosu"
                          style={{ maxWidth: '100%', maxHeight: '100%' }}
                        />
                      ) : (
                        <div>
                          <FileImageOutlined style={{ fontSize: '32px', color: '#d9d9d9' }} />
                          <div style={{ color: '#999', marginTop: '8px' }}>Logo Yok</div>
                        </div>
                      )}
                    </div>
                    
                    <Upload>
                      <Button icon={<FileImageOutlined />}>Logo Yükle</Button>
                    </Upload>
                    
                    <div style={{ marginTop: '12px', fontSize: '12px', color: '#999' }}>
                      JPG, PNG formatları desteklenir.<br/>
                      Maksimum 2MB boyut.
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Finansal Ayarlar Sekmesi */}
          <TabPane 
            tab={
              <span>
                <DollarOutlined />
                Finansal Ayarlar
              </span>
            } 
            key="financial"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24}>
                <Card 
                  title="Mevcut Finansal Ayarlar"
                  size="small"
                  extra={
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => setFinancialModal(true)}
                    >
                      Yeni Ayar Seti
                    </Button>
                  }
                >
                  {currentFinancial ? (
                    <Row gutter={16}>
                      <Col xs={24} sm={12} md={6}>
                        <Card size="small">
                          <Text style={{ fontSize: '12px', color: '#666' }}>Asgari Ücret</Text>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
                            {formatCurrency(currentFinancial.minimum_wage)}
                          </div>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Card size="small">
                          <Text style={{ fontSize: '12px', color: '#666' }}>SGK Çalışan</Text>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
                            %{currentFinancial.sgk_employee_rate}
                          </div>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Card size="small">
                          <Text style={{ fontSize: '12px', color: '#666' }}>SGK İşveren</Text>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fa8c16' }}>
                            %{currentFinancial.sgk_employer_rate}
                          </div>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Card size="small">
                          <Text style={{ fontSize: '12px', color: '#666' }}>İşsizlik Sigortası</Text>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#722ed1' }}>
                            %{currentFinancial.unemployment_insurance_rate}
                          </div>
                        </Card>
                      </Col>
                    </Row>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                      <CalendarOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                      <div>Henüz finansal ayar tanımlanmamış</div>
                      <div style={{ fontSize: '12px', marginTop: '8px' }}>
                        "Yeni Ayar Seti" butonuna tıklayarak başlayın
                      </div>
                    </div>
                  )}
                </Card>
              </Col>
              
              <Col xs={24}>
                <Card title="Tarihsel Finansal Ayarlar" size="small">
                  <Table 
                    dataSource={allFinancialSettings}
                    columns={financialColumns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    size="small"
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Kullanıcı ve Güvenlik Ayarları Sekmesi */}
          <TabPane 
            tab={
              <span>
                <SecurityScanOutlined />
                Kullanıcı Güvenliği
              </span>
            } 
            key="security"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card title="Parola Politikaları" size="small">
                  <Form
                    form={securityForm}
                    layout="vertical"
                    onFinish={handleSecuritySubmit}
                  >
                    <Form.Item
                      name="min_password_length"
                      label="Minimum Parola Uzunluğu"
                      rules={[
                        { required: true, message: 'Minimum uzunluk gereklidir' },
                        { type: 'number', min: 6, max: 50, message: '6-50 karakter arası olmalıdır' }
                      ]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={6}
                        max={50}
                        placeholder="8"
                      />
                    </Form.Item>

                    <Divider orientation="left">Karakter Gereksinimleri</Divider>
                    
                    <Form.Item
                      name="require_uppercase"
                      label="Büyük harf zorunluluğu"
                      valuePropName="checked"
                    >
                      <Switch checkedChildren="Zorunlu" unCheckedChildren="İsteğe bağlı" />
                    </Form.Item>

                    <Form.Item
                      name="require_lowercase"
                      label="Küçük harf zorunluluğu"
                      valuePropName="checked"
                    >
                      <Switch checkedChildren="Zorunlu" unCheckedChildren="İsteğe bağlı" />
                    </Form.Item>

                    <Form.Item
                      name="require_numbers"
                      label="Rakam zorunluluğu"
                      valuePropName="checked"
                    >
                      <Switch checkedChildren="Zorunlu" unCheckedChildren="İsteğe bağlı" />
                    </Form.Item>

                    <Form.Item
                      name="require_special_chars"
                      label="Özel karakter zorunluluğu"
                      valuePropName="checked"
                    >
                      <Switch checkedChildren="Zorunlu" unCheckedChildren="İsteğe bağlı" />
                    </Form.Item>

                    <Form.Item>
                      <Button 
                        type="primary" 
                        htmlType="submit"
                        loading={loading}
                        icon={<SaveOutlined />}
                        size="large"
                      >
                        Güvenlik Ayarlarını Kaydet
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card title="Mevcut Parola Politikası" size="small">
                  <div style={{ padding: '16px', background: '#f9f9f9', borderRadius: '6px' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <Text strong>Minimum Uzunluk:</Text> {settings.min_password_length || 8} karakter
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <Text strong>Gereksinimler:</Text>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      <li style={{ color: settings.require_uppercase ? '#52c41a' : '#999' }}>
                        Büyük harf {settings.require_uppercase ? '(Zorunlu)' : '(İsteğe bağlı)'}
                      </li>
                      <li style={{ color: settings.require_lowercase ? '#52c41a' : '#999' }}>
                        Küçük harf {settings.require_lowercase ? '(Zorunlu)' : '(İsteğe bağlı)'}
                      </li>
                      <li style={{ color: settings.require_numbers ? '#52c41a' : '#999' }}>
                        Rakam {settings.require_numbers ? '(Zorunlu)' : '(İsteğe bağlı)'}
                      </li>
                      <li style={{ color: settings.require_special_chars ? '#52c41a' : '#999' }}>
                        Özel karakter {settings.require_special_chars ? '(Zorunlu)' : '(İsteğe bağlı)'}
                      </li>
                    </ul>
                  </div>
                  
                  <Divider />
                  
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    <Text strong>Not:</Text> Bu kurallar yeni kullanıcı kayıtlarında ve parola değişikliklerinde uygulanır.
                  </div>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* E-posta Ayarları Sekmesi */}
          <TabPane 
            tab={
              <span>
                <MailOutlined />
                E-posta Ayarları
              </span>
            } 
            key="smtp"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Card title="SMTP Sunucu Ayarları" size="small">
                  <Form
                    form={smtpForm}
                    layout="vertical"
                    onFinish={handleSMTPSubmit}
                  >
                    <Row gutter={16}>
                      <Col xs={24} md={16}>
                        <Form.Item
                          name="smtp_server"
                          label="SMTP Sunucu Adresi"
                          rules={[{ required: true, message: 'SMTP sunucu adresi gereklidir' }]}
                        >
                          <Input placeholder="smtp.gmail.com" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          name="smtp_port"
                          label="Port"
                          rules={[{ required: true, message: 'Port gereklidir' }]}
                        >
                          <InputNumber 
                            style={{ width: '100%' }}
                            min={1}
                            max={65535}
                            placeholder="587"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="smtp_username"
                          label="Kullanıcı Adı"
                          rules={[{ required: true, message: 'Kullanıcı adı gereklidir' }]}
                        >
                          <Input placeholder="username@domain.com" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="smtp_password"
                          label="Parola"
                        >
                          <Password placeholder="SMTP parolası" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="smtp_from_email"
                          label="Gönderen E-posta"
                          rules={[
                            { required: true, message: 'Gönderen e-posta gereklidir' },
                            { type: 'email', message: 'Geçerli e-posta adresi giriniz' }
                          ]}
                        >
                          <Input placeholder="noreply@kurum.gov.tr" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="smtp_from_name"
                          label="Gönderen Adı"
                        >
                          <Input placeholder="Kurum Adı" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="smtp_use_tls"
                      label="TLS/SSL Kullan"
                      valuePropName="checked"
                    >
                      <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
                    </Form.Item>

                    <Form.Item>
                      <Space>
                        <Button 
                          type="primary" 
                          htmlType="submit"
                          loading={loading}
                          icon={<SaveOutlined />}
                          size="large"
                        >
                          E-posta Ayarlarını Kaydet
                        </Button>
                        <Button 
                          type="default"
                          size="large"
                        >
                          Test E-postası Gönder
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>

              <Col xs={24} lg={8}>
                <Card title="E-posta Durumu" size="small">
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    {settings.smtp_server ? (
                      <div>
                        <MailOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                        <div style={{ color: '#52c41a', fontWeight: 'bold' }}>
                          E-posta Yapılandırılmış
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                          Sunucu: {settings.smtp_server}:{settings.smtp_port}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <MailOutlined style={{ fontSize: '48px', color: '#999', marginBottom: '16px' }} />
                        <div style={{ color: '#999' }}>
                          E-posta Henüz Yapılandırılmamış
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Divider />
                  
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    <Text strong>Bilgi:</Text> E-posta ayarları yapılandırıldıktan sonra sistem otomatik bildirimler gönderebilir.
                  </div>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Yeni Finansal Ayar Modal */}
      <Modal
        title="Yeni Finansal Ayar Seti Oluştur"
        open={financialModal}
        onOk={handleCreateFinancialSettings}
        onCancel={() => setFinancialModal(false)}
        okText="Oluştur"
        cancelText="İptal"
        width={600}
      >
        <Form
          form={financialForm}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="effective_year"
                label="Geçerlilik Yılı"
                rules={[{ required: true, message: 'Geçerlilik yılı gereklidir' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={2020}
                  max={2030}
                  placeholder="2024"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="effective_date"
                label="Geçerlilik Tarihi"
                rules={[{ required: true, message: 'Geçerlilik tarihi gereklidir' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="Tarih seçiniz"
                  format="DD.MM.YYYY"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Açıklama"
          >
            <TextArea 
              placeholder="Örn: 2024 Yılı Finansal Parametreleri"
              rows={2}
            />
          </Form.Item>

          <Divider orientation="left">Finansal Parametreler</Divider>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="minimum_wage"
                label="Asgari Ücret (₺)"
                rules={[{ required: true, message: 'Asgari ücret gereklidir' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/₺\s?|(,*)/g, '')}
                  placeholder="17.002,12"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="sgk_employee_rate"
                label="SGK Çalışan Oranı (%)"
                rules={[{ required: true, message: 'SGK çalışan oranı gereklidir' }]}
              >
                                 <InputNumber
                   style={{ width: '100%' }}
                   min={0}
                   max={100}
                   step={0.1}
                   addonAfter="%"
                   placeholder="14.0"
                 />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="sgk_employer_rate"
                label="SGK İşveren Oranı (%)"
                rules={[{ required: true, message: 'SGK işveren oranı gereklidir' }]}
              >
                                 <InputNumber
                   style={{ width: '100%' }}
                   min={0}
                   max={100}
                   step={0.1}
                   addonAfter="%"
                   placeholder="15.5"
                 />
               </Form.Item>
             </Col>
             <Col xs={24} md={12}>
               <Form.Item
                 name="unemployment_insurance_rate"
                 label="İşsizlik Sigortası Oranı (%)"
                 rules={[{ required: true, message: 'İşsizlik sigortası oranı gereklidir' }]}
               >
                 <InputNumber
                   style={{ width: '100%' }}
                   min={0}
                   max={100}
                   step={0.1}
                   addonAfter="%"
                   placeholder="1.0"
                 />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default SystemSettings 