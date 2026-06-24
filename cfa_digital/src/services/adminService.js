import api from './api';

export const getAdminSessions = (params) => api.get('/admin/sessions', { params });
export const createAdminSession = (payload) => api.post('/admin/sessions', payload);
export const updateAdminSession = (sessionId, payload) => api.patch(`/admin/sessions/${sessionId}`, payload);
export const deleteAdminSession = (sessionId) => api.delete(`/admin/sessions/${sessionId}`);
export const archiveAdminSession = (sessionId) => api.patch(`/admin/sessions/${sessionId}/archive`);
export const restoreAdminSession = (sessionId) => api.patch(`/admin/sessions/${sessionId}/restore`);
export const getAdminFormateurs = (params) => api.get('/admin/formateurs', { params });
export const createAdminFormateur = (payload) => api.post('/admin/formateurs', payload);
export const toggleAdminFormateurConge = (id, isOnLeave) => api.patch(`/admin/formateurs/${id}/conge`, { isOnLeave });
export const resetAdminFormateurPassword = (id, motDePasse) => api.post(`/admin/formateurs/${id}/reset-password`, motDePasse ? { motDePasse } : {});
export const deleteAdminFormateur = (id) => api.delete(`/admin/formateurs/${id}`);
export const getAdminPlanning = (sessionId) => api.get('/admin/planning', { params: { sessionId } });
export const createAdminCours = (payload) => api.post('/admin/planning', payload);
export const updateAdminCours = (coursId, payload) => api.patch(`/admin/planning/${coursId}`, payload);
export const publierPlanningSession = (sessionId) => api.post(`/admin/planning/publier/${sessionId}`);
export const publierPlanningTo = (sourceSessionId, targetSessionIds) => api.post('/admin/planning/publier-to', { sourceSessionId, targetSessionIds });
// Cohorte waitlist management
export const getCohorteWaitlist = (cohorteId) => api.get(`/cohortes/${cohorteId}/waitlist`);
export const removeCohorteWaitlistEntry = (cohorteId, entryId) => api.delete(`/cohortes/${cohorteId}/waitlist/${entryId}`);
export const promoteCohorteWaitlistEntry = (cohorteId, entryId) => api.post(`/cohortes/${cohorteId}/waitlist/${entryId}/promote`);
export const getUsers = (params) => api.get('/admin/users', { params });
export const getUsersSummary = (params) => api.get('/admin/users/summary', { params });
export const blockUser = (userId) => api.patch(`/admin/users/${userId}/block`);
export const unblockUser = (userId) => api.patch(`/admin/users/${userId}/unblock`);
export const deleteUser = (userId) => api.delete(`/admin/users/${userId}`);
export const getAdminCandidatures = (params) => api.get('/admin/candidatures', { params });
export const getAdminCandidaturesSummary = (params) => api.get('/admin/candidatures/summary', { params });
