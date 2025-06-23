export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  title?: string;
  department?: Department;
  role: 'USER' | 'ADMIN';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  parentId?: number;
  parentName?: string;
}

export interface Meeting {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  organizer: User;
  room?: MeetingRoom;
  type: 'IN_PERSON' | 'ONLINE' | 'HYBRID';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  location?: string;
  onlineLink?: string;
  agenda?: string;
  sendReminder: boolean;
  reminderMinutes?: number;
  isRecurring: boolean;
  recurrenceType?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  recurrenceInterval?: number;
  recurrenceEndDate?: string;
  participants: User[];
  attachments: MeetingAttachment[];
  minutes?: MeetingMinutes;
  actionItems: ActionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface MeetingRoom {
  id: number;
  name: string;
  location: string;
  capacity: number;
  equipment?: string;
  hasProjector: boolean;
  hasVideoConference: boolean;
  hasWhiteboard: boolean;
  isAvailable: boolean;
}

export interface MeetingAttachment {
  id: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  filePath: string;
  uploadedBy: User;
  uploadedAt: string;
}

export interface MeetingMinutes {
  id: number;
  content: string;
  decisions?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface ActionItem {
  id: number;
  description: string;
  assignedTo: User;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  title?: string;
  departmentId?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateMeetingRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  roomId?: number;
  type: 'IN_PERSON' | 'ONLINE' | 'HYBRID';
  location?: string;
  onlineLink?: string;
  agenda?: string;
  sendReminder?: boolean;
  reminderMinutes?: number;
  isRecurring?: boolean;
  recurrenceType?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  recurrenceInterval?: number;
  recurrenceEndDate?: string;
  participantIds: number[];
}

export interface UpdateMeetingRequest {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  roomId?: number;
  type?: 'IN_PERSON' | 'ONLINE' | 'HYBRID';
  location?: string;
  onlineLink?: string;
  agenda?: string;
  sendReminder?: boolean;
  reminderMinutes?: number;
  participantIds?: number[];
}