import api from './api';

export const heroSlidesService = {
    getAll:   ()         => api.get('/hero-slides').then(r => r.data),
    getAdmin: ()         => api.get('/hero-slides/all').then(r => r.data),
    create:   (data)     => api.post('/hero-slides', data).then(r => r.data),
    update:   (id, data) => api.put(`/hero-slides/${id}`, data).then(r => r.data),
    delete:   (id)       => api.delete(`/hero-slides/${id}`).then(r => r.data),
    reorder:  (ids)      => api.put('/hero-slides/reorder', { ids }).then(r => r.data),
};
