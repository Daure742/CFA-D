import api from './api';

export const getMesNotes = () => api.get('/notes/mes-notes');
export const getMesBulletins = () => api.get('/notes/mes-bulletins');
export const upsertNote = (payload) => api.post('/notes', payload);
