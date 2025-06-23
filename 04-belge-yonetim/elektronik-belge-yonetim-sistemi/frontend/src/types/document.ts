export interface Document {
  id: number;
  title: string;
  description: string;
  file: string;
  file_name: string;
  file_size: number;
  file_type: string;
  category: number | null;
  category_detail?: Category;
  tags: string[];
  status: 'draft' | 'active' | 'archived' | 'deleted';
  version: number;
  is_public: boolean;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
  latest_version?: DocumentVersion;
  can_edit: boolean;
  can_delete: boolean;
}

export interface DocumentVersion {
  id: number;
  version_number: number;
  file: string;
  file_name: string;
  file_size: number;
  change_notes: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
}

export interface DocumentAccess {
  id: number;
  user?: number;
  user_detail?: any;
  department?: number;
  department_name?: string;
  access_level: 'view' | 'edit' | 'delete' | 'share';
  granted_by: number;
  granted_by_name: string;
  granted_at: string;
  expires_at?: string;
}

export interface DocumentLog {
  id: number;
  user: number;
  user_name: string;
  action: string;
  action_display: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number | null;
  children?: Category[];
  icon: string;
  color: string;
  is_active: boolean;
  full_path: string;
  document_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentData {
  title: string;
  description?: string;
  file: File;
  category?: number;
  tags?: string[];
  is_public?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateDocumentData {
  title?: string;
  description?: string;
  category?: number;
  tags?: string[];
  status?: string;
  is_public?: boolean;
  metadata?: Record<string, any>;
  new_version_file?: File;
  version_notes?: string;
}