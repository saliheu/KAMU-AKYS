export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'lawyer' | 'clerk' | 'viewer';
  department?: string;
  title?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: Date;
  preferences: {
    notifications: {
      email: boolean;
      system: boolean;
      documentExpiry: boolean;
      workflowDeadline: boolean;
    };
    defaultView: 'grid' | 'list';
    itemsPerPage: number;
  };
  signatureUrl?: string;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  category: 'contract' | 'agreement' | 'regulation' | 'decree' | 'circular' | 'court_decision' | 'legal_opinion' | 'power_of_attorney' | 'other';
  status: 'draft' | 'pending_review' | 'approved' | 'archived' | 'expired';
  confidentialityLevel: 'public' | 'internal' | 'confidential' | 'top_secret';
  tags: string[];
  metadata?: any;
  validFrom?: Date;
  validUntil?: Date;
  isTemplate: boolean;
  parentDocumentId?: string;
  currentVersion: number;
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: Date;
  checksum: string;
  fullTextContent?: string;
  ocrProcessed: boolean;
  digitallySignedBy: string[];
  signatureRequiredBy: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  creator?: User;
  versions?: Version[];
  shares?: Share[];
}

export interface Version {
  id: string;
  documentId: string;
  versionNumber: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  changes?: string;
  changeType: 'minor' | 'major' | 'revision';
  createdBy: string;
  checksum: string;
  metadata?: any;
  isArchived: boolean;
  createdAt: Date;
  creator?: User;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  documentId: string;
  type: 'approval' | 'review' | 'signature' | 'custom';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
  steps: WorkflowStep[];
  currentStep: number;
  initiatedBy: string;
  deadline?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  comments: WorkflowComment[];
  completedAt?: Date;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
  document?: Document;
  initiator?: User;
}

export interface WorkflowStep {
  stepNumber: number;
  name: string;
  description?: string;
  assignedTo: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  startedAt?: Date;
  completedAt?: Date;
  completedBy?: string;
  comments?: string;
  data?: any;
}

export interface WorkflowComment {
  stepNumber: number;
  action: string;
  comments?: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

export interface Share {
  id: string;
  documentId: string;
  sharedBy: string;
  sharedWith?: string;
  shareType: 'user' | 'department' | 'public' | 'link';
  permissions: string[];
  shareLink?: string;
  password?: string;
  expiresAt?: Date;
  maxDownloads?: number;
  downloadCount: number;
  lastAccessedAt?: Date;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  document?: Document;
  sharer?: User;
  recipient?: User;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  fileUrl: string;
  fileName: string;
  variables: TemplateVariable[];
  usage: number;
  isActive: boolean;
  createdBy: string;
  tags: string[];
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
  creator?: User;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  label: string;
  required: boolean;
  defaultValue?: any;
  options?: string[];
}

export interface DashboardStats {
  overview: {
    totalDocuments: number;
    myDocuments: number;
    sharedWithMe: number;
    recentDocuments: number;
  };
  documentsByStatus: Array<{
    status: string;
    count: number;
  }>;
  documentsByCategory: Array<{
    category: string;
    count: number;
  }>;
  workflows: {
    active: number;
    myPending: number;
  };
  versions: {
    total: number;
    averagePerDocument: number;
  };
  storage: {
    totalSize: number;
    averageSize: number;
  };
}

export interface ActivityData {
  documents: Array<{
    date: string;
    count: number;
  }>;
  versions: Array<{
    date: string;
    count: number;
  }>;
}

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  _highlights?: {
    title?: string[];
    description?: string[];
    content?: string[];
  };
}