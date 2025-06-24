export interface User {
  id: string;
  email: string;
  name: string;
  surname: string;
  tcNo?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  role: 'admin' | 'librarian' | 'member';
  status: 'active' | 'inactive' | 'suspended';
  membershipType: 'standard' | 'premium' | 'student';
  membershipExpiry?: string;
  borrowLimit: number;
  currentBorrowCount: number;
  totalBorrowCount: number;
  profilePicture?: string;
  preferences: {
    language: string;
    emailNotifications: boolean;
    smsNotifications: boolean;
    favoriteCategories: string[];
    readingGoal: number;
  };
  lastLoginAt?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: string;
  isbn?: string;
  title: string;
  subtitle?: string;
  description?: string;
  language: string;
  publishYear?: number;
  edition?: string;
  pageCount?: number;
  coverImage?: string;
  file?: string;
  fileType?: 'pdf' | 'epub' | 'mobi' | 'txt' | 'doc' | 'docx';
  fileSize?: number;
  deweyCode?: string;
  barcode?: string;
  location?: string;
  totalCopies: number;
  availableCopies: number;
  borrowCount: number;
  viewCount: number;
  downloadCount: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  metadata?: any;
  isDigital: boolean;
  allowDownload: boolean;
  accessLevel: 'public' | 'members' | 'premium';
  status: 'available' | 'borrowed' | 'reserved' | 'lost' | 'damaged' | 'processing';
  acquisitionDate: string;
  price?: number;
  source?: string;
  notes?: string;
  authors?: Author[];
  categories?: Category[];
  publisher?: Publisher;
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface Author {
  id: string;
  name: string;
  surname?: string;
  fullName: string;
  biography?: string;
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  nationality?: string;
  photo?: string;
  website?: string;
  awards: string[];
  genres: string[];
  bookCount: number;
  viewCount: number;
  socialMedia?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    goodreads?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  subcategories?: Category[];
  icon?: string;
  color?: string;
  order: number;
  bookCount: number;
  totalBookCount?: number;
  isActive: boolean;
  deweyRange?: {
    min?: number;
    max?: number;
  };
}

export interface Publisher {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  foundedYear?: number;
  bookCount: number;
  isActive: boolean;
}

export interface Borrowing {
  id: string;
  userId: string;
  bookId: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'active' | 'returned' | 'overdue' | 'lost';
  renewCount: number;
  maxRenewCount: number;
  fine: number;
  finePaid: boolean;
  issuedBy?: string;
  returnedTo?: string;
  notes?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
  rating?: number;
  user?: User;
  book?: Book;
  issuer?: User;
  returner?: User;
  overdueDays?: number;
  currentFine?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  userId: string;
  bookId: string;
  reservationDate: string;
  expiryDate: string;
  status: 'pending' | 'ready' | 'fulfilled' | 'cancelled' | 'expired';
  queuePosition?: number;
  notificationSent: boolean;
  notificationDate?: string;
  pickupDeadline?: string;
  notes?: string;
  user?: User;
  book?: Book;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  bookId: string;
  rating: number;
  title?: string;
  content?: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  reportCount: number;
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  moderationNotes?: string;
  user?: User;
  book?: Book;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: 'favorites' | 'wishlist' | 'reading' | 'completed' | 'custom';
  isPublic: boolean;
  coverImage?: string;
  bookCount: number;
  followerCount: number;
  viewCount: number;
  tags: string[];
  user?: User;
  books?: Book[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'due_reminder' | 'overdue_notice' | 'reservation_ready' | 'new_book' | 'system_message' | 'account_update' | 'fine_notice';
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: 'book' | 'borrowing' | 'reservation' | 'fine';
  isRead: boolean;
  readAt?: string;
  channel: 'in_app' | 'email' | 'sms' | 'push';
  emailSent: boolean;
  smsSent: boolean;
  pushSent: boolean;
  priority: 'low' | 'medium' | 'high';
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  activeBorrowings: number;
  overdueBooks: number;
  todayBorrowings: number;
  todayReturns: number;
  popularBooks: Book[];
  recentActivities: Activity[];
  categoryDistribution: { category: string; count: number }[];
  borrowingTrends: { date: string; count: number }[];
}

export interface Activity {
  id: string;
  type: 'borrow' | 'return' | 'reservation' | 'review' | 'new_book';
  userId: string;
  bookId?: string;
  description: string;
  timestamp: string;
  user?: User;
  book?: Book;
}

export interface SearchResult {
  books: Book[];
  authors: Author[];
  categories: Category[];
  totalResults: number;
  facets: {
    categories: { id: string; name: string; count: number }[];
    languages: { code: string; count: number }[];
    yearRange: { min: number; max: number };
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  surname: string;
  phone?: string;
  tcNo?: string;
  address?: string;
}

export interface BookFilters {
  search?: string;
  categoryId?: string;
  authorId?: string;
  publisherId?: string;
  language?: string;
  available?: boolean;
  publishYear?: { min: number; max: number };
  sortBy?: 'title' | 'year' | 'rating' | 'popular' | 'newest';
  sortOrder?: 'asc' | 'desc';
}

export interface BorrowingFilters {
  status?: 'active' | 'returned' | 'overdue' | 'lost' | 'all';
  userId?: string;
  bookId?: string;
  overdue?: boolean;
  dateRange?: { start: string; end: string };
}