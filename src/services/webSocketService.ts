import { Client, StompSubscription } from '@stomp/stompjs';
import { BASE_SERVER_URL } from './apiClient';

type SubscribeCallback = (message: any) => void;

class WebSocketService {
  public client: Client;
  private pendingSubscriptions: { topic: string, callback: SubscribeCallback, unsubscribeFn?: () => void }[] = [];

  constructor() {
    // If BASE_SERVER_URL is relative (e.g. proxy), we construct absolute ws:// URL
    let wsUrl = '';
    if (BASE_SERVER_URL.startsWith('http')) {
        wsUrl = BASE_SERVER_URL.replace(/^http/, 'ws') + '/ws';
    } else {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        wsUrl = `${protocol}//${window.location.host}/ws`;
    }

    this.client = new Client({
      brokerURL: wsUrl,
      debug: function (_str) {
        if (import.meta.env.DEV) {
          // console.log('STOMP: ' + _str); // Un-comment to trace
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      if (import.meta.env.DEV) console.log('WebSocket Connected');
      // Resubscribe or execute pending subscriptions
      this.pendingSubscriptions.forEach(sub => {
         const unsubscribeFn = this.doSubscribe(sub.topic, sub.callback);
         sub.unsubscribeFn = unsubscribeFn;
      });
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
    };
  }

  connect() {
    if (!this.client.active) {
        this.client.activate();
    }
  }

  disconnect() {
    if (this.client.active) {
        this.client.deactivate();
    }
    this.pendingSubscriptions = [];
  }

  private doSubscribe(topic: string, callback: SubscribeCallback): () => void {
    const subscription: StompSubscription = this.client.subscribe(topic, (msg) => {
      if (msg.body) {
        try {
            callback(JSON.parse(msg.body));
        } catch(e) {
            callback(msg.body); // Fallback to raw string if not JSON
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }

  subscribe(topic: string, callback: SubscribeCallback): () => void {
    const pendingSub = { topic, callback, unsubscribeFn: undefined as any };
    this.pendingSubscriptions.push(pendingSub);

    if (this.client.connected) {
      pendingSub.unsubscribeFn = this.doSubscribe(topic, callback);
    }

    return () => {
      if (pendingSub.unsubscribeFn) {
          pendingSub.unsubscribeFn();
      }
      this.pendingSubscriptions = this.pendingSubscriptions.filter(
          sub => sub !== pendingSub
      );
    };
  }
}

export const webSocketService = new WebSocketService();
