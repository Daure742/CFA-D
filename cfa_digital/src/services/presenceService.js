import api from './api';

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const getPresences = () => api.get('/presences');
export const getPresencesCours = (coursId) => api.get(`/presences/cours/${coursId}`);

export const downloadFeuillePresence = async (coursId) => {
  const { data } = await api.get(`/presences/cours/${coursId}/feuille.pdf`, { responseType: 'blob' });
  downloadBlob(data, `feuille-presence-${coursId}.pdf`);
};

export const downloadAttestationPresence = async (presenceId) => {
  const { data } = await api.get(`/presences/${presenceId}/attestation.pdf`, { responseType: 'blob' });
  downloadBlob(data, `attestation-presence-${presenceId}.pdf`);
};

export const updatePresence = (presenceId, payload) => api.patch(`/presences/${presenceId}`, payload);
