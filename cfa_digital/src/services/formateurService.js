import api from './api';

export const getFormateurDashboard = () => api.get('/formateur/dashboard');
export const getCohortes = () => api.get('/formateur/cohortes');
export const getFormateurCours = () => api.get('/formateur/cours');
export const updateFormateurProfile = (payload) => api.patch('/formateur/profile', payload);
