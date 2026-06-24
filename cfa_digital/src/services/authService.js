import api from './api';

export const register = ({ nom, prenom, email, motDePasse, formation, sessionId, tenantId }) =>
  api.post('/auth/register', { nom, prenom, email, motDePasse, formation, sessionId, tenantId });
export const getSessionsOuvertes = (formation, tenantId) =>
  api.get('/auth/sessions-ouvertes', { params: { formation, tenantId } });
export const login = (email, motDePasse, tenantId) => api.post('/auth/login', { email, motDePasse, tenantId });
export const refreshToken = () => api.post('/auth/refresh', null, { timeout: 2500 });
export const logout = () => api.post('/auth/logout');
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, nouveauMotDePasse) => api.post('/auth/reset-password', { token, nouveauMotDePasse });
export const sendVerificationCode = ({ email, telephone }) => api.post('/auth/send-verification-code', { email, telephone });
export const changePasswordWithCode = ({ telephone, code, nouveauMotDePasse }) => api.post('/auth/change-password', { telephone, code, nouveauMotDePasse });
export const updateNotificationPreferences = (prefs) => api.post('/auth/notification-preferences', { notificationPreferences: prefs });
