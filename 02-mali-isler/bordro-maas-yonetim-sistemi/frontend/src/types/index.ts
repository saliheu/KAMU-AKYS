// Employee Types
export interface Employee {
  id: number
  first_name: string
  last_name: string
  national_id: string
  title: string
  hire_date: string
  gross_salary: number
  is_active: boolean
  created_at: string
}

export interface EmployeeCreate {
  first_name: string
  last_name: string
  national_id: string
  title: string
  hire_date: string
  gross_salary: number
}

export interface EmployeeUpdate {
  first_name?: string
  last_name?: string
  title?: string
  gross_salary?: number
}

// Payroll Status Enum
export enum PayrollStatus {
  DRAFT = "DRAFT",
  APPROVED = "APPROVED", 
  PAID = "PAID",
  CANCELLED = "CANCELLED"
}

// Payroll Types
export interface PayrollDeduction {
  oran: number
  tutar: number
}

export interface PayrollDeductions {
  gelir_vergisi: PayrollDeduction
  sgk_primi: PayrollDeduction
  issizlik_sigortasi: PayrollDeduction
  toplam_kesinti: number
}

export interface Payroll {
  id: number
  employee_id: number
  pay_period_start: string
  pay_period_end: string
  gross_salary: number
  deductions: PayrollDeductions
  net_salary: number
  status: PayrollStatus
  created_at: string
  employee: Employee
}

export interface PayrollCreate {
  employee_id: number
  pay_period_start: string
  pay_period_end: string
}

export interface PayrollUpdate {
  status?: PayrollStatus
}

export interface PayrollSummary {
  id: number
  employee_full_name: string
  employee_is_active: boolean
  pay_period_start: string
  pay_period_end: string
  gross_salary: number
  net_salary: number
  status: PayrollStatus
  created_at: string
}

export interface PayrollCalculated {
  gross_salary: number
  deductions: PayrollDeductions
  net_salary: number
}

// Filtreleme Types
export interface PayrollFilters {
  include_inactive: boolean
  employee_search: string
  status_filter: PayrollStatus | null
  date_start: string | null
  date_end: string | null
}

// Dashboard Types
export interface DashboardStats {
  total_employees: number
  total_payrolls: number
  current_month_payrolls: number
  total_gross_salary: number
  total_net_salary: number
  current_month_net_salary: number  // Bu ay ödenen net maaş toplamı
  estimated_monthly_budget: number  // Aktif çalışanların maaşları toplamı
  budget_usage_percent: number  // Bütçe kullanım oranı
}

export interface RecentActivity {
  key: string
  action: string
  details: string
  time: string
  type: 'employee' | 'payroll' | 'system'
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  message?: string
  status: string
}

export interface ApiError {
  detail: string
  status_code: number
}

// Doğrudan Personel Oluşturma Types
export interface DirectEmployeeCreate {
  // Employee bilgileri
  first_name: string
  last_name: string
  national_id: string
  title: string
  hire_date: string
  gross_salary: number
  
  // IAM User bilgileri
  email: string
  password: string
}

export interface DirectEmployeeResponse {
  employee: Employee
  user_id: number
  message: string
}

// Kayıt Talepleri Types
export interface RegistrationRequest {
  id: number
  email: string
  first_name: string
  last_name: string
  role: string
  requested_at: string
}

export interface RegistrationRequestCreate {
  email: string
  first_name: string
  last_name: string
  role: string
  password: string
}

export interface RegistrationRequestResponse {
  id: number
  email: string
  first_name: string
  last_name: string
  role: string
  requested_at: string
}

// Kayıt Talebi Onaylama Types
export interface ApproveRegistrationRequest {
  title: string
  hire_date: string
  gross_salary: number
  national_id: string
}

export interface ApproveRegistrationResponse {
  employee: Employee
  user_id: number
  message: string
}

// System Settings Types
export interface TaxBracket {
  min_amount: number
  max_amount?: number
  rate: number
  description: string
}

export interface SystemSettings {
  id: number
  // Kurum Bilgileri
  company_name?: string
  company_tax_number?: string
  company_address?: string
  company_phone?: string
  company_logo_url?: string
  
  // Sistem Ayarları
  system_currency: string
  date_format: string
  
  // Güvenlik Ayarları
  min_password_length: number
  require_uppercase: boolean
  require_lowercase: boolean
  require_numbers: boolean
  require_special_chars: boolean
  
  // SMTP Ayarları
  smtp_server?: string
  smtp_port?: number
  smtp_username?: string
  smtp_use_tls: boolean
  smtp_from_email?: string
  smtp_from_name?: string
  
  // Metadata
  created_at: string
  updated_at: string
  updated_by?: string
}

export interface CompanyInfoUpdate {
  company_name?: string
  company_tax_number?: string
  company_address?: string
  company_phone?: string
  company_logo_url?: string
}

export interface FinancialSettingsUpdate {
  minimum_wage?: number
  sgk_employee_rate?: number
  sgk_employer_rate?: number
  unemployment_insurance_rate?: number
  income_tax_brackets?: TaxBracket[]
}

export interface FinancialSettings {
  id: number
  effective_year: number
  effective_date: string
  minimum_wage?: number
  sgk_employee_rate?: number
  sgk_employer_rate?: number
  unemployment_insurance_rate?: number
  income_tax_brackets?: TaxBracket[]
  created_at: string
  created_by?: string
  description?: string
  is_active: boolean
}

export interface FinancialSettingsCreate {
  effective_year: number
  effective_date: string
  minimum_wage?: number
  sgk_employee_rate?: number
  sgk_employer_rate?: number
  unemployment_insurance_rate?: number
  income_tax_brackets?: TaxBracket[]
  description?: string
}

export interface SecuritySettingsUpdate {
  min_password_length?: number
  require_uppercase?: boolean
  require_lowercase?: boolean
  require_numbers?: boolean
  require_special_chars?: boolean
}

export interface SMTPSettingsUpdate {
  smtp_server?: string
  smtp_port?: number
  smtp_username?: string
  smtp_password?: string
  smtp_use_tls?: boolean
  smtp_from_email?: string
  smtp_from_name?: string
} 