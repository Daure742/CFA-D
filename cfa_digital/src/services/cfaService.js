import api from './api';

export const searchCfas = (q) => api.get('/cfas', { params: { q } });
export const getCfaById = (id) => api.get(`/cfas/${id}`);
export const getAnnuaire = () => api.get('/cfas/annuaire');
