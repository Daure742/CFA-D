import { useCallback, useEffect, useMemo, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api.js';
import { NotifContext } from './notif-context.js';
import toast from 'react-hot-toast';

export function NotifProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL ||
                      (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : null);

    if (!socketUrl) {
      console.error('VITE_SOCKET_URL ou VITE_API_URL doit être défini pour la connexion Socket.io.');
      return undefined;
    }

    console.log('🔌 [NotifContext] Connexion Socket.io:', socketUrl);

    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('✅ [Socket.io] Connecté');
      setSocket(newSocket);

      const authorization = api.defaults.headers.common.Authorization;
      const token = authorization?.startsWith('Bearer ') ? authorization.split(' ')[1] : null;

      if (token) {
        newSocket.emit('authenticate', token);
      }

      // If user (or another tab) stored the active cours id, emit it on connect
      const activeCoursId = typeof window !== 'undefined' ? localStorage.getItem('activeCoursId') : null;
      if (activeCoursId && token) {
        console.log('🔁 [Socket.io] Re-emit connexion-cours for', activeCoursId);
        newSocket.emit('connexion-cours', activeCoursId);
      }
    });

    newSocket.on('nouvelle-notification', (notif) => {
      console.log('🔔 [Socket.io] Nouvelle notification:', notif);
      setNotifications((prev) => [notif, ...prev]);
    });

    newSocket.on('cours-live-start', (payload) => {
      console.log('📢 [Socket.io] Cours live démarré:', payload);
      const notif = {
        titre: `Cours en direct: ${payload.titre}`,
        message: `La session a commencé. Cliquez pour rejoindre.`,
        lien: payload.lien,
        coursId: payload.coursId,
        createdAt: new Date()
      };
      setNotifications((prev) => [notif, ...prev]);

      // Show a prominent toast with join action
      toast((t) => (
        <div className="p-2">
          <div className="font-semibold">{notif.titre}</div>
          <div className="text-sm text-gray-700 mt-1">{notif.message}</div>
          {notif.lien && (
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => { window.open(notif.lien, '_blank'); toast.dismiss(t.id); }}
                className="rounded bg-indigo-600 px-3 py-1 text-white text-sm"
              >Rejoindre</button>
              <button onClick={() => toast.dismiss(t.id)} className="rounded bg-gray-200 px-3 py-1 text-sm">Fermer</button>
            </div>
          )}
        </div>
      ));
    });

    newSocket.on('disconnect', () => {
      console.log('❌ [Socket.io] Déconnecté');
      setSocket(null);
    });

    newSocket.on('error', (error) => {
      console.error('⚠️ [Socket.io] Erreur:', error);
    });

    // Reconnection handling: on reconnect attempt, re-emit active cours
    try {
      const manager = newSocket.io;
      if (manager) {
        manager.on('reconnect', () => {
          const activeCoursId = typeof window !== 'undefined' ? localStorage.getItem('activeCoursId') : null;
          if (activeCoursId) {
            console.log('🔁 [Socket.io] Reconnect detected, re-emit connexion-cours', activeCoursId);
            newSocket.emit('connexion-cours', activeCoursId);
          }
        });
      }
    } catch (err) {
      void err;
    }

    return () => {
      newSocket.close();
    };
  }, [user]);

  const addNotification = useCallback((notif) => {
    setNotifications((prev) => [notif, ...prev]);
  }, []);

  const value = useMemo(
    () => ({ notifications, addNotification, socket }),
    [notifications, addNotification, socket]
  );

  return (
    <NotifContext.Provider value={value}>
      {children}
    </NotifContext.Provider>
  );
}
