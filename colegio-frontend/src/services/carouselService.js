import api from './api';

export const carouselService = {
    getAll:    ()         => api.get('/carousel').then(r => r.data),
    getAdmin:  ()         => api.get('/carousel/all').then(r => r.data),
    create:    (data)     => api.post('/carousel', data).then(r => r.data),
    update:    (id, data) => api.put(`/carousel/${id}`, data).then(r => r.data),
    delete:    (id)       => api.delete(`/carousel/${id}`).then(r => r.data),
    reorder:   (ids)      => api.put('/carousel/reorder', { ids }).then(r => r.data),
};
