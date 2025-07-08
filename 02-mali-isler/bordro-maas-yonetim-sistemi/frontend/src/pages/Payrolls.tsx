import React, { useEffect, useState } from 'react'
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Select, 
  DatePicker, 
  Typography, 
  Space,
  message,
  Tag,
  Input,
  Card,
  Row,
  Col,
  Checkbox,
  Popconfirm,
  Tooltip,
  Divider
} from 'antd'
import { 
  PlusOutlined, 
  EyeOutlined, 
  DownloadOutlined, 
  StopOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  CalendarOutlined 
} from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import type { RootState, AppDispatch } from '../store/store'
import { 
  fetchPayrollsSummary, 
  createPayroll, 
  updatePayrollStatus,
  deletePayroll,
  setFilters,
  resetFilters 
} from '../store/slices/payrollSlice'
import { fetchEmployees } from '../store/slices/employeeSlice'
import type { PayrollCreate, PayrollUpdate, PayrollStatus, PayrollSummary } from '../types'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Search } = Input
const { Option } = Select

const Payrolls: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { payrolls, filters, loading } = useSelector((state: RootState) => state.payroll)
  const { employees } = useSelector((state: RootState) => state.employee)
  const { user } = useSelector((state: RootState) => state.auth)
  const isAdmin = user?.role === 'admin'
  
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchEmployees())
    dispatch(fetchPayrollsSummary(filters))
  }, [dispatch, filters])

  // Filter handlers
  const handleSearch = (value: string) => {
    dispatch(setFilters({ employee_search: value }))
  }

  const handleStatusFilter = (status: PayrollStatus | null) => {
    dispatch(setFilters({ status_filter: status }))
  }

  const handleDateRangeFilter = (dates: any) => {
    if (dates && dates.length === 2) {
      dispatch(setFilters({
        date_start: dates[0].format('YYYY-MM-DD'),
        date_end: dates[1].format('YYYY-MM-DD')
      }))
    } else {
      dispatch(setFilters({ date_start: null, date_end: null }))
    }
  }

  const handleIncludeInactiveChange = (checked: boolean) => {
    dispatch(setFilters({ include_inactive: checked }))
  }

  const handleResetFilters = () => {
    dispatch(resetFilters())
  }

  const handleRefresh = () => {
    dispatch(fetchPayrollsSummary(filters))
  }

  // Modal handlers
  const handleAdd = () => {
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      const [startDate, endDate] = values.period
      
      const formData: PayrollCreate = {
        employee_id: values.employee_id,
        pay_period_start: startDate.format('YYYY-MM-DD'),
        pay_period_end: endDate.format('YYYY-MM-DD')
      }

      await dispatch(createPayroll(formData)).unwrap()
      message.success('Bordro başarıyla oluşturuldu')
      setIsModalVisible(false)
      form.resetFields()
    } catch (error) {
      message.error('Bordro oluşturulurken hata oluştu')
    }
  }

  // Action handlers
  const handleView = (id: number) => {
    navigate(`/payrolls/${id}`)
  }

  const handleDownloadPDF = (record: PayrollSummary) => {
    // TODO: PDF indirme işlemi
    message.info(`${record.employee_full_name} bordrosu PDF olarak indirilecek (Geliştiriliyor)`)
  }

  const handleCancelPayroll = async (record: PayrollSummary) => {
    try {
      const updateData: PayrollUpdate = { status: 'CANCELLED' as PayrollStatus }
      await dispatch(updatePayrollStatus({ id: record.id, data: updateData })).unwrap()
      message.success('Bordro başarıyla iptal edildi')
    } catch (error) {
      message.error('Bordro iptal edilirken hata oluştu')
    }
  }

  const handleDeletePayroll = async (record: PayrollSummary) => {
    try {
      await dispatch(deletePayroll(record.id)).unwrap()
      message.success('Bordro başarıyla silindi')
    } catch (error) {
      message.error('Bordro silinirken hata oluştu')
    }
  }

  const handleStatusChange = async (record: PayrollSummary, newStatus: PayrollStatus) => {
    try {
      const updateData: PayrollUpdate = { status: newStatus }
      await dispatch(updatePayrollStatus({ id: record.id, data: updateData })).unwrap()
      message.success('Bordro durumu başarıyla güncellendi')
    } catch (error) {
      message.error('Bordro durumu güncellenirken hata oluştu')
    }
  }

  // Status rendering
  const getStatusColor = (status: PayrollStatus) => {
    switch (status) {
      case 'DRAFT': return 'orange'
      case 'APPROVED': return 'blue'
      case 'PAID': return 'green'
      case 'CANCELLED': return 'red'
      default: return 'default'
    }
  }

  const getStatusText = (status: PayrollStatus) => {
    switch (status) {
      case 'DRAFT': return 'Taslak'
      case 'APPROVED': return 'Onaylandı'
      case 'PAID': return 'Ödendi'
      case 'CANCELLED': return 'İptal Edildi'
      default: return status
    }
  }

  const columns = [
    {
      title: 'Çalışan',
      dataIndex: 'employee_full_name',
      key: 'employee_full_name',
      render: (name: string, record: PayrollSummary) => (
        <div>
          <Text strong>{name}</Text>
          {!record.employee_is_active && (
            <Tag color="red" style={{ marginLeft: 8, fontSize: '11px' }}>
              Pasif
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Dönem',
      key: 'period',
      render: (_: any, record: PayrollSummary) => (
        <div>
          <div>{dayjs(record.pay_period_start).format('DD.MM.YYYY')}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {dayjs(record.pay_period_end).format('DD.MM.YYYY')}
          </Text>
        </div>
      ),
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
      title: 'Net Maaş',
      dataIndex: 'net_salary',
      key: 'net_salary',
      render: (amount: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          {new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
          }).format(amount)}
        </Text>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: PayrollStatus, record: PayrollSummary) => (
        <div>
          <Tag color={getStatusColor(status)}>
            {getStatusText(status)}
          </Tag>
          {isAdmin && status !== 'CANCELLED' && (
            <Select
              size="small"
              style={{ width: 100, marginTop: 4 }}
              value={status}
              onChange={(newStatus) => handleStatusChange(record, newStatus)}
            >
              <Option value="DRAFT">Taslak</Option>
              <Option value="APPROVED">Onayla</Option>
              <Option value="PAID">Ödendi</Option>
            </Select>
          )}
        </div>
      ),
    },
    {
      title: 'Oluşturma Tarihi',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 250,
      render: (_: any, record: PayrollSummary) => (
        <Space>
          <Tooltip title="Detay Görüntüle">
            <Button 
              type="link" 
              icon={<EyeOutlined />}
              onClick={() => handleView(record.id)}
              size="small"
            >
              Detay
            </Button>
          </Tooltip>
          
          <Tooltip title="PDF İndir">
            <Button 
              type="link" 
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadPDF(record)}
              size="small"
            >
              İndir
            </Button>
          </Tooltip>

          {isAdmin && record.status !== 'CANCELLED' && (
            <Popconfirm
              title="Bu bordroyu iptal etmek istediğinizden emin misiniz?"
              description="İptal edilen bordro geri alınamaz."
              onConfirm={() => handleCancelPayroll(record)}
              okText="Evet, İptal Et"
              cancelText="Hayır"
            >
              <Tooltip title="Bordroyu İptal Et">
                <Button 
                  type="link" 
                  danger
                  icon={<StopOutlined />}
                  size="small"
                >
                  İptal Et
                </Button>
              </Tooltip>
            </Popconfirm>
          )}

          {isAdmin && (record.status === 'DRAFT' || record.status === 'CANCELLED') && (
            <Popconfirm
              title="Bu bordroyu kalıcı olarak silmek istediğinizden emin misiniz?"
              description="Silinen bordro geri alınamaz."
              onConfirm={() => handleDeletePayroll(record)}
              okText="Evet, Sil"
              cancelText="Hayır"
            >
              <Tooltip title="Bordroyu Sil">
                <Button 
                  type="link" 
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                >
                  Sil
                </Button>
              </Tooltip>
            </Popconfirm>
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
            Bordro Yönetimi
          </Title>
          <Text style={{ color: '#6b7280', fontSize: '16px' }}>
            Bordroları yönetin, filtreleyin ve durumlarını takip edin
          </Text>
        </div>
        {isAdmin && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
            className="action-button"
            size="large"
          >
            Yeni Bordro
          </Button>
        )}
      </div>

      {/* Filtreleme Bölümü */}
      <Card 
        size="small" 
        style={{ marginBottom: 16 }}
        title={
          <Space>
            <FilterOutlined />
            <span>Filtreler ve Arama</span>
          </Space>
        }
        extra={
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              size="small"
            >
              Yenile
            </Button>
            <Button 
              onClick={handleResetFilters}
              size="small"
            >
              Sıfırla
            </Button>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Çalışan adı ile arama..."
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
              prefix={<SearchOutlined />}
            />
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Durum Filtrele"
              allowClear
              style={{ width: '100%' }}
              value={filters.status_filter}
              onChange={handleStatusFilter}
            >
              <Option value={null}>
                <Text strong style={{ color: '#1890ff' }}>
                  📋 Hepsi
                </Text>
              </Option>
              <Option value="DRAFT">🟠 Taslak</Option>
              <Option value="APPROVED">🔵 Onaylandı</Option>
              <Option value="PAID">🟢 Ödendi</Option>
              <Option value="CANCELLED">🔴 İptal Edildi</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <RangePicker
              placeholder={['Başlangıç', 'Bitiş']}
              style={{ width: '100%' }}
              onChange={handleDateRangeFilter}
              prefix={<CalendarOutlined />}
            />
          </Col>

          <Col xs={24} sm={12} md={2}>
            <Checkbox
              checked={filters.include_inactive}
              onChange={(e) => handleIncludeInactiveChange(e.target.checked)}
            >
              Pasif çalışanları göster
            </Checkbox>
          </Col>
        </Row>
      </Card>

      {/* İstatistik Kartları */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {payrolls.length}
              </div>
              <div style={{ color: '#666' }}>Toplam Bordro</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {payrolls.filter(p => p.status === 'PAID').length}
              </div>
              <div style={{ color: '#666' }}>Ödenen Bordro</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                {payrolls.filter(p => p.status === 'DRAFT').length}
              </div>
              <div style={{ color: '#666' }}>Bekleyen Bordro</div>
            </div>
          </Card>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={payrolls}
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
        scroll={{ x: 1200 }}
      />

      <Modal
        title="Yeni Bordro Oluştur"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          name="payroll_form"
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
              options={employees
                .filter(emp => emp.is_active) // Sadece aktif çalışanlar
                .map(emp => ({
                  value: emp.id,
                  label: `${emp.first_name} ${emp.last_name} (${emp.title})`
                }))}
            />
          </Form.Item>

          <Form.Item
            name="period"
            label="Bordro Dönemi"
            rules={[{ required: true, message: 'Bordro dönemi seçimi zorunludur' }]}
          >
            <RangePicker 
              style={{ width: '100%' }}
              format="DD.MM.YYYY"
              placeholder={['Dönem Başlangıç', 'Dönem Bitiş']}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Payrolls 