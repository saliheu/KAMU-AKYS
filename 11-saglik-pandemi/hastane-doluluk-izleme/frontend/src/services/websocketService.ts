import { io, Socket } from 'socket.io-client';
import { store } from '../store';
import { updateOccupancyFromWebSocket } from '../store/slices/occupancySlice';
import { addNewAlert, updateAlertFromWebSocket } from '../store/slices/alertSlice';
import { showSnackbar } from '../store/slices/uiSlice';

class WebSocketService {
  private socket: Socket | null = null;

  connect(): void {
    if (this.socket?.connected) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    this.socket = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      store.dispatch(
        showSnackbar({
          message: 'Gerçek zamanlı bağlantı kuruldu',
          severity: 'success',
        })
      );
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      store.dispatch(
        showSnackbar({
          message: 'Bağlantı hatası',
          severity: 'error',
        })
      );
    });

    this.socket.on('occupancy_update', (data) => {
      store.dispatch(updateOccupancyFromWebSocket(data));
    });

    this.socket.on('new_alert', (alert) => {
      store.dispatch(addNewAlert(alert));
      store.dispatch(
        showSnackbar({
          message: `Yeni uyarı: ${alert.message}`,
          severity: alert.severity === 'critical' ? 'error' : 'warning',
        })
      );
    });

    this.socket.on('alert_update', (alert) => {
      store.dispatch(updateAlertFromWebSocket(alert));
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinHospitalRoom(hospitalId: string): void {
    if (this.socket) {
      this.socket.emit('join_room', `hospital_${hospitalId}`);
    }
  }

  leaveHospitalRoom(hospitalId: string): void {
    if (this.socket) {
      this.socket.emit('leave_room', `hospital_${hospitalId}`);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new WebSocketService();