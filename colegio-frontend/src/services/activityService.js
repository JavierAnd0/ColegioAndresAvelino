import api from './api';

export const activityService = {
    getAll: (params) => api.get('/activities', { params }).then(r => r.data),
    getThisWeek: (grade) => api.get('/activities/this-week', { params: grade !== undefined ? { grade } : {} }).then(r => r.data),
    getTypes: () => api.get('/activities/types').then(r => r.data),
    getById: (id) => api.get(`/activities/${id}`).then(r => r.data),
    create: (data) => api.post('/activities', data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }).then(r => r.data),
    update: (id, data) => api.put(`/activities/${id}`, data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }).then(r => r.data),
    delete: (id) => api.delete(`/activities/${id}`).then(r => r.data),
    approve: (id) => api.put(`/activities/${id}/approve`).then(r => r.data),
    reject: (id) => api.put(`/activities/${id}/reject`).then(r => r.data),
    getPending: (params) => api.get('/activities/pending', { params }).then(r => r.data),

    // Fuentes RSS
    getSources: () => api.get('/activities/sources').then(r => r.data),
    validateSource: (url) => api.post('/activities/sources/validate', { url }).then(r => r.data),
    createSource: (data) => api.post('/activities/sources', data).then(r => r.data),
    updateSource: (id, data) => api.put(`/activities/sources/${id}`, data).then(r => r.data),
    deleteSource: (id) => api.delete(`/activities/sources/${id}`).then(r => r.data),
    triggerFetch: () => api.post('/activities/fetch').then(r => r.data),
    bulkCreate: (activities) => api.post('/activities/bulk', { activities }).then(r => r.data),
    suggestImages: (params) => api.get('/blog/suggest-images', { params }).then(r => r.data),
};
