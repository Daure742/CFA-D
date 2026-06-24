import api from './api';

export const getDashboard = () => api.get('/etudiant/dashboard');
export const getAgenda = (debut, fin) => api.get('/etudiant/agenda', { params: { debut, fin } });
export const getEmploiDuTemps = () => api.get('/etudiant/emploi-du-temps');
