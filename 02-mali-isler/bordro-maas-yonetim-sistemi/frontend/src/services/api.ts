import axios from 'axios'
import type {
  Employee,
  EmployeeCreate,
  EmployeeUpdate,
  DirectEmployeeCreate,
  DirectEmployeeResponse,
  Payroll,
  PayrollCreate,
  PayrollUpdate,
  PayrollSummary,
  PayrollCalculated,
  PayrollStatus,
  PayrollFilters,
  DashboardStats,
  RecentActivity,
  RegistrationRequest,
  RegistrationRequestCreate,
  RegistrationRequestResponse,
  ApproveRegistrationRequest,
  ApproveRegistrationResponse
} from '../types'

// Axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - JWT token ekleme
api.interceptors.request.use(
  (config) => {
    // LocalStorage'dan token'ı al
    const token = localStorage.getItem('auth_token')
    
    // Eğer token varsa Authorization header'ına ekle
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - 401 hatalarını handle et
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized access - token süresi dolmuş veya geçersiz
      console.error('Unauthorized access - redirecting to login')
      localStorage.removeItem('auth_token')
      
      // Redux store'dan logout action dispatch et
      // Bu import circular dependency'ye neden olmasın diye
      // logout'u direkt burada yapmak yerine event kullanıyoruz
      window.dispatchEvent(new CustomEvent('unauthorized'))
    }
    return Promise.reject(error)
  }
)

// Employee API
export const employeeApi = {
  getAll: () => api.get<Employee[]>('/employees'),
  getById: (id: number) => api.get<Employee>(`/employees/${id}`),
  create: (data: EmployeeCreate) => api.post<Employee>('/employees', data),
  createWithAccount: (data: DirectEmployeeCreate) => api.post<DirectEmployeeResponse>('/employees/create-with-account', data),
  update: (id: number, data: EmployeeUpdate) => api.put<Employee>(`/employees/${id}`, data),
  delete: (id: number) => api.delete(`/employees/${id}`),
  
  // Kayıt talebi onaylama ve personel oluşturma
  approveRegistrationAndCreateEmployee: (requestId: number, data: ApproveRegistrationRequest) => 
    api.post<ApproveRegistrationResponse>(`/employees/approve-registration/${requestId}`, data),
}

// Payroll API
export const payrollApi = {
  getAll: () => api.get<PayrollSummary[]>('/payrolls'),
  getSummary: (filters?: Partial<PayrollFilters>) => {
    const params = new URLSearchParams()
    
    if (filters?.include_inactive) params.append('include_inactive', 'true')
    if (filters?.employee_search) params.append('employee_search', filters.employee_search)
    if (filters?.status_filter) params.append('status_filter', filters.status_filter)
    if (filters?.date_start) params.append('date_start', filters.date_start)
    if (filters?.date_end) params.append('date_end', filters.date_end)
    
    return api.get<PayrollSummary[]>(`/payrolls/summary?${params.toString()}`)
  },
  getById: (id: number) => api.get<Payroll>(`/payrolls/${id}`),
  getByEmployee: (employeeId: number) => api.get<Payroll[]>(`/payrolls/employee/${employeeId}`),
  create: (data: PayrollCreate) => api.post<Payroll>('/payrolls', data),
  updateStatus: (id: number, data: PayrollUpdate) => api.put<Payroll>(`/payrolls/${id}/status`, data),
  delete: (id: number) => api.delete(`/payrolls/${id}`),
  calculate: (grossSalary: number) => api.post<PayrollCalculated>('/payrolls/calculate', grossSalary),
  getDashboardStats: () => api.get<DashboardStats>('/payrolls/dashboard/stats'),
  getRecentActivities: (limit: number = 10) => api.get<RecentActivity[]>(`/payrolls/dashboard/activities?limit=${limit}`),
}

// IAM Service API
export const iamApi = {
  getUsers: () => axios.get('http://localhost:8001/users/', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }
  }),
  
  // Registration Requests
  getRegistrationRequests: () => axios.get<RegistrationRequest[]>('http://localhost:8001/admin/registrations', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }
  }),
  
  approveRegistrationRequest: (requestId: number) => axios.post(`http://localhost:8001/admin/registrations/approve/${requestId}`, {}, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }
  }),
  
  rejectRegistrationRequest: (requestId: number) => axios.post(`http://localhost:8001/admin/registrations/reject/${requestId}`, {}, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }
  }),
  
  createRegistrationRequest: (data: RegistrationRequestCreate) => axios.post<RegistrationRequestResponse>('http://localhost:8001/register', data)
}

// System Settings API
export const settingsApi = {
  getSettings: () => api.get('/settings'),
  updateCompanyInfo: (data: any) => api.put('/settings/company', data),
  updateSecuritySettings: (data: any) => api.put('/settings/security', data),
  updateSMTPSettings: (data: any) => api.put('/settings/smtp', data),
  getMinimumWage: () => api.get('/settings/minimum-wage'),
  getSgkRates: () => api.get('/settings/sgk-rates'),
  
  // Finansal Ayarlar (Tarihsel)
  getFinancialSettings: () => api.get('/settings/financial'),
  getCurrentFinancialSettings: () => api.get('/settings/financial/current'),
  createFinancialSettings: (data: any) => api.post('/settings/financial', data),
}

export default api 