import axios from 'axios';

export const getAttestationStatus = (etudiantId, target = 'attestation') => {
  return axios.get(`/api/attestations/${etudiantId}?target=${encodeURIComponent(target)}`);
};

export const postAdminDecision = (etudiantId, payload) => {
  return axios.post(`/api/attestations/${etudiantId}/decision`, payload);
};
