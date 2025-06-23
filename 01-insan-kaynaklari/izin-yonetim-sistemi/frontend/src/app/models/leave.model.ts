export interface LeaveRequest {
  id: number;
  user: any;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: LeaveStatus;
  approvedBy?: any;
  approvedAt?: string;
  approvalComment?: string;
  rejectionReason?: string;
  attachmentPath?: string;
  halfDay: boolean;
  halfDayPeriod?: HalfDayPeriod;
  substituteUser?: any;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateLeaveRequest {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
  halfDay?: boolean;
  halfDayPeriod?: HalfDayPeriod;
  substituteUserId?: number;
  attachmentPath?: string;
}

export type LeaveType = 'ANNUAL' | 'SICK' | 'MATERNITY' | 'PATERNITY' | 'MARRIAGE' | 'BEREAVEMENT' | 'UNPAID' | 'ADMINISTRATIVE' | 'OTHER';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'WITHDRAWN';

export type HalfDayPeriod = 'MORNING' | 'AFTERNOON';

export interface LeaveBalance {
  id: number;
  user: any;
  year: number;
  leaveType: LeaveType;
  entitlement: number;
  used: number;
  remaining: number;
  carriedOver: number;
  createdAt: string;
  updatedAt?: string;
}