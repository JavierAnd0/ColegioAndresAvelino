import api from './api';

export const honorService = {
    getBoard: (year, month) => api.get(`/honor/board/${year}/${month}`).then(r => r.data),
    getAvailableMonths: () => api.get('/honor/months').then(r => r.data),
    create: (data) => api.post('/honor', data).then(r => r.data),
    update: (id, data) => api.put(`/honor/${id}`, data).then(r => r.data),
    delete: (id) => api.delete(`/honor/${id}`).then(r => r.data),
    uploadPhoto: (formData) => api.post('/upload/honor', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),
};

export const gradeService = {
    getAll: () => api.get('/grades').then(r => r.data),
    create: (data) => api.post('/grades', data).then(r => r.data),
    update: (id, data) => api.put(`/grades/${id}`, data).then(r => r.data),
    delete: (id) => api.delete(`/grades/${id}`).then(r => r.data),
    seed: () => api.post('/grades/seed').then(r => r.data),
};
