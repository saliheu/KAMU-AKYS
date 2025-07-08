import React, { useEffect, useState } from 'react'
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  DatePicker, 
  Typography, 
  Space,
  message,
  Popconfirm,
  Tag,
  Alert,
  Row,
  Col
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, IdcardOutlined, CalendarOutlined, DollarOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'
import type { RootState, AppDispatch } from '../store/store'
import { fetchEmployees, createEmployee, updateEmployee, deleteEmployee } from '../store/slices/employeeSlice'
import { createEmployeeWithAccount } from '../store/slices/employeeSlice'
import { fetchDashboardStats } from '../store/slices/dashboardSlice'
import { selectIsAdmin } from '../store/slices/authSlice'
import type { Employee, EmployeeCreate, EmployeeUpdate, DirectEmployeeCreate } from '../types'

const { Title, Text } = Typography

const Employees: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { employees, loading } = useSelector((state: RootState) => state.employee)
  const isAdmin = useSelector(selectIsAdmin)
  
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [isDirectEmployeeModalVisible, setIsDirectEmployeeModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [directEmployeeForm] = Form.useForm()

  useEffect(() => {
    dispatch(fetchEmployees())
  }, [dispatch])

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    form.setFieldsValue({
      ...employee,
      hire_date: dayjs(employee.hire_date)
    })
    setIsModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const result = await dispatch(deleteEmployee(id)).unwrap()
      if (result.employee_deactivated) {
        message.success(`${result.employee_name} başarıyla pasifleştirildi`)
      } else {
        message.warning('Personel pasifleştirildi ancak kullanıcı hesabında sorun oluştu')
      }
    } catch (error) {
      message.error('Personel pasifleştirilirken hata oluştu')
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      const formData = {
        ...values,
        hire_date: values.hire_date.format('YYYY-MM-DD')
      }

      if (editingEmployee) {
        await dispatch(updateEmployee({ 
          id: editingEmployee.id, 
          data: formData as EmployeeUpdate 
        })).unwrap()
        message.success('Çalışan başarıyla güncellendi')
        
        setIsModalVisible(false)
        form.resetFields()
        setEditingEmployee(null)
      }
    } catch (error) {
      message.error('İşlem sırasında hata oluştu')
    }
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
    setEditingEmployee(null)
  }

  // Doğrudan Personel Oluşturma Handlers
  const handleDirectCreateEmployee = () => {
    directEmployeeForm.resetFields()
    setIsDirectEmployeeModalVisible(true)
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
      // Employee listesini yenile
      await dispatch(fetchEmployees())
    } catch (error: any) {
      console.error('Direct employee creation error:', error)
      message.error(error.message || 'Personel ve hesap oluşturulurken hata oluştu')
    }
  }

  const columns = [
    {
      title: 'Ad',
      dataIndex: 'first_name',
      key: 'first_name',
    },
    {
      title: 'Soyad',
      dataIndex: 'last_name',
      key: 'last_name',
    },
    {
      title: 'TC Kimlik No',
      dataIndex: 'national_id',
      key: 'national_id',
    },
    {
      title: 'Unvan',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => <Tag color="blue">{title}</Tag>
    },
    {
      title: 'İşe Başlama Tarihi',
      dataIndex: 'hire_date',
      key: 'hire_date',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Brüt Maaş',
      dataIndex: 'gross_salary',
      key: 'gross_salary',
      render: (amount: number) => 
        new Intl.NumberFormat('tr-TR', {
          style: 'currency',
          currency: 'TRY'
        }).format(amount),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: Employee) => (
        <Space>
          {isAdmin && (
            <>
              <Button 
                type="link" 
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              >
                Düzenle
              </Button>
              <Popconfirm
                title="Bu personeli pasifleştirmek istediğinizden emin misiniz?"
                description="Pasifleştirilen personel aktif listeden kaldırılacak ancak geçmiş kayıtları korunacaktır."
                onConfirm={() => handleDelete(record.id)}
                okText="Evet, Pasifleştir"
                cancelText="Hayır"
              >
                <Button 
                  type="link" 
                  danger
                  icon={<DeleteOutlined />}
                >
                  Pasifleştir
                </Button>
              </Popconfirm>
            </>
          )}
          {!isAdmin && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Sadece görüntüleme
            </Text>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div className="page-container fade-in-up">
      <div className="page-header">
        <div>
          <Title className="page-title">
            Çalışan Yönetimi
          </Title>
          <Text style={{ color: '#6b7280', fontSize: '16px' }}>
            Personel bilgilerini yönetin ve düzenleyin
          </Text>
        </div>
        {isAdmin && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleDirectCreateEmployee}
            className="action-button"
            size="large"
          >
            Doğrudan Personel Oluştur
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={employees}
        rowKey="id"
        loading={loading}
        className="modern-table"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} / ${total} kayıt`,
        }}
      />

      <Modal
        title="Çalışan Düzenle"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          name="employee_form"
        >
          <Form.Item
            name="first_name"
            label="Ad"
            rules={[{ required: true, message: 'Ad alanı zorunludur' }]}
          >
            <Input placeholder="Çalışanın adını giriniz" />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Soyad"
            rules={[{ required: true, message: 'Soyad alanı zorunludur' }]}
          >
            <Input placeholder="Çalışanın soyadını giriniz" />
          </Form.Item>

          <Form.Item
            name="national_id"
            label="TC Kimlik Numarası"
            rules={[
              { required: true, message: 'TC Kimlik Numarası zorunludur' },
              { len: 11, message: 'TC Kimlik Numarası 11 haneli olmalıdır' }
            ]}
          >
            <Input placeholder="TC Kimlik Numarasını giriniz" maxLength={11} />
          </Form.Item>

          <Form.Item
            name="title"
            label="Unvan"
            rules={[{ required: true, message: 'Unvan alanı zorunludur' }]}
          >
            <Input placeholder="Çalışanın unvanını giriniz" />
          </Form.Item>

          <Form.Item
            name="hire_date"
            label="İşe Başlama Tarihi"
            rules={[{ required: true, message: 'İşe başlama tarihi zorunludur' }]}
          >
            <DatePicker 
              style={{ width: '100%' }}
              format="DD.MM.YYYY"
              placeholder="İşe başlama tarihini seçiniz"
            />
          </Form.Item>

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
              placeholder="Brüt maaşı giriniz"
              formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/₺\s?|(,*)/g, '') as any}
              min={1}
            />
          </Form.Item>
        </Form>
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

export default Employees