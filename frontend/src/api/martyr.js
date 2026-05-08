import api from './index'

export const getMartyrs = () => api.get('/martyrs.php')
export const getMartyr = (id) => api.get(`/martyrs.php?id=${id}`)
export const getFeaturedMartyrs = () => api.get('/martyrs.php?action=featured')
export const getLetter = (martyrId) => api.get(`/letters.php?martyr_id=${martyrId}`)
export const getReplies = (letterId) => api.get(`/letters.php?action=replies&letter_id=${letterId}`)
export const replyLetter = (letterId, content) => api.post('/letters.php?action=reply', { letter_id: letterId, content })
