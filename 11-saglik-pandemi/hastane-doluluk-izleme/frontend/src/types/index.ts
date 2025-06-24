export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'hospital_admin' | 'department_head' | 'viewer';
  hospitalId?: string;
  isActive: boolean;
  lastLogin?: Date;
}

export interface Hospital {
  id: string;
  name: string;
  code: string;
  type: 'state' | 'university' | 'private' | 'city';
  city: string;
  district?: string;
  region: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  location?: {
    lat: number;
    lng: number;
  };
  departments?: HospitalDepartment[];
}

export interface Department {
  id: string;
  name: string;
  category: 'emergency' | 'intensive_care' | 'surgery' | 'internal' | 'pediatric' | 'maternity' | 'other';
  isCritical: boolean;
  description?: string;
  isActive: boolean;
}

export interface HospitalDepartment {
  id: string;
  hospitalId: string;
  departmentId: string;
  hospital?: Hospital;
  department?: Department;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  reservedBeds: number;
  ventilatorTotal?: number;
  ventilatorOccupied?: number;
  lastUpdated: Date;
}

export interface OccupancyData {
  hospital: Pick<Hospital, 'id' | 'name' | 'city' | 'region'>;
  department: Pick<Department, 'id' | 'name' | 'category'>;
  occupancy: {
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
    occupancyRate: number;
    lastUpdated: Date;
  };
}

export interface Alert {
  id: string;
  hospitalId: string;
  departmentId?: string;
  alertRuleId: string;
  type: 'high_occupancy' | 'critical_occupancy' | 'no_beds' | 'ventilator_shortage' | 'rapid_increase';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  status: 'active' | 'acknowledged' | 'resolved';
  triggeredAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  acknowledgedBy?: string;
  resolvedBy?: string;
  hospital?: Hospital;
  department?: Department;
}

export interface AlertRule {
  id: string;
  name: string;
  type: Alert['type'];
  condition: 'greater_than' | 'less_than' | 'equals' | 'rate_change';
  threshold: number;
  severity: Alert['severity'];
  isActive: boolean;
  hospitalId?: string;
  departmentId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}