import api from './api';

export const periodService = {
    getAll: () => api.get('/periods').then(r => r.data),
    getActive: () => api.get('/periods/active').then(r => r.data),
    create: (data) => api.post('/periods', data).then(r => r.data),
    update: (id, data) => api.put(`/periods/${id}`, data).then(r => r.data),
    activate: (id) => api.patch(`/periods/${id}/activate`).then(r => r.data),
    delete: (id) => api.delete(`/periods/${id}`).then(r => r.data),
};
