export interface User {
  id: number;
  tcNo: string;
  email: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'HR' | 'ADMIN';
  department?: Department;
  manager?: User;
  startDate: string;
  phone?: string;
  position?: string;
  annualLeaveBalance: number;
  usedAnnualLeave: number;
  sickLeaveBalance: number;
  usedSickLeave: number;
  isActive: boolean;
}

export interface Department {
  id: number;
  code: string;
  name: string;
  description?: string;
  parentDepartment?: Department;
  isActive: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  tcNo: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  startDate: string;
  phone?: string;
  position?: string;
  departmentId?: number;
  managerId?: number;
}