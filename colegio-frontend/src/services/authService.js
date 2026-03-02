import api from './api';

export const authService = {
    login: (email, password) => api.post('/auth/login', { email, password }).then(r => r.data),
    getMe: () => api.get('/auth/me').then(r => r.data),
    updateProfile: (data) => api.put('/auth/profile', data).then(r => r.data),
    changePassword: (data) => api.put('/auth/change-password', data).then(r => r.data),
    verify: () => api.get('/auth/verify').then(r => r.data),
};