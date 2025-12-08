import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { WS_URL } from '@/utils/constants';

class WebSocketService {
  private client: Client | null = null;
  private connected: boolean = false;
  private subscribers: Map<string, ((data: any) => void)[]> = new Map();

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connected && this.client) {
        resolve();
        return;
      }

      // Ensure we use HTTP protocol (SockJS requires http/https, not ws)
      // Clean up URL - remove any ws:// prefix and ensure http://
      let wsBaseUrl = WS_URL.trim();
      // Remove ws:// if present
      wsBaseUrl = wsBaseUrl.replace(/^ws:\/\//, '');
      // Ensure http:// protocol
      if (!wsBaseUrl.startsWith('http://') && !wsBaseUrl.startsWith('https://')) {
        wsBaseUrl = `http://${wsBaseUrl}`;
      }
      // Remove trailing slashes and any /ws paths
      wsBaseUrl = wsBaseUrl.replace(/\/+$/, '').replace(/\/ws\/?$/, '');
      const socket = new SockJS(`${wsBaseUrl}/ws`);
      this.client = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          this.connected = true;
          console.log('WebSocket connected');
          this.resubscribeAll();
          resolve();
        },
        onDisconnect: () => {
          this.connected = false;
          console.log('WebSocket disconnected');
        },
        onStompError: (frame) => {
          console.error('WebSocket error:', frame);
          reject(new Error(frame.headers['message'] || 'WebSocket connection failed'));
        },
      });

      this.client.activate();
    });
  }

  disconnect(): void {
    if (this.client) {
      this.subscribers.clear();
      this.client.deactivate();
      this.client = null;
      this.connected = false;
    }
  }

  subscribe(destination: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(destination)) {
      this.subscribers.set(destination, []);
    }
    this.subscribers.get(destination)!.push(callback);

    // If already connected, subscribe immediately
    if (this.connected && this.client) {
      this.doSubscribe(destination, callback);
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(destination);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  private doSubscribe(destination: string, callback: (data: any) => void): void {
    if (!this.client || !this.connected) return;

    this.client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        callback(message.body);
      }
    });
  }

  private resubscribeAll(): void {
    if (!this.client || !this.connected) return;

    this.subscribers.forEach((callbacks, destination) => {
      callbacks.forEach((callback) => {
        this.doSubscribe(destination, callback);
      });
    });
  }

  send(destination: string, body: any): void {
    if (!this.client || !this.connected) {
      console.warn('WebSocket not connected. Cannot send message.');
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export default new WebSocketService();


