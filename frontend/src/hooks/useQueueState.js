import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchQueue } from '../api/queueApi';
import { Client } from '@stomp/stompjs';
import { API_BASE_URL } from '../config/api';
const useQueueState = () => {
  const [queueState, setQueueState]       = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [toast, setToast]                 = useState(null);
  const [connectionStatus, setStatus]     = useState('CONNECTING');
  const clientRef                         = useRef(null);
  const loadQueue = useCallback(async () => {
    try {
      const data = await fetchQueue();
      setQueueState(data);
      setError(null);
    } catch {
      setError('Could not load queue. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { loadQueue(); }, [loadQueue]);
  useEffect(() => {
    const SockJS = require('sockjs-client');
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
      reconnectDelay: 5000,
      onConnect: () => {
        setStatus('LIVE');
        loadQueue(); // Re-fetch on connect
        client.subscribe('/topic/queue-updates', (msg) => {
          setQueueState(JSON.parse(msg.body));
        });
      },
      onDisconnect: () => setStatus('RECONNECTING'),
      onStompError:  () => setStatus('RECONNECTING'),
    });
    client.activate();
    clientRef.current = client;
    return () => client.deactivate();
  }, [loadQueue]);
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  return { queueState, loading, error, connectionStatus, loadQueue, showToast, toast };
};
export default useQueueState;