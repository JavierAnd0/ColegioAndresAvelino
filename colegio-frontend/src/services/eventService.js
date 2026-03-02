import api from './api';

export const eventService = {
    getAll: (params = {}) => api.get('/events', { params }).then(r => r.data),
    getById: (id) => api.get(`/events/${id}`).then(r => r.data),
    getUpcoming: () => api.get('/events/upcoming').then(r => r.data),
    getByMonth: (year, month) => api.get(`/events/month/${year}/${month}`).then(r => r.data),
    getByCategory: (category) => api.get(`/events/category/${category}`).then(r => r.data),
    create: (data) => api.post('/events', data).then(r => r.data),
    update: (id, data) => api.put(`/events/${id}`, data).then(r => r.data),
    delete: (id) => api.delete(`/events/${id}`).then(r => r.data),
};