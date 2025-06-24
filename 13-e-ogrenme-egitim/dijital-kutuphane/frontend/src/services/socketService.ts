import { io, Socket } from 'socket.io-client';
import { store } from '@/store';
import { addNotification, updateNotification } from '@/store/slices/notificationSlice';
import { updateBorrowingStatus } from '@/store/slices/borrowingSlice';
import { Notification, Borrowing } from '@/types';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string): void {
    if (this.socket?.connected) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || '/';
    
    this.socket = io(socketUrl, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Notification events
    this.socket.on('notification:new', (notification: Notification) => {
      store.dispatch(addNotification(notification));
    });

    this.socket.on('notification:update', (notification: Notification) => {
      store.dispatch(updateNotification(notification));
    });

    // Borrowing events
    this.socket.on('borrowing:status', (data: { id: string; status: Borrowing['status'] }) => {
      store.dispatch(updateBorrowingStatus(data));
    });

    // Book availability events
    this.socket.on('book:available', (data: { bookId: string; title: string }) => {
      store.dispatch(addNotification({
        id: Date.now().toString(),
        type: 'book_available',
        title: 'Kitap Müsait',
        message: `"${data.title}" kitabı şu anda ödünç alınabilir durumda.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: store.getState().auth.user?.id || '',
      }));
    });

    // System events
    this.socket.on('system:maintenance', (data: { message: string; scheduledAt: string }) => {
      store.dispatch(addNotification({
        id: Date.now().toString(),
        type: 'system',
        title: 'Sistem Bakımı',
        message: data.message,
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: store.getState().auth.user?.id || '',
      }));
    });
  }

  // Emit events
  joinUserRoom(userId: string): void {
    this.socket?.emit('join:user', userId);
  }

  leaveUserRoom(userId: string): void {
    this.socket?.emit('leave:user', userId);
  }

  joinBookRoom(bookId: string): void {
    this.socket?.emit('join:book', bookId);
  }

  leaveBookRoom(bookId: string): void {
    this.socket?.emit('leave:book', bookId);
  }

  // Admin events
  broadcastNotification(notification: {
    title: string;
    message: string;
    type: string;
    targetUsers?: string[];
  }): void {
    this.socket?.emit('admin:broadcast', notification);
  }

  // Typing indicators for chat/comments
  startTyping(context: string): void {
    this.socket?.emit('typing:start', context);
  }

  stopTyping(context: string): void {
    this.socket?.emit('typing:stop', context);
  }

  // Custom event emitter
  emit(event: string, data: any): void {
    this.socket?.emit(event, data);
  }

  // Custom event listener
  on(event: string, callback: (data: any) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void): void {
    this.socket?.off(event, callback);
  }

  get isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new SocketService();