import { useEffect, useRef, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const WS_URL = 'http://localhost:8080/ws';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef(null);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('Connected to WebSocket');
        setIsConnected(true);
      },
      onDisconnect: () => {
        console.log('Disconnected from WebSocket');
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      setIsConnected(false);
    };
  }, []);

  const subscribe = useCallback((topic, callback) => {
    if (!clientRef.current || !clientRef.current.connected) {
      console.warn('Cannot subscribe, STOMP client not connected yet.');
      return null;
    }

    const subscription = clientRef.current.subscribe(topic, (message) => {
      try {
        const payload = JSON.parse(message.body);
        callback(payload);
      } catch (e) {
        console.error('Failed to parse WebSocket message', e);
      }
    });

    return subscription;
  }, []);

  return { isConnected, subscribe };
};
