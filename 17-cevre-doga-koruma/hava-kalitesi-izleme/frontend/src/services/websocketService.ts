import { io, Socket } from 'socket.io-client';
import { store } from '../store';
import { updateFromWebSocket } from '../store/slices/measurementSlice';
import { addNewAlert, updateAlertFromWebSocket } from '../store/slices/alertSlice';
import { updateDashboardData } from '../store/slices/dashboardSlice';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;

  connect() {
    const token = store.getState().auth.token;
    const wsUrl = process.env.REACT_APP_WS_URL || 'http://localhost:5000';

    this.socket = io(wsUrl, {
      auth: {
        token,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.clearReconnectInterval();
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect();
    });

    this.socket.on('measurement', (data: any) => {
      store.dispatch(updateFromWebSocket({
        stationId: data.stationId,
        measurement: data.measurement,
      }));
    });

    this.socket.on('alert', (data: any) => {
      if (data.action === 'new') {
        store.dispatch(addNewAlert(data.alert));
      } else if (data.action === 'update') {
        store.dispatch(updateAlertFromWebSocket(data.alert));
      }
    });

    this.socket.on('dashboard:update', (data: any) => {
      store.dispatch(updateDashboardData(data));
    });

    this.socket.on('station:status', (data: any) => {
      // Handle station status updates
      store.dispatch({
        type: 'stations/updateStationStatus',
        payload: data,
      });
    });

    this.socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });
  }

  private attemptReconnect() {
    if (this.reconnectInterval) return;

    this.reconnectInterval = setInterval(() => {
      if (store.getState().auth.isAuthenticated) {
        this.connect();
      }
    }, 5000);
  }

  private clearReconnectInterval() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
  }

  subscribeToStation(stationId: string) {
    if (this.socket) {
      this.socket.emit('subscribe:station', stationId);
    }
  }

  unsubscribeFromStation(stationId: string) {
    if (this.socket) {
      this.socket.emit('unsubscribe:station', stationId);
    }
  }

  subscribeToAlerts() {
    if (this.socket) {
      this.socket.emit('subscribe:alerts');
    }
  }

  unsubscribeFromAlerts() {
    if (this.socket) {
      this.socket.emit('unsubscribe:alerts');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.clearReconnectInterval();
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new WebSocketService();