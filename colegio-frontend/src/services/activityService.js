import api from './api';

export const activityService = {
    getAll: (params) => api.get('/activities', { params }).then(r => r.data),
    getThisWeek: (grade) => api.get('/activities/this-week', { params: grade !== undefined ? { grade } : {} }).then(r => r.data),
    getTypes: () => api.get('/activities/types').then(r => r.data),
    getById: (id) => api.get(`/activities/${id}`).then(r => r.data),
    create: (data) => api.post('/activities', data).then(r => r.data),
    update: (id, data) => api.put(`/activities/${id}`, data).then(r => r.data),
    delete: (id) => api.delete(`/activities/${id}`).then(r => r.data),

    // Fuentes RSS
    getSources: () => api.get('/activities/sources').then(r => r.data),
    createSource: (data) => api.post('/activities/sources', data).then(r => r.data),
    updateSource: (id, data) => api.put(`/activities/sources/${id}`, data).then(r => r.data),
    deleteSource: (id) => api.delete(`/activities/sources/${id}`).then(r => r.data),
    triggerFetch: () => api.post('/activities/fetch').then(r => r.data),
};
