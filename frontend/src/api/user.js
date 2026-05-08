import api from './index'

export const login = (data) => api.post('/auth.php?action=login', data)
export const register = (data) => api.post('/auth.php?action=register', data)
export const getUserInfo = () => api.get('/auth.php?action=info')
export const changePassword = (data) => api.post('/auth.php?action=changePassword', data)
export const updateProfile = (data) => api.post('/auth.php?action=updateProfile', data)
export const getMySubmissions = () => api.get('/submissions.php?action=my')
export const getMyProjects = () => api.get('/projects.php?action=myProjects')
