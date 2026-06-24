import api from './api';

export const getMessages = (params) => api.get('/messages', { params });
export const sendMessage = (payload) => api.post('/messages', payload);
export const markMessageRead = (messageId) => api.patch(`/messages/${messageId}/read`);
export const archiveMessage = (messageId) => api.patch(`/messages/${messageId}/archive`);
