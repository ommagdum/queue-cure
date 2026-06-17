import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { API_BASE_URL } from '../config/api';

const useWebSocket = (onMessage) => {
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING');
  const clientRef = useRef(null);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => {
        const SockJS = require('sockjs-client');
        return new SockJS(`${API_BASE_URL}/ws`);
      },
      reconnectDelay: 5000,
      onConnect: () => {
        setConnectionStatus('LIVE');
        client.subscribe('/topic/queue-updates', (message) => {
          const queueState = JSON.parse(message.body);
          onMessage(queueState);
        });
      },
      onDisconnect: () => setConnectionStatus('RECONNECTING'),
      onStompError:  () => setConnectionStatus('RECONNECTING'),
    });
    client.activate();
    clientRef.current = client;
    return () => { client.deactivate(); };
  }, []);

  return connectionStatus;
};

export default useWebSocket;