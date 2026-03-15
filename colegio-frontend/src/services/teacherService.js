import api from './api';

export const teacherService = {
    getAll: (jornada) => api.get('/teachers', { params: jornada ? { jornada } : {} }),
    getAllAdmin: () => api.get('/teachers/admin'),
    create: (formData) => api.post('/teachers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    update: (id, formData) => api.put(`/teachers/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    delete: (id) => api.delete(`/teachers/${id}`),
};
