import React, { useEffect, useState } from 'react'
import { Card, Table, Typography, Spin, Alert, Tag, Button, Descriptions, Modal, Space } from 'antd'
import { FileTextOutlined, EyeOutlined, DollarOutlined, DownloadOutlined } from '@ant-design/icons'
import { payrollApi, employeeApi } from '../services/api'
import type { Payroll, Employee } from '../types'

const { Title, Text } = Typography

const MyPayrolls: React.FC = () => {
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)

  useEffect(() => {
    fetchEmployeeAndPayrolls()
  }, [])

  const fetchEmployeeAndPayrolls = async () => {
    try {
      setLoading(true)
      const employeeResponse = await employeeApi.getAll()
      if (employeeResponse.data && employeeResponse.data.length > 0) {
        const employeeData = employeeResponse.data[0]
        setEmployee(employeeData)
        const payrollResponse = await payrollApi.getByEmployee(employeeData.id)
        setPayrolls(payrollResponse.data)
      } else {
        setError('Employee profili bulunamadı')
      }
    } catch (error) {
      console.error('Payrolls fetch error:', error)
      setError('Bordro bilgileri yüklenirken hata oluştu')
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

  const handleViewDetails = (payroll: Payroll) => {
    setSelectedPayroll(payroll)
    setDetailModalVisible(true)
  }

  const handleDownloadPayroll = (payroll: Payroll) => {
    const payrollContent = `BORDRO BELGESİ - ${employee?.first_name} ${employee?.last_name}

Bordro Dönemi: ${formatDate(payroll.pay_period_start)} - ${formatDate(payroll.pay_period_end)}
Brüt Maaş: ${formatCurrency(payroll.gross_salary)}
Net Maaş: ${formatCurrency(payroll.net_salary)}

Oluşturulma Tarihi: ${formatDate(payroll.created_at)}`

    const newWindow = window.open('', '_blank')
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>Bordro Belgesi</title></head>
          <body style="font-family: Arial; padding: 40px; line-height: 1.6;">
            <h1>Bordro Belgesi</h1>
            <pre>${payrollContent}</pre>
          </body>
        </html>
      `)
      newWindow.document.close()
    }
  }

  const columns = [
    {
      title: 'Bordro Dönemi',
      key: 'period',
      render: (record: Payroll) => (
        <div>
          <Text strong>{formatDate(record.pay_period_start)}</Text>
          <br />
          <Text style={{ color: '#6b7280', fontSize: '12px' }}>
            {formatDate(record.pay_period_end)} tarihine kadar
          </Text>
        </div>
      ),
    },
    {
      title: 'Brüt Maaş',
      dataIndex: 'gross_salary',
      key: 'gross_salary',
      render: (amount: number) => (
        <Text strong style={{ color: '#059669' }}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: 'Net Maaş',
      dataIndex: 'net_salary',
      key: 'net_salary',
      render: (amount: number) => (
        <Text strong style={{ color: '#0369a1', fontSize: '16px' }}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: 'Oluşturulma',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Durum',
      key: 'status',
      render: () => (
        <Tag color="green">Onaylanmış</Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (record: Payroll) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetails(record)}
          >
            Detay
          </Button>
          <Button
            icon={<DownloadOutlined />}
            size="small"
            onClick={() => handleDownloadPayroll(record)}
          >
            İndir
          </Button>
        </Space>
      ),
    },
  ]

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text style={{ color: '#6b7280' }}>Bordro bilgileriniz yükleniyor...</Text>
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

  const totalGross = payrolls.reduce((sum, p) => sum + p.gross_salary, 0)
  const totalNet = payrolls.reduce((sum, p) => sum + p.net_salary, 0)

  return (
    <div className="page-container fade-in-up">
      <div className="page-header">
        <div>
          <Title className="page-title">Bordro Geçmişim</Title>
          <Text style={{ color: '#6b7280', fontSize: '16px' }}>
            Tüm bordro kayıtlarım ve maaş geçmişim
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
          <FileTextOutlined />
          {payrolls.length} Bordro Kaydı
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <Card className="stats-card">
          <div className="stats-icon">
            <FileTextOutlined />
          </div>
          <div>
            <Text style={{ color: '#6b7280', fontSize: '14px' }}>Toplam Bordro</Text>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
              {payrolls.length}
            </div>
          </div>
        </Card>

        <Card className="stats-card">
          <div className="stats-icon">
            <DollarOutlined />
          </div>
          <div>
            <Text style={{ color: '#6b7280', fontSize: '14px' }}>Toplam Brüt Gelir</Text>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
              {formatCurrency(totalGross)}
            </div>
          </div>
        </Card>

        <Card className="stats-card">
          <div className="stats-icon">
            <DollarOutlined />
          </div>
          <div>
            <Text style={{ color: '#6b7280', fontSize: '14px' }}>Toplam Net Gelir</Text>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0369a1' }}>
              {formatCurrency(totalNet)}
            </div>
          </div>
        </Card>
      </div>

      <Card className="modern-card" title="Bordro Kayıtlarım">
        {payrolls.length > 0 ? (
          <Table
            columns={columns}
            dataSource={payrolls}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} / ${total} bordro`
            }}
          />
        ) : (
          <Alert
            message="Bordro Kaydı Bulunamadı"
            description="Henüz hiç bordro kaydınız bulunmamaktadır."
            type="info"
            showIcon
          />
        )}
      </Card>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileTextOutlined />
            Bordro Detayları
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Kapat
          </Button>,
          <Button 
            key="download" 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={() => selectedPayroll && handleDownloadPayroll(selectedPayroll)}
          >
            İndir
          </Button>
        ]}
        width={700}
      >
        {selectedPayroll && (
          <div>
            <Descriptions 
              title="Bordro Bilgileri"
              bordered 
              column={2}
              style={{ marginBottom: '24px' }}
            >
              <Descriptions.Item label="Çalışan" span={2}>
                {employee?.first_name} {employee?.last_name}
              </Descriptions.Item>
              <Descriptions.Item label="Dönem Başlangıç">
                {formatDate(selectedPayroll.pay_period_start)}
              </Descriptions.Item>
              <Descriptions.Item label="Dönem Bitiş">
                {formatDate(selectedPayroll.pay_period_end)}
              </Descriptions.Item>
              <Descriptions.Item label="Brüt Maaş">
                <Text strong style={{ color: '#059669' }}>
                  {formatCurrency(selectedPayroll.gross_salary)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Net Maaş">
                <Text strong style={{ color: '#0369a1', fontSize: '16px' }}>
                  {formatCurrency(selectedPayroll.net_salary)}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Card title="Kesintiler" size="small">
              <Descriptions bordered column={1}>
                {Object.entries(selectedPayroll.deductions).map(([key, value]) => (
                  <Descriptions.Item key={key} label={key}>
                    <Text style={{ color: '#dc2626' }}>
                      {formatCurrency(value as number)}
                    </Text>
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default MyPayrolls
