import api from './api';

export const authService = {
    // Autenticación
    login: (email, password) => api.post('/auth/login', { email, password }).then(r => r.data),
    verify: () => api.get('/auth/verify').then(r => r.data),

    // Perfil propio
    getMe: () => api.get('/auth/me').then(r => r.data),
    updateProfile: (data) => api.put('/auth/profile', data).then(r => r.data),
    changePassword: (data) => api.put('/auth/change-password', data).then(r => r.data),

    // Recuperación de contraseña
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then(r => r.data),
    resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }).then(r => r.data),

    // Gestión de usuarios (admin/superadmin)
    getUsers: () => api.get('/auth/users').then(r => r.data),
    getUserById: (id) => api.get(`/auth/users/${id}`).then(r => r.data),
    createUser: (data) => api.post('/auth/register', data).then(r => r.data),
    updateUser: (id, data) => api.put(`/auth/users/${id}`, data).then(r => r.data),
    deleteUser: (id) => api.delete(`/auth/users/${id}`).then(r => r.data),
    adminResetPassword: (id, newPassword) => api.put(`/auth/users/${id}/reset-password`, { newPassword }).then(r => r.data),
};