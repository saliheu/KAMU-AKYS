import React, { useEffect } from 'react'
import { Card, Descriptions, Typography, Spin, Alert, Button, Space, Divider, Table } from 'antd'
import { ArrowLeftOutlined, PrinterOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'
import type { RootState, AppDispatch } from '../store/store'
import { fetchPayrollById } from '../store/slices/payrollSlice'

const { Title, Text } = Typography

const PayrollDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { currentPayroll, loading, error } = useSelector((state: RootState) => state.payroll)

  useEffect(() => {
    if (id) {
      dispatch(fetchPayrollById(parseInt(id)))
    }
  }, [dispatch, id])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
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
        style={{ margin: '20px' }}
      />
    )
  }

  if (!currentPayroll) {
    return (
      <Alert
        message="Bordro Bulunamadı"
        description="Aradığınız bordro bulunamadı."
        type="warning"
        showIcon
        style={{ margin: '20px' }}
      />
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

  return (
    <div className="page-container">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <Space>
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/payrolls')}
          >
            Geri
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            Bordro Detayı
          </Title>
        </Space>
        <Button 
          type="primary"
          icon={<PrinterOutlined />}
          onClick={() => window.print()}
        >
          Yazdır
        </Button>
      </div>

      <Card>
        <Title level={3}>
          {currentPayroll.employee.first_name} {currentPayroll.employee.last_name} - Bordro
        </Title>
        
        <Descriptions bordered column={2} style={{ marginBottom: '24px' }}>
          <Descriptions.Item label="Çalışan Adı">
            {currentPayroll.employee.first_name} {currentPayroll.employee.last_name}
          </Descriptions.Item>
          <Descriptions.Item label="TC Kimlik No">
            {currentPayroll.employee.national_id}
          </Descriptions.Item>
          <Descriptions.Item label="Unvan">
            {currentPayroll.employee.title}
          </Descriptions.Item>
          <Descriptions.Item label="İşe Başlama Tarihi">
            {dayjs(currentPayroll.employee.hire_date).format('DD.MM.YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="Bordro Dönemi Başlangıç">
            {dayjs(currentPayroll.pay_period_start).format('DD.MM.YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="Bordro Dönemi Bitiş">
            {dayjs(currentPayroll.pay_period_end).format('DD.MM.YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="Oluşturma Tarihi">
            {dayjs(currentPayroll.created_at).format('DD.MM.YYYY HH:mm')}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Title level={4}>Maaş Bilgileri</Title>
        <Descriptions bordered column={1} style={{ marginBottom: '24px' }}>
          <Descriptions.Item label="Brüt Maaş">
            <Text strong style={{ fontSize: '16px' }}>
              {formatCurrency(currentPayroll.gross_salary)}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Toplam Kesinti">
            <Text type="danger" strong style={{ fontSize: '16px' }}>
              {formatCurrency(currentPayroll.deductions.toplam_kesinti)}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Net Maaş">
            <Text type="success" strong style={{ fontSize: '18px' }}>
              {formatCurrency(currentPayroll.net_salary)}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  )
}

export default PayrollDetail 