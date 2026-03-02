import api from './api';

export const blogService = {
    getAll: (params = {}) => api.get('/blog', { params }).then(r => r.data),
    getById: (id) => api.get(`/blog/${id}`).then(r => r.data),
    getBySlug: (slug) => api.get(`/blog/${slug}`).then(r => r.data),
    getFeatured: () => api.get('/blog/featured').then(r => r.data),
    getRecent: (limit = 10) => api.get('/blog/recent', { params: { limit } }).then(r => r.data),
    create: (data) => api.post('/blog', data).then(r => r.data),
    update: (id, data) => api.put(`/blog/${id}`, data).then(r => r.data),
    delete: (id) => api.delete(`/blog/${id}`).then(r => r.data),
    like: (id) => api.post(`/blog/${id}/like`).then(r => r.data),
};