import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// 思政成长馆（本地 localStorage 闭环版）
// 说明：
// 1) 所有积分、成长档案、辩论/解忧记录均落地到 localStorage
// 2) “AI + 人工审核”在本地用“关键词过滤（AI）+ admin 发布/审核（人工）”模拟
// 3) 点赞/评论为“合规互动 +2”，并有“每日上限 10 分”

const KEY = {
  issues: 'ideology-issues-v1',
  speeches: 'ideology-speeches-v1',
  speechLikes: 'ideology-speech-likes-v1',
  speechFavorites: 'ideology-speech-favorites-v1',
  speechComments: 'ideology-speech-comments-v1',

  reliefs: 'ideology-reliefs-v1',
  reliefLikes: 'ideology-relief-likes-v1',
  reliefComments: 'ideology-relief-comments-v1',
  reliefReflections: 'ideology-relief-reflections-v1',
  reliefOaths: 'ideology-relief-oaths-v1',

  growthEvents: 'ideology-growth-events-v1',
  awardFlags: 'ideology-award-flags-v1',
  dailyLikePoints: 'ideology-daily-like-points-v1',
  archiveCompleteFlags: 'ideology-archive-complete-v1',
  seedDone: 'ideology-seed-done-v1',
}

const LEVELS = [
  { key: '初心学徒', minPoints: 0, icon: '🎓', rights: ['电子成长卡（已解锁）', '基础研学资格（预约制）'] },
  { key: '笃行少年', minPoints: 200, icon: '📚', rights: ['电子证书（可下载）', '线上研学资格（优先）'] },
  { key: '先锋志士', minPoints: 450, icon: '🛠️', rights: ['荣誉勋章（精神权益）', '专题研学活动名额'] },
  { key: '精神传承者', minPoints: 750, icon: '🧭', rights: ['成长报告高级版（可下载）', '顾问团点评权益'] },
  { key: '时代新青年', minPoints: 1100, icon: '🏅', rights: ['精神传承者认证（可下载）', '年度荣誉纪念（精神权益）'] },
]

const BANNED_WORDS = [
  '投敌', '叛变', '卖国', '出卖', '暴恐', '自杀', '仇恨', '伤害', '炸', '毒品', '血腥',
]

function safeParse(json, fallback) {
  try {
    return JSON.parse(json) ?? fallback
  } catch {
    return fallback
  }
}

function lenCN(s) {
  if (!s) return 0
  // 粗略按“字符数”统计（中英文混合也能用）
  return [...String(s)].length
}

function uid(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function todayKey() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function getCurrentUser() {
  return safeParse(localStorage.getItem('user') || '{}', {}) || {}
}

function getUserId() {
  const u = getCurrentUser()
  // 后端用户结构通常有 id/username/role；无则用 username
  return u.id ?? u.username ?? 'anonymous'
}

function isAdmin() {
  const u = getCurrentUser()
  return u.role === 'admin'
}

function loadArr(key) {
  return safeParse(localStorage.getItem(key) || '[]', [])
}

function loadObj(key, fallback = {}) {
  return safeParse(localStorage.getItem(key) || 'null', fallback) || fallback
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function aiModerate(text) {
  const t = String(text || '').trim()
  if (!t) return { ok: false, reason: '内容不能为空' }
  for (const w of BANNED_WORDS) {
    if (t.includes(w)) return { ok: false, reason: `内容含敏感/违规词：${w}` }
  }
  // 额外简单过滤：太短通常不符合思辨要求
  if (lenCN(t) < 30) return { ok: false, reason: '内容过短，请给出更充分的思辨表达' }
  return { ok: true }
}

const MATERIALS = [
  { id: 'm1', martyr: '赵一曼', spirit: '坚守信仰，以沉默守护原则', egg: '在残酷审讯下仍不泄露机密，把“为国守义”写成生命的答卷。' },
  { id: 'm2', martyr: '杨靖宇', spirit: '忠诚抗战，极端困境中不屈', egg: '草根、树皮与棉絮成了他的“最后粮”。越是绝境，越要坚守。' },
  { id: 'm3', martyr: '刘胡兰', spirit: '从容就义，让信念成为行动', egg: '面对铡刀仍拒绝自白，用“怕死不当共产党”回答恐惧。' },
  { id: 'm4', martyr: '黄继光', spirit: '以身为盾，把责任交给行动', egg: '火力点前的胸膛，是青年担当最直观的表达。' },
  { id: 'm5', martyr: '邱少云', spirit: '纪律为魂，宁可沉默也不暴露', egg: '烈火焚身仍守纪律，让“集体胜利”优先于个人安危。' },
  { id: 'm6', martyr: '董存瑞', spirit: '关键时刻，敢于把困难托起', egg: '炸毁桥头暗堡不是冲动，是把胜利的希望撑起来。' },
  { id: 'm7', martyr: '左权', spirit: '守住指挥，更守住群众的安全', egg: '在突围里仍以使命统筹全局，把人民放在第一位。' },
  { id: 'm8', martyr: '江竹筠', spirit: '以坚贞回应压力，以沉默守护组织', egg: '酷刑逼供挡不住信仰，竹签之下仍守口如瓶。' },
]

const RELIEF_TEMPLATES = {
  学业: { spirit: '自律与坚韧', martyr: '张思德', action: ['把“当下的任务”拆成可完成的步骤', '用复盘减少焦虑，把努力落到细节'] },
  就业: { spirit: '脚踏实地与担当', martyr: '黄继光', action: ['遇到选择先问：是否对人民有益', '把能力建设做成长期行动计划'] },
  人际: { spirit: '同理与边界', martyr: '向警予', action: ['先理解对方诉求，再表达自己的立场', '在尊重中坚持原则，形成良性沟通'] },
  奋斗倦怠: { spirit: '把热情转为节律', martyr: '刘胡兰', action: ['寻找“为什么”并写下来贴在桌前', '把目标变成每周可度量的小里程碑'] },
  理想: { spirit: '信念的延续与自我校准', martyr: '瞿秋白', action: ['用行动校准理想：今天做什么', '在挫折中回到价值坐标'] },
  社会认知偏差: { spirit: '理性思辨与事实尊重', martyr: '方志敏', action: ['对信息来源进行核验再形成判断', '在差异中坚持原则，用证据支持表达'] },
}

function ensureSeed() {
  const done = localStorage.getItem(KEY.seedDone)
  if (done === '1') return

  const now = Date.now()
  const defaultDurationDays = 5
  const makeIssue = (idx, category, title, materialId, positive, negative, durationDays = defaultDurationDays) => {
    const m = MATERIALS.find(x => x.id === materialId) || MATERIALS[0]
    const startAt = now - idx * 24 * 3600 * 1000
    const endAt = startAt + durationDays * 24 * 3600 * 1000
    return {
      id: uid('issue'),
      title,
      category,
      materialId: m.id,
      sides: { positive, negative },
      durationDays,
      startAt,
      endAt,
      status: endAt <= now ? 'closed' : 'published',
      teacher: {
        expertName: '专家顾问（示例）',
        summary: '',
        remark: '',
      },
      createdAt: now,
    }
  }

  // 三类议题：红色精神思辨 / 青年成长抉择 / 时代责任担当
  const issuesSeed = [
    makeIssue(
      0,
      '红色精神思辨类',
      '面对压力：沉默与坚持，哪个更重要？',
      'm1',
      '正方：关键时刻必须守住原则与底线',
      '反方：可先求自保再寻找转机'
    ),
    makeIssue(
      1,
      '青年成长抉择类',
      '成长中的“倦怠”：是停下来充电还是坚持到底？',
      'm3',
      '正方：当把信念变成行动时，倦怠会被穿透',
      '反方：倦怠时应先调整节奏再继续'
    ),
    makeIssue(
      2,
      '时代责任担当类',
      '时代需要怎样的青年担当？先赢还是先做对？',
      'm6',
      '正方：担当体现在“把难题托起来”的行动',
      '反方：先把路径规划好，行动应更谨慎'
    ),
  ]

  save(KEY.issues, issuesSeed)
  save(KEY.speeches, [])
  save(KEY.speechLikes, [])
  save(KEY.speechFavorites, [])
  save(KEY.speechComments, [])
  save(KEY.reliefs, [])
  save(KEY.reliefLikes, [])
  save(KEY.reliefComments, [])
  save(KEY.reliefReflections, [])
  save(KEY.reliefOaths, [])
  save(KEY.growthEvents, [])
  save(KEY.awardFlags, {})
  save(KEY.dailyLikePoints, {})
  save(KEY.archiveCompleteFlags, {})
  localStorage.setItem(KEY.seedDone, '1')
}

export const useIdeologyStore = defineStore('ideology', () => {
  // 先建种子，再加载本地数据，避免出现“ref 初始值读到了旧空值”
  ensureSeed()

  const issues = ref(loadArr(KEY.issues))
  const speeches = ref(loadArr(KEY.speeches))
  const speechLikes = ref(loadArr(KEY.speechLikes))
  const speechFavorites = ref(loadArr(KEY.speechFavorites))
  const speechComments = ref(loadArr(KEY.speechComments))

  const reliefs = ref(loadArr(KEY.reliefs))
  const reliefLikes = ref(loadArr(KEY.reliefLikes))
  const reliefComments = ref(loadArr(KEY.reliefComments))
  const reliefReflections = ref(loadArr(KEY.reliefReflections))
  const reliefOaths = ref(loadArr(KEY.reliefOaths))

  const growthEvents = ref(loadArr(KEY.growthEvents))
  const awardFlags = ref(loadObj(KEY.awardFlags, {}))
  const dailyLikePoints = ref(loadObj(KEY.dailyLikePoints, {}))
  const archiveCompleteFlags = ref(loadObj(KEY.archiveCompleteFlags, {}))

  const curUser = computed(() => getCurrentUser())
  const curUserId = computed(() => getUserId())
  const admin = computed(() => isAdmin())

  const myEvents = computed(() => {
    const uid0 = curUserId.value
    return growthEvents.value
      .filter(e => String(e.userId) === String(uid0))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  })

  const myPoints = computed(() => myEvents.value.reduce((sum, e) => sum + (Number(e.points) || 0), 0))

  const myLevel = computed(() => {
    const p = myPoints.value
    // 找到最后一个 minPoints <= p
    let lv = LEVELS[0]
    for (const x of LEVELS) {
      if (p >= x.minPoints) lv = x
    }
    return lv
  })

  function persistAll() {
    save(KEY.issues, issues.value)
    save(KEY.speeches, speeches.value)
    save(KEY.speechLikes, speechLikes.value)
    save(KEY.speechFavorites, speechFavorites.value)
    save(KEY.speechComments, speechComments.value)
    save(KEY.reliefs, reliefs.value)
    save(KEY.reliefLikes, reliefLikes.value)
    save(KEY.reliefComments, reliefComments.value)
    save(KEY.reliefReflections, reliefReflections.value)
    save(KEY.reliefOaths, reliefOaths.value)
    save(KEY.growthEvents, growthEvents.value)
    save(KEY.awardFlags, awardFlags.value)
    save(KEY.dailyLikePoints, dailyLikePoints.value)
    save(KEY.archiveCompleteFlags, archiveCompleteFlags.value)
  }

  function award({ eventId, type, points, meta }) {
    if (!eventId) return
    if (awardFlags.value[eventId]) return
    awardFlags.value[eventId] = true
    growthEvents.value.push({
      id: uid('evt'),
      eventId,
      userId: curUserId.value,
      type,
      points: Number(points) || 0,
      meta: meta || {},
      createdAt: Date.now(),
    })
  }

  // 每日点赞评论上限：10 分（即最多触发 5 次 +2）
  function canAddInteractionPoints() {
    const u = curUserId.value
    const dKey = todayKey()
    const key = `${u}_${dKey}`
    const used = Number(dailyLikePoints.value[key] || 0)
    return used < 10
  }

  function addInteractionPointsIfAllowed({ eventId }) {
    if (!canAddInteractionPoints()) return { added: false, reason: '今日互动积分已达上限' }
    // eventId 防重复
    if (awardFlags.value[eventId]) return { added: false, reason: '已奖励' }
    const points = 2
    award({ eventId, type: 'interaction_like_comment', points, meta: {} })
    const u = curUserId.value
    const dKey = todayKey()
    const key = `${u}_${dKey}`
    dailyLikePoints.value[key] = Number(dailyLikePoints.value[key] || 0) + points
    return { added: true }
  }

  // ========== 模块 1：思政辩论 ==========
  function getMaterialById(mid) {
    return MATERIALS.find(m => m.id === mid) || MATERIALS[0]
  }

  function listActiveIssues() {
    const now = Date.now()
    let changed = false
    for (let i = 0; i < issues.value.length; i++) {
      const it = issues.value[i]
      if (it.status === 'published' && it.endAt <= now) {
        issues.value[i] = { ...it, status: 'closed' }
        changed = true
      }
    }
    if (changed) persistAll()

    return issues.value
      .map(i => ({ ...i }))
      .sort((a, b) => (b.startAt || 0) - (a.startAt || 0))
  }

  function submitSpeech({ issueId, side, content }) {
    const issue = issues.value.find(i => String(i.id) === String(issueId))
    if (!issue) throw new Error('议题不存在')
    if (issue.status !== 'published' || issue.endAt <= Date.now()) throw new Error('该议题尚未开放发言或已结束')
    const c = String(content || '').trim()
    if (lenCN(c) < 200 || lenCN(c) > 500) throw new Error('发言字数需在 200-500 字之间')
    if (!['positive', 'negative'].includes(side)) throw new Error('请选择正反方')

    const userId = curUserId.value
    if (userId === 'anonymous') throw new Error('请先登录')

    const myCount = speeches.value.filter(s => String(s.issueId) === String(issueId) && String(s.userId) === String(userId) && s.humanStatus !== 'rejected').length
    if (myCount >= 2) throw new Error('每期限发言 1-2 次：你已达到上限')

    const mod = aiModerate(c)
    const speech = {
      id: uid('sp'),
      issueId: issue.id,
      userId,
      username: curUser.value?.username || '',
      side,
      content: c,
      aiStatus: mod.ok ? 'pass' : 'fail',
      humanStatus: mod.ok ? 'pending' : 'rejected',
      aiReason: mod.ok ? '' : mod.reason,
      quality: false,
      likes: 0,
      createdAt: Date.now(),
    }
    speeches.value.unshift(speech)
    persistAll()
    if (!mod.ok) throw new Error(mod.reason || 'AI 审核未通过')
  }

  function adminAuditSpeech({ speechId, action, setQuality }) {
    if (!admin.value) throw new Error('无权限')
    const idx = speeches.value.findIndex(s => String(s.id) === String(speechId))
    if (idx < 0) throw new Error('发言不存在')
    const s = speeches.value[idx]

    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    speeches.value[idx] = { ...s, humanStatus: newStatus, aiStatus: s.aiStatus, quality: Boolean(setQuality) }
    persistAll()

    if (newStatus === 'approved') {
      award({ eventId: `speech_approved_${s.id}`, type: 'debate_speech_approved', points: 5, meta: { issueId: s.issueId } })
    }
    if (Boolean(setQuality)) {
      award({ eventId: `speech_quality_${s.id}`, type: 'debate_speech_quality', points: 15, meta: { issueId: s.issueId } })
    }
  }

  function toggleSpeechLike({ speechId }) {
    const s = speeches.value.find(x => String(x.id) === String(speechId))
    if (!s) throw new Error('发言不存在')
    if (s.humanStatus !== 'approved') throw new Error('暂时无法互动：该发言未通过审核')
    if (curUserId.value === 'anonymous') throw new Error('请先登录')

    const uId = curUserId.value
    const likeKey = `${s.id}_${uId}`
    const existing = speechLikes.value.find(x => x.key === likeKey)
    if (existing) {
      // 取消点赞：不回滚积分
      speechLikes.value = speechLikes.value.filter(x => x.key !== likeKey)
      const idx = speeches.value.findIndex(x => x.id === s.id)
      if (idx >= 0) speeches.value[idx].likes = Math.max(0, Number(speeches.value[idx].likes || 0) - 1)
      persistAll()
      return
    }

    // 点赞：+2（每日上限 10）
    const res = addInteractionPointsIfAllowed({ eventId: `like_${likeKey}` })
    speechLikes.value.unshift({ key: likeKey, speechId: s.id, userId: uId })
    const idx = speeches.value.findIndex(x => x.id === s.id)
    if (idx >= 0) speeches.value[idx].likes = Number(speeches.value[idx].likes || 0) + 1
    persistAll()
    if (!res.added) {
      // 仍允许点赞，但不再给积分
      return
    }
  }

  function toggleSpeechFavorite({ speechId }) {
    const s = speeches.value.find(x => String(x.id) === String(speechId))
    if (!s) throw new Error('发言不存在')
    if (curUserId.value === 'anonymous') throw new Error('请先登录')

    const uId = curUserId.value
    const key = `${s.id}_${uId}`
    const existing = speechFavorites.value.find(x => x.key === key)
    if (existing) {
      speechFavorites.value = speechFavorites.value.filter(x => x.key !== key)
      persistAll()
      return false
    }
    speechFavorites.value.unshift({ key, speechId: s.id, userId: uId })
    persistAll()
    return true
  }

  function submitSpeechComment({ speechId, text }) {
    const s = speeches.value.find(x => String(x.id) === String(speechId))
    if (!s) throw new Error('发言不存在')
    if (s.humanStatus !== 'approved') throw new Error('暂时无法评论')
    if (curUserId.value === 'anonymous') throw new Error('请先登录')
    const c = String(text || '').trim()
    if (lenCN(c) < 20 || lenCN(c) > 250) throw new Error('评论需在 20-250 字之间')

    const uId = curUserId.value
    const key = `cmt_${speechId}_${uId}_${todayKey()}_${Date.now()}`
    const res = addInteractionPointsIfAllowed({ eventId: key })

    speechComments.value.unshift({
      id: uid('c'),
      speechId: s.id,
      userId: uId,
      username: curUser.value?.username || '',
      content: c,
      createdAt: Date.now(),
      // 记录是否成功加分（展示用）
      awarded: Boolean(res.added),
    })
    persistAll()
  }

  function adminCloseIssue({ issueId, teacherSummary, expertName, remark }) {
    if (!admin.value) throw new Error('无权限')
    const idx = issues.value.findIndex(i => String(i.id) === String(issueId))
    if (idx < 0) throw new Error('议题不存在')
    issues.value[idx] = {
      ...issues.value[idx],
      status: 'closed',
      endAt: Date.now(),
      teacher: {
        expertName: expertName || '专家顾问（人工）',
        summary: teacherSummary || '',
        remark: remark || '',
      },
    }
    persistAll()
  }

  function adminCreateIssue({ category, title, materialId, positive, negative, durationDays = 5 }) {
    if (!admin.value) throw new Error('无权限')
    const t = String(title || '').trim()
    if (lenCN(t) < 10) throw new Error('议题标题过短')
    const m = MATERIALS.find(x => x.id === materialId) ? materialId : MATERIALS[0].id
    const d = Math.max(3, Math.min(7, Number(durationDays) || 5))
    const startAt = Date.now()
    const endAt = startAt + d * 24 * 3600 * 1000
    const issue = {
      id: uid('issue'),
      category: category || '青年成长抉择类',
      title: t,
      materialId: m,
      sides: { positive: String(positive || ''), negative: String(negative || '') },
      durationDays: d,
      startAt,
      endAt,
      status: 'published',
      teacher: {
        expertName: '专家顾问（人工）',
        summary: '',
        remark: '',
      },
      createdAt: Date.now(),
    }
    issues.value.unshift(issue)
    persistAll()
  }

  /** 仅更新专家总结文案（不改变议题开关状态；用于已结束议题补写/修订总结） */
  function adminUpdateTeacher({ issueId, expertName, teacherSummary, remark }) {
    if (!admin.value) throw new Error('无权限')
    const idx = issues.value.findIndex(i => String(i.id) === String(issueId))
    if (idx < 0) throw new Error('议题不存在')
    const prev = issues.value[idx]
    issues.value[idx] = {
      ...prev,
      teacher: {
        expertName: expertName != null && String(expertName).trim() ? String(expertName).trim() : (prev.teacher?.expertName || '专家顾问（人工）'),
        summary: teacherSummary != null ? String(teacherSummary) : (prev.teacher?.summary ?? ''),
        remark: remark != null ? String(remark) : (prev.teacher?.remark ?? ''),
      },
    }
    persistAll()
  }

  /** 管理员编辑议题（正反方立论说明、素材、周期等；可重算结束时间） */
  function adminUpdateIssue({ issueId, category, title, materialId, positive, negative, durationDays }) {
    if (!admin.value) throw new Error('无权限')
    const idx = issues.value.findIndex(i => String(i.id) === String(issueId))
    if (idx < 0) throw new Error('议题不存在')
    const prev = issues.value[idx]
    const t = title != null ? String(title).trim() : prev.title
    if (lenCN(t) < 10) throw new Error('议题标题过短')
    const m = materialId != null && MATERIALS.find(x => x.id === materialId) ? materialId : prev.materialId
    const d = durationDays != null ? Math.max(3, Math.min(7, Number(durationDays) || prev.durationDays)) : prev.durationDays
    const startAt = prev.startAt
    let endAt = prev.endAt
    if (durationDays != null) {
      endAt = startAt + d * 24 * 3600 * 1000
    }
    issues.value[idx] = {
      ...prev,
      category: category != null ? String(category) : prev.category,
      title: t,
      materialId: m,
      sides: {
        positive: positive != null ? String(positive) : (prev.sides?.positive ?? ''),
        negative: negative != null ? String(negative) : (prev.sides?.negative ?? ''),
      },
      durationDays: d,
      endAt,
    }
    persistAll()
  }

  /** 删除议题及关联发言、评论、点赞/收藏（本地级联清理） */
  function adminDeleteIssue({ issueId }) {
    if (!admin.value) throw new Error('无权限')
    const id = String(issueId)
    const speechIds = new Set(speeches.value.filter(s => String(s.issueId) === id).map(s => s.id))
    issues.value = issues.value.filter(i => String(i.id) !== id)
    speeches.value = speeches.value.filter(s => String(s.issueId) !== id)
    speechComments.value = speechComments.value.filter(c => !speechIds.has(c.speechId))
    speechLikes.value = speechLikes.value.filter(x => !speechIds.has(x.speechId))
    speechFavorites.value = speechFavorites.value.filter(x => !speechIds.has(x.speechId))
    persistAll()
  }

  /** 手动开启/关闭议题：开启时若已过期则按周期顺延结束时间 */
  function adminSetIssueStatus({ issueId, status }) {
    if (!admin.value) throw new Error('无权限')
    if (!['published', 'closed'].includes(status)) throw new Error('状态仅支持 published / closed')
    const idx = issues.value.findIndex(i => String(i.id) === String(issueId))
    if (idx < 0) throw new Error('议题不存在')
    const prev = issues.value[idx]
    const now = Date.now()
    if (status === 'published') {
      const d = Math.max(3, Math.min(7, Number(prev.durationDays) || 5))
      let endAt = prev.endAt
      if (endAt <= now) endAt = now + d * 24 * 3600 * 1000
      issues.value[idx] = { ...prev, status: 'published', endAt }
    } else {
      issues.value[idx] = { ...prev, status: 'closed', endAt: Math.min(prev.endAt, now) }
    }
    persistAll()
  }

  function submitIssueSummary({ issueId, text }) {
    const issue = issues.value.find(i => String(i.id) === String(issueId))
    if (!issue) throw new Error('议题不存在')
    if (issue.status !== 'closed') throw new Error('该议题尚未结束，暂不开放思政小结')
    if (curUserId.value === 'anonymous') throw new Error('请先登录')

    const c = String(text || '').trim()
    if (lenCN(c) < 120 || lenCN(c) > 600) throw new Error('思政小结需在 120-600 字之间')

    const flagId = `issue_sum_${issueId}_${curUserId.value}`
    if (awardFlags.value[flagId]) throw new Error('你已完成该议题小结')

    award({ eventId: flagId, type: 'debate_issue_summary', points: 10, meta: { issueId } })
    persistAll()
  }

  // ========== 模块 3：红色精神解忧 ==========
  function getReliefTemplateByType(type) {
    return RELIEF_TEMPLATES[type] || RELIEF_TEMPLATES.学业
  }

  function submitRelief({ type, content, anonymousMode }) {
    const c = String(content || '').trim()
    if (lenCN(c) < 80 || lenCN(c) > 800) throw new Error('困惑描述需在 80-800 字之间')
    const t = String(type || '')
    if (!RELIEF_TEMPLATES[t]) throw new Error('困惑分类不正确')

    const userId = curUserId.value
    if (userId === 'anonymous') throw new Error('请先登录（可选择匿名提交）')

    const mod = aiModerate(c)
    const authorName = anonymousMode ? '' : (curUser.value?.username || '')
    const relief = {
      id: uid('rel'),
      type: t,
      userId,
      authorMode: anonymousMode ? 'anonymous' : 'real',
      authorName,
      content: c,
      aiStatus: mod.ok ? 'pass' : 'fail',
      humanStatus: mod.ok ? 'pending' : 'rejected',
      aiReason: mod.ok ? '' : mod.reason,
      decode: null,
      createdAt: Date.now(),
    }
    reliefs.value.unshift(relief)
    persistAll()
    if (!mod.ok) throw new Error(mod.reason || 'AI 审核未通过')
  }

  function adminPublishRelief({ reliefId, decode }) {
    if (!admin.value) throw new Error('无权限')
    const idx = reliefs.value.findIndex(r => String(r.id) === String(reliefId))
    if (idx < 0) throw new Error('解忧条目不存在')
    const tmpl = decode || null
    const base = getReliefTemplateByType(reliefs.value[idx].type)
    reliefs.value[idx] = {
      ...reliefs.value[idx],
      humanStatus: 'published',
      decode: {
        redSpirit: tmpl?.redSpirit || base.spirit,
        martyr: tmpl?.martyr || base.martyr,
        qualities: tmpl?.qualities || ['坚定', '理性', '自省', '担当'].slice(0, 3),
        actionAdvice: tmpl?.actionAdvice || base.action,
        expertName: tmpl?.expertName || '专业顾问（人工）',
      },
    }
    persistAll()
  }

  function toggleReliefLike({ reliefId }) {
    const r = reliefs.value.find(x => String(x.id) === String(reliefId))
    if (!r) throw new Error('解忧条目不存在')
    if (r.humanStatus !== 'published') throw new Error('暂时无法互动')
    if (curUserId.value === 'anonymous') throw new Error('请先登录')

    const uId = curUserId.value
    const key = `${reliefId}_${uId}`
    const existing = reliefLikes.value.find(x => x.key === key)
    if (existing) {
      reliefLikes.value = reliefLikes.value.filter(x => x.key !== key)
      persistAll()
      return
    }

    addInteractionPointsIfAllowed({ eventId: `rel_like_${key}` })
    reliefLikes.value.unshift({ key, reliefId, userId: uId })
    persistAll()
  }

  function submitReliefComment({ reliefId, text, parentId = null }) {
    const r = reliefs.value.find(x => String(x.id) === String(reliefId))
    if (!r) throw new Error('解忧条目不存在')
    if (r.humanStatus !== 'published') throw new Error('暂时无法评论')
    if (curUserId.value === 'anonymous') throw new Error('请先登录')
    const c = String(text || '').trim()
    if (lenCN(c) < 20 || lenCN(c) > 250) throw new Error('评论需在 20-250 字之间')

    const pid = parentId == null || parentId === '' ? null : String(parentId)
    if (pid) {
      // 仅允许在同一解忧条目下的“被回复评论”存在
      const parent = reliefComments.value.find(cc => String(cc.id) === pid && String(cc.reliefId) === String(reliefId))
      if (!parent) throw new Error('被回复的评论不存在')
    }

    const uId = curUserId.value
    const key = `rel_cmt_${reliefId}_${uId}_${pid || 'root'}_${Date.now()}`
    const res = addInteractionPointsIfAllowed({ eventId: key })

    reliefComments.value.unshift({
      id: uid('rc'),
      reliefId: r.id,
      parentId: pid,
      userId: uId,
      username: curUser.value?.username || '',
      content: c,
      createdAt: Date.now(),
      awarded: Boolean(res.added),
      pinned: false,
      pinnedAt: null,
    })
    persistAll()
  }

  function submitReliefReflection({ reliefId, text }) {
    const r = reliefs.value.find(x => String(x.id) === String(reliefId))
    if (!r) throw new Error('解忧条目不存在')
    if (r.humanStatus !== 'published') throw new Error('该解忧尚未发布')
    if (curUserId.value === 'anonymous') throw new Error('请先登录')
    const c = String(text || '').trim()
    if (lenCN(c) < 120 || lenCN(c) > 600) throw new Error('感悟需在 120-600 字之间')

    const existing = reliefReflections.value.find(x => String(x.reliefId) === String(reliefId) && String(x.userId) === String(curUserId.value))
    if (existing) throw new Error('你已为该解忧提交过感悟')

    const reflection = {
      id: uid('rf'),
      reliefId: r.id,
      userId: curUserId.value,
      username: curUser.value?.username || '',
      text: c,
      likes: 0,
      humanStatus: 'published', // 解忧的感悟本身直接公开（本地演示）
      quality: false,
      createdAt: Date.now(),
    }
    reliefReflections.value.unshift(reflection)
    persistAll()

    award({ eventId: `rel_ref_${r.id}_${curUserId.value}`, type: 'relief_insight', points: 8, meta: { reliefId: r.id } })
  }

  function toggleReflectionLike({ reflectionId }) {
    const rf = reliefReflections.value.find(x => String(x.id) === String(reflectionId))
    if (!rf) throw new Error('感悟不存在')
    if (curUserId.value === 'anonymous') throw new Error('请先登录')

    const uId = curUserId.value
    const key = `rf_like_${reflectionId}_${uId}`
    // 复用 speechFavorites 的思路：单独为反向 like 创建一个 set 结构也可，但这里为了简洁直接用 awardFlags 防重复积分
    const liked = awardFlags.value[key] === true
    if (liked) {
      // 取消点赞：不减积分，不回滚
      const idx = reliefReflections.value.findIndex(x => x.id === rf.id)
      if (idx >= 0) reliefReflections.value[idx].likes = Math.max(0, Number(reliefReflections.value[idx].likes || 0) - 1)
      delete awardFlags.value[key]
      persistAll()
      return
    }

    const res = addInteractionPointsIfAllowed({ eventId: `rf_like_${reflectionId}_${uId}` })
    const idx = reliefReflections.value.findIndex(x => x.id === rf.id)
    if (idx >= 0) reliefReflections.value[idx].likes = Number(reliefReflections.value[idx].likes || 0) + 1
    awardFlags.value[key] = true
    persistAll()
    return res
  }

  function adminMarkReflectionQuality({ reflectionId }) {
    if (!admin.value) throw new Error('无权限')
    const idx = reliefReflections.value.findIndex(x => String(x.id) === String(reflectionId))
    if (idx < 0) throw new Error('感悟不存在')
    const rf = reliefReflections.value[idx]
    if (rf.quality) return
    reliefReflections.value[idx] = { ...rf, quality: true }
    persistAll()
    award({ eventId: `rel_ref_quality_${rf.id}`, type: 'relief_insight_quality', points: 20, meta: { reliefId: rf.reliefId } })
  }

  function adminSetReliefCommentTop({ commentId, pinned }) {
    if (!admin.value) throw new Error('无权限')
    const idx = reliefComments.value.findIndex(x => String(x.id) === String(commentId))
    if (idx < 0) throw new Error('评论不存在')
    const c = reliefComments.value[idx]
    reliefComments.value[idx] = {
      ...c,
      pinned: Boolean(pinned),
      pinnedAt: Boolean(pinned) ? Date.now() : null,
    }
    persistAll()
  }

  function adminDeleteReliefComment({ commentId }) {
    if (!admin.value) throw new Error('无权限')
    const targetId = String(commentId)
    const exists = reliefComments.value.some(x => String(x.id) === targetId)
    if (!exists) throw new Error('评论不存在')

    // 构建 parentId -> childrenId 映射，支持删除时级联删除子回复
    const childrenMap = new Map()
    for (const c of reliefComments.value) {
      const pid = c.parentId == null ? 'null' : String(c.parentId)
      const cid = String(c.id)
      if (!childrenMap.has(pid)) childrenMap.set(pid, [])
      childrenMap.get(pid).push(cid)
    }

    const toDelete = new Set([targetId])
    const queue = [targetId]
    while (queue.length) {
      const cur = queue.shift()
      const kids = childrenMap.get(cur) || []
      for (const k of kids) {
        if (!toDelete.has(k)) {
          toDelete.add(k)
          queue.push(k)
        }
      }
    }

    reliefComments.value = reliefComments.value.filter(c => !toDelete.has(String(c.id)))
    persistAll()
  }

  function submitOath({ reliefId, text }) {
    const r = reliefs.value.find(x => String(x.id) === String(reliefId))
    if (!r) throw new Error('解忧条目不存在')
    if (r.humanStatus !== 'published') throw new Error('该解忧尚未发布')
    if (curUserId.value === 'anonymous') throw new Error('请先登录')
    const c = String(text || '').trim()
    if (lenCN(c) < 80 || lenCN(c) > 400) throw new Error('成长誓言需在 80-400 字之间')

    const existing = reliefOaths.value.find(x => String(x.reliefId) === String(reliefId) && String(x.userId) === String(curUserId.value))
    if (existing) throw new Error('你已对该解忧立下誓言')

    reliefOaths.value.unshift({
      id: uid('o'),
      reliefId: r.id,
      userId: curUserId.value,
      username: curUser.value?.username || '',
      text: c,
      createdAt: Date.now(),
    })
    persistAll()
    award({ eventId: `rel_oath_${r.id}_${curUserId.value}`, type: 'practice_small', points: 12, meta: { reliefId: r.id } })
  }

  // ========== 模块 2：成长积分 ==========
  function addPractice({ kind, text, evidenceName, onlineTitle }) {
    if (curUserId.value === 'anonymous') throw new Error('请先登录')
    const c = String(text || '').trim()
    if (lenCN(c) < 40 || lenCN(c) > 800) throw new Error('内容需在 40-800 字之间')
    let points = 0
    let type = ''
    if (kind === 'small') {
      type = 'practice_small'
      points = 12
    } else if (kind === 'evidence') {
      type = 'practice_evidence'
      points = 18
    } else if (kind === 'online') {
      type = 'practice_online'
      points = 7
    } else if (kind === 'share') {
      type = 'practice_share'
      points = 8
    } else {
      throw new Error('未知实践类型')
    }

    const evId = `practice_${kind}_${Date.now()}_${curUserId.value}`
    award({
      eventId: evId,
      type,
      points,
      meta: {
        kind,
        evidenceName: evidenceName || '',
        onlineTitle: onlineTitle || '',
        text: c,
      },
    })
  }

  function canCompleteArchive() {
    // 完成条件：辩论（已获批准发言或小结）、解忧（感悟或誓言）、践行（至少一条实践）、互动（至少一次点赞/评论）
    const hasDebate = myEvents.value.some(e => ['debate_speech_approved', 'debate_speech_quality', 'debate_issue_summary'].includes(e.type))
    const hasRelief = myEvents.value.some(e => ['relief_insight', 'relief_insight_quality', 'practice_small'].includes(e.type))
    const hasPractice = myEvents.value.some(e => ['practice_small', 'practice_evidence', 'practice_online', 'practice_share'].includes(e.type))
    const hasInteraction = myEvents.value.some(e => e.type === 'interaction_like_comment')
    return hasDebate && hasRelief && hasPractice && hasInteraction
  }

  function completeArchive() {
    if (curUserId.value === 'anonymous') throw new Error('请先登录')
    if (!canCompleteArchive()) throw new Error('成长档案尚未满足完善条件（请先完成辩论/解忧/践行/互动）')
    const key = `archive_${curUserId.value}_${todayKey()}`
    if (archiveCompleteFlags.value[key]) throw new Error('今天已完成一次完善')
    archiveCompleteFlags.value[key] = true
    persistAll()
    award({
      eventId: key,
      type: 'growth_archive_complete',
      points: 15,
      meta: {},
    })
    persistAll()
  }

  function getDownloadReportText() {
    const u = curUser.value
    const p = myPoints.value
    const lv = myLevel.value
    const lines = []
    lines.push(`红色精神成长报告（localStorage版）`)
    lines.push(`用户：${u.username || '匿名'} / ID：${curUserId.value}`)
    lines.push(`当前等级：${lv.icon} ${lv.key}`)
    lines.push(`总积分：${p} 分`)
    lines.push(`生成时间：${new Date().toLocaleString('zh-CN')}`)
    lines.push(``)
    lines.push(`==== 积分轨迹（最近 ${Math.min(30, myEvents.value.length)} 条）====`)
    for (const e of myEvents.value.slice(0, 30)) {
      lines.push(`- ${new Date(e.createdAt).toLocaleString('zh-CN')} · ${e.type} · +${e.points} · ${e.meta?.text ? e.meta.text.slice(0, 60) : e.meta?.reliefId ? '解忧:' + e.meta.reliefId : ''}`)
    }
    lines.push(``)
    lines.push(`==== 等级精神权益（本地展示，不兑换实物）====`)
    lv.rights.forEach(r => lines.push(`- ${r}`))
    lines.push(``)
    lines.push(`提示：如需对接后端审核/积分发放，可把本地 award() 迁移为接口调用。`)
    return lines.join('\n')
  }

  return {
    admin,
    curUser,
    issues,
    speeches,
    reliefs,
    reliefReflections,
    myEvents,
    myPoints,
    myLevel,
    MATERIALS,

    // 议题
    listActiveIssues,
    getMaterialById,
    submitSpeech,
    adminAuditSpeech,
    toggleSpeechLike,
    toggleSpeechFavorite,
    submitSpeechComment,
    adminCloseIssue,
    adminCreateIssue,
    adminUpdateIssue,
    adminDeleteIssue,
    adminSetIssueStatus,
    adminUpdateTeacher,
    submitIssueSummary,

    // 解忧
    submitRelief,
    adminPublishRelief,
    toggleReliefLike,
    submitReliefComment,
    submitReliefReflection,
    toggleReflectionLike,
    adminMarkReflectionQuality,
    adminSetReliefCommentTop,
    adminDeleteReliefComment,
    submitOath,

    // 成长积分/档案
    addPractice,
    canCompleteArchive,
    completeArchive,
    getDownloadReportText,

    // 内部数据：点赞/收藏/评论（组件可自行过滤）
    speechLikes,
    speechFavorites,
    speechComments,
    reliefLikes,
    reliefComments,
    reliefOaths,
  }
})

