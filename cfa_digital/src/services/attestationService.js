import api from './api';

export const getAttestationStatus = (etudiantId, target = 'attestation') => {
  return api.get(`/attestations/${etudiantId}?target=${encodeURIComponent(target)}`);
};

export const postAdminDecision = (etudiantId, payload) => {
  return api.post(`/attestations/${etudiantId}/decision`, payload);
};
