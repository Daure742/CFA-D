import api from './api';

export const createSchedule = async (payload) => {
  const { data } = await api.post('/schedules', payload);
  return data;
};

export const getLatestSchedule = async (cohorteId) => {
  const { data } = await api.get(`/schedules/latest/${cohorteId}`);
  return data;
};

export const getScheduleByWeek = async (cohorteId, weekStart) => {
  const params = weekStart ? { weekStart } : {};
  const { data } = await api.get(`/schedules/week/${cohorteId}`, { params });
  return data;
};

export default { createSchedule, getLatestSchedule, getScheduleByWeek };
