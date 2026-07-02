import { useEffect, useMemo, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './useAuth';
import api from '../services/api';

const getSocketUrl = () => {
  const socketUrl = import.meta.env.VITE_SOCKET_URL;
  const apiUrl = import.meta.env.VITE_API_URL;

  if (socketUrl) {
    return socketUrl;
  }

  if (apiUrl) {
    return apiUrl.replace(/\/api\/?$/, '');
  }

  throw new Error('VITE_SOCKET_URL ou VITE_API_URL doit être défini dans le frontend.');
};

export function useSocket() {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const nextSocket = io(getSocketUrl(), {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    const authenticate = () => {
      setConnected(true);
      const authorization = api.defaults.headers.common.Authorization;
      const token = authorization?.startsWith('Bearer ') ? authorization.split(' ')[1] : null;

      if (token) {
        nextSocket.emit('authenticate', token);
      }
    };

    nextSocket.on('connect', authenticate);
    nextSocket.on('authenticated', (payload) => setAuthenticated(Boolean(payload?.success)));
    nextSocket.on('disconnect', () => {
      setConnected(false);
      setAuthenticated(false);
    });

    Promise.resolve().then(() => setSocket(nextSocket));

    return () => {
      nextSocket.off('connect', authenticate);
      nextSocket.off('authenticated');
      nextSocket.off('disconnect');
      nextSocket.close();
      Promise.resolve().then(() => {
        setSocket(null);
        setConnected(false);
        setAuthenticated(false);
      });
    };
  }, [user]);

  return useMemo(
    () => ({ socket, connected, authenticated }),
    [socket, connected, authenticated]
  );
}

export default useSocket;
