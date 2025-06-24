export interface User {
  id: string;
  email: string;
  name: string;
  surname: string;
  phone?: string;
  role: 'admin' | 'lawyer' | 'secretary' | 'clerk' | 'client';
  barNumber?: string;
  specialization?: string;
  department?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  profilePhoto?: string;
  settings?: {
    notifications: {
      email: boolean;
      sms: boolean;
      inApp: boolean;
    };
    language: string;
    theme: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  type: 'individual' | 'corporate';
  tcNo?: string;
  name: string;
  surname?: string;
  taxNo?: string;
  companyName?: string;
  tradeRegistryNo?: string;
  email?: string;
  phone: string;
  alternativePhone?: string;
  address: string;
  city: string;
  district?: string;
  postalCode?: string;
  notes?: string;
  isActive: boolean;
  documents?: any[];
  bankAccounts?: any[];
  contactPersons?: any[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Case {
  id: string;
  caseNumber: string;
  courtFileNumber?: string;
  title: string;
  description?: string;
  type: CaseType;
  status: CaseStatus;
  priority: Priority;
  courtId: string;
  court?: Court;
  clientId: string;
  client?: Client;
  assignedLawyerId: string;
  assignedLawyer?: User;
  teamMembers?: User[];
  opposingParty?: string;
  opposingLawyer?: string;
  opposingLawyerContact?: any;
  claimAmount?: number;
  currency?: string;
  filingDate: Date;
  closingDate?: Date;
  nextHearingDate?: Date;
  statuteOfLimitationsDate?: Date;
  tags?: string[];
  metadata?: any;
  timeline?: TimelineEvent[];
  expenses?: Expense[];
  totalExpenses?: number;
  isConfidential: boolean;
  accessList?: string[];
  hearings?: Hearing[];
  documents?: Document[];
  notes?: Note[];
  tasks?: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Court {
  id: string;
  name: string;
  type: CourtType;
  level: 'first_instance' | 'appeal' | 'supreme';
  city: string;
  district?: string;
  address: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  workingHours?: any;
  judges?: any[];
  prosecutors?: any[];
  clerks?: any[];
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Hearing {
  id: string;
  caseId: string;
  case?: Case;
  hearingDate: Date;
  hearingTime: string;
  courtRoom?: string;
  type: HearingType;
  status: HearingStatus;
  judge?: string;
  prosecutor?: string;
  clerk?: string;
  attendees?: any[];
  agenda?: string;
  minutes?: string;
  decision?: string;
  nextHearingDate?: Date;
  postponementReason?: string;
  documents?: any[];
  witnesses?: any[];
  evidence?: any[];
  notes?: string;
  reminderSent: boolean;
  reminderSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  caseId: string;
  case?: Case;
  title: string;
  description?: string;
  type: DocumentType;
  category: DocumentCategory;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize?: number;
  mimeType?: string;
  uploadedBy: string;
  uploader?: User;
  version: number;
  previousVersionId?: string;
  documentDate?: Date;
  dueDate?: Date;
  tags?: string[];
  isConfidential: boolean;
  accessList?: string[];
  metadata?: any;
  ocrText?: string;
  ocrProcessed: boolean;
  checksum?: string;
  signatureInfo?: any;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  caseId: string;
  case?: Case;
  authorId: string;
  author?: User;
  title?: string;
  content: string;
  type: NoteType;
  priority: Priority;
  isPrivate: boolean;
  isPinned: boolean;
  attachments?: any[];
  mentions?: string[];
  tags?: string[];
  reminderDate?: Date;
  reminderSent: boolean;
  editHistory?: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  caseId?: string;
  case?: Case;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: Priority;
  assignedTo: string;
  assignee?: User;
  assignedBy: string;
  assigner?: User;
  dueDate: Date;
  completedAt?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  attachments?: any[];
  checklist?: ChecklistItem[];
  comments?: Comment[];
  reminderSent: boolean;
  reminderDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  user?: User;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: 'case' | 'hearing' | 'document' | 'note' | 'task';
  priority: Priority;
  isRead: boolean;
  readAt?: Date;
  isSent: boolean;
  sentAt?: Date;
  channels: string[];
  metadata?: any;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Enums and Types
export type CaseType = 
  | 'civil' | 'criminal' | 'administrative' | 'labor' 
  | 'commercial' | 'family' | 'enforcement' | 'bankruptcy'
  | 'intellectual_property' | 'tax' | 'other';

export type CaseStatus = 
  | 'pending' | 'active' | 'on_hold' | 'closed' 
  | 'won' | 'lost' | 'settled' | 'appealed' | 'archived';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type CourtType = 
  | 'civil_court' | 'criminal_court' | 'commercial_court'
  | 'labor_court' | 'administrative_court' | 'family_court'
  | 'enforcement_court' | 'consumer_court' | 'intellectual_property_court'
  | 'tax_court' | 'peace_court' | 'high_court' | 'constitutional_court'
  | 'court_of_appeals' | 'regional_court' | 'other';

export type HearingType = 
  | 'preliminary' | 'main' | 'evidence' | 'witness'
  | 'expert' | 'final' | 'verdict' | 'appeal' | 'other';

export type HearingStatus = 
  | 'scheduled' | 'completed' | 'postponed' | 'cancelled' | 'ongoing';

export type DocumentType = 
  | 'petition' | 'response' | 'evidence' | 'court_decision'
  | 'expert_report' | 'witness_statement' | 'contract'
  | 'invoice' | 'receipt' | 'correspondence' | 'power_of_attorney'
  | 'notification' | 'minutes' | 'other';

export type DocumentCategory = 'incoming' | 'outgoing' | 'court' | 'internal';

export type NoteType = 
  | 'general' | 'legal' | 'meeting' | 'phone_call'
  | 'research' | 'strategy' | 'todo' | 'reminder';

export type TaskType = 
  | 'research' | 'document_preparation' | 'court_filing'
  | 'client_meeting' | 'deadline' | 'payment' | 'other';

export type TaskStatus = 
  | 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';

export type NotificationType = 
  | 'hearing_reminder' | 'document_upload' | 'case_update'
  | 'deadline_warning' | 'new_case_assignment' | 'note_mention'
  | 'task_assignment' | 'client_message' | 'system_alert'
  | 'payment_reminder' | 'statute_warning';

// Helper Types
export interface TimelineEvent {
  date: Date;
  event: string;
  userId: string;
  userName: string;
}

export interface Expense {
  id: string;
  date: Date;
  description: string;
  amount: number;
  category: string;
  receipt?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: Date;
  completedBy?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

// API Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}