// User types
export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  CITIZEN = 'CITIZEN',
  OFFICER = 'OFFICER',
  ADMIN = 'ADMIN'
}

// Citizen types
export interface Citizen {
  id: number;
  userId: number;
  tcNo: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  birthDate: string;
  user?: User;
}

// Department types
export interface Department {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Complaint types
export interface Complaint {
  id: number;
  citizenId: number;
  departmentId: number;
  subject: string;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  citizen?: Citizen;
  department?: Department;
  responses?: ComplaintResponse[];
}

export enum ComplaintStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED'
}

export enum ComplaintPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// ComplaintResponse types
export interface ComplaintResponse {
  id: number;
  complaintId: number;
  officerId: number;
  responseText: string;
  attachments?: string[];
  createdAt: string;
  officer?: Officer;
}

// Officer types
export interface Officer {
  id: number;
  userId: number;
  departmentId: number;
  firstName: string;
  lastName: string;
  title: string;
  user?: User;
  department?: Department;
}

// Dashboard statistics
export interface DashboardStats {
  totalComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  rejectedComplaints: number;
  averageResponseTime: number;
  complaintsByDepartment: DepartmentStats[];
  complaintsByPriority: PriorityStats[];
  recentComplaints: Complaint[];
}

export interface DepartmentStats {
  departmentId: number;
  departmentName: string;
  count: number;
}

export interface PriorityStats {
  priority: ComplaintPriority;
  count: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form types
export interface ComplaintFormData {
  departmentId: number;
  subject: string;
  description: string;
  priority: ComplaintPriority;
  attachments?: File[];
}

export interface LoginFormData {
  username: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  tcNo: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  birthDate: string;
}

// Filter types
export interface ComplaintFilters {
  status?: ComplaintStatus;
  priority?: ComplaintPriority;
  departmentId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}