import { useCallback, useEffect, useMemo, useState } from 'react';
import { login, refreshToken, logout as apiLogout } from '../services/authService.js';
import api from '../services/api.js';
import { AuthContext } from './auth-context.js';
const setAuthorizationHeader = (accessToken) => {
  if (accessToken) {
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
};

const decodeJwtPayload = (token) => {
  if (!token || token.split('.').length < 2) {
    return null;
  }

  try {
    const base64 = token
      .split('.')[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

    return JSON.parse(atob(paddedBase64));
  } catch  {
    return null;
  }
};

const getUserFromAuthResponse = (data) => {
  if (data?.user) {
    return data.user;
  }

  const payload = decodeJwtPayload(data?.accessToken);

  if (!payload) {
    return null;
  }

  return {
    id: payload.userId || payload.id || payload.sub,
    email: payload.email,
    role: payload.role,
    tenantId: payload.tenantId,
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await refreshToken();
        const authenticatedUser = getUserFromAuthResponse(data);

        if (!data?.accessToken || !authenticatedUser?.id) {
          throw new Error('Session invalide');
        }

        setAuthorizationHeader(data.accessToken);
        setUser(authenticatedUser);
      } catch  {
        setAuthorizationHeader(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const loginUser = useCallback(async (email, password, tenantId) => {
    const { data } = await login(email, password, tenantId);

        if (!data?.accessToken) {
          throw new Error('Token d\'accès manquant');
    }

    const authenticatedUser = getUserFromAuthResponse(data);

    if (!authenticatedUser?.id) {
      throw new Error('Utilisateur authentifié introuvable');
    }

    setAuthorizationHeader(data.accessToken);
    setUser(authenticatedUser);

    return authenticatedUser;
  }, []);

  const logoutUser = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setAuthorizationHeader(null);
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((newUser) => {
    setUser(newUser);
  }, []);

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), loginUser, logoutUser, updateUser }),
    [user, loading, loginUser, logoutUser, updateUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}