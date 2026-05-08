import api from './index'

// 用户端
export const getQuestion = (exclude = '') => api.get(`/quiz.php?action=question&exclude=${exclude}`)
export const submitAnswer = (data) => api.post('/quiz.php?action=answer', data)
export const submitScore = (data) => api.post('/quiz.php?action=score', data)
export const getLeaderboard = () => api.get('/quiz.php?action=leaderboard')
export const getMyScore = () => api.get('/quiz.php?action=myscore')

// 管理端
export const getQuestions = () => api.get('/quiz.php?action=list')
export const createQuestion = (data) => api.post('/quiz.php?action=create', data)
export const updateQuestion = (data) => api.post('/quiz.php?action=update', data)
export const deleteQuestion = (id) => api.get(`/quiz.php?action=delete&id=${id}`)
export const getAdminLeaderboard = () => api.get('/quiz.php?action=adminLeaderboard')
export const deleteScore = (id) => api.get(`/quiz.php?action=deleteScore&id=${id}`)
