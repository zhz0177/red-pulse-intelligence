import api from './index'

/** 用户端：关卡列表 */
export const getChoiceList = () => api.get('/choice.php?action=list')

/** 用户端：单关剧情 id 或 martyr_id 二选一 */
export const getChoiceStory = (params = {}) => {
  const q = new URLSearchParams()
  if (params.id) q.set('id', params.id)
  if (params.martyr_id) q.set('martyr_id', params.martyr_id)
  return api.get(`/choice.php?action=story&${q.toString()}`)
}

/** 用户端：提交抉择 { story_id, answers: ['A','B'], reason?: string } */
export const submitChoice = (data) => api.post('/choice.php?action=choose', data)

/** 用户端：我的记录 */
export const getMyChoices = () => api.get('/choice.php?action=my')

/** 管理端：全部反馈记录 */
export const getChoiceRecords = (params = {}) => {
  const q = new URLSearchParams()
  if (params.username) q.set('username', params.username)
  if (params.martyr_id) q.set('martyr_id', params.martyr_id)
  if (params.story_id) q.set('story_id', params.story_id)
  if (params.all_correct !== undefined && params.all_correct !== '') q.set('all_correct', String(params.all_correct))
  if (params.from) q.set('from', params.from)
  if (params.to) q.set('to', params.to)
  const qs = q.toString()
  return api.get(`/choice.php?action=records${qs ? `&${qs}` : ''}`)
}

