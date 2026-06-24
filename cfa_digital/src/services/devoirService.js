import api from './api';

export const getMesDevoirs = () => api.get('/devoirs/mes-devoirs');
export const createDevoir = (data) => api.post('/devoirs', data);
export const rendreDevoir = (devoirId, data) => api.post(`/devoirs/rendre/${devoirId}`, data);
export const corrigerDevoir = (renduId, data) => api.put(`/devoirs/corriger/${renduId}`, data);
export const getFormateurDevoirs = () => api.get('/devoirs/formateur');
