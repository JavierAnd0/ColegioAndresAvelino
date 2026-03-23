import api from './api';

export const heroService = {
    get:    ()       => api.get('/hero').then(r => r.data),
    update: (image)  => api.put('/hero', { image }).then(r => r.data),
};
