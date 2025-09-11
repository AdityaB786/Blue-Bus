import io, { Socket } from 'socket.io-client';
import { WebSocketMessage } from '../types';

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: WebSocketMessage) => void>> = new Map();

  connect(url: string = process.env.REACT_APP_API_URL || 'ws://localhost:8000') {
    if (this.socket?.connected) return;

    this.socket = io(url, {
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('message', (data: WebSocketMessage) => {
      this.notifyListeners(data);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  subscribe(tripId: string, callback: (data: WebSocketMessage) => void) {
    if (!this.listeners.has(tripId)) {
      this.listeners.set(tripId, new Set());
    }
    this.listeners.get(tripId)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(tripId);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(tripId);
        }
      }
    };
  }

  private notifyListeners(data: WebSocketMessage) {
    const callbacks = this.listeners.get(data.tripId);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

export default new WebSocketService();