export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'ADMIN' | 'LIBRARIAN' | 'ASSISTANT';
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface Member {
  id: number;
  member_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  tc_no: string;
  address: string;
  birth_date: string;
  member_type: 'STUDENT' | 'TEACHER' | 'STAFF' | 'PUBLIC';
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'BLOCKED';
  registration_date: string;
  expiry_date: string;
  photo?: string;
  notes?: string;
  is_active: boolean;
  current_loans_count: number;
  can_borrow: boolean;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Author {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  slug: string;
  biography?: string;
  birth_date?: string;
  death_date?: string;
  nationality?: string;
  photo?: string;
  books_count: number;
  age?: number;
}

export interface Publisher {
  id: number;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  books_count: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent?: number;
  parent_name?: string;
  children_count: number;
  books_count: number;
}

export interface Book {
  id: number;
  isbn: string;
  title: string;
  slug: string;
  authors: Author[];
  publisher: number;
  publisher_name: string;
  categories: Category[];
  publication_year: number;
  language: string;
  pages: number;
  description?: string;
  cover_image?: string;
  edition?: string;
  dewey_code?: string;
  tags?: string;
  barcode_image?: string;
  qr_code?: string;
  available_copies: number;
  total_copies: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface BookCopy {
  id: number;
  copy_number: string;
  book: number;
  book_title: string;
  book_isbn: string;
  status: 'AVAILABLE' | 'BORROWED' | 'RESERVED' | 'LOST' | 'DAMAGED' | 'MAINTENANCE';
  location: string;
  acquisition_date: string;
  condition_notes?: string;
}

export interface Loan {
  id: number;
  member: number;
  member_name: string;
  member_id: string;
  book_copy: number;
  book_title: string;
  book_isbn: string;
  borrowed_date: string;
  due_date: string;
  returned_date?: string;
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE' | 'LOST';
  fine_amount: number;
  fine_paid: boolean;
  notes?: string;
  is_overdue: boolean;
  days_overdue: number;
  borrowed_by_name?: string;
  returned_to_name?: string;
}

export interface Reservation {
  id: number;
  member: number;
  member_name: string;
  member_id: string;
  book: number;
  book_title: string;
  book_isbn: string;
  reserved_date: string;
  expiry_date: string;
  status: 'ACTIVE' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';
  notification_sent: boolean;
  fulfilled_date?: string;
  notes?: string;
  position_in_queue: number;
  created_by_name?: string;
}

export interface Fine {
  id: number;
  member: number;
  member_name: string;
  member_id: string;
  loan?: number;
  loan_book?: string;
  fine_type: 'OVERDUE' | 'DAMAGE' | 'LOST' | 'OTHER';
  amount: number;
  paid: boolean;
  paid_date?: string;
  description: string;
  created_by_name?: string;
  paid_to_name?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface DashboardStats {
  books: {
    total: number;
    total_copies: number;
    available_copies: number;
    categories: number;
    authors: number;
    publishers: number;
  };
  members: {
    total: number;
    active: number;
    suspended: number;
    expired: number;
    new_this_month: number;
  };
  loans: {
    active: number;
    overdue: number;
    today: number;
    returns_today: number;
    this_month: number;
  };
  fines: {
    total_amount: number;
    unpaid_amount: number;
    unpaid_count: number;
  };
  reservations: {
    active: number;
    today: number;
  };
}