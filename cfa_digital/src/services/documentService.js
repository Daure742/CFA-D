import api from './api';

export const getMesDocuments = () => api.get('/documents/mes-documents');
export const getCoursDocuments = (cohorteId) => api.get(`/documents/cours-documents/${cohorteId}`);
export const shareDocument = (formData) => api.post('/documents', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
