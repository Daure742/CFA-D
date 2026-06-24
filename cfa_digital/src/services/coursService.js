import api from './api';

export const getCoursByCohorte = (cohorteId) => api.get(`/cours/cohorte/${cohorteId}`);
export const emarger = (coursId) => api.post(`/cours/emarger/${coursId}`);
export const lancerCours = (coursId) => api.post(`/cours/lancer/${coursId}`);
export const terminerCours = (coursId, payload = {}) => api.post(`/cours/terminer/${coursId}`, payload);
export const validerEmargement = (coursId) => api.post(`/cours/valider-emargement/${coursId}`);
export const publishReplay = (coursId, replayUrl) => api.patch(`/cours/publish-replay/${coursId}`, { replayUrl });
