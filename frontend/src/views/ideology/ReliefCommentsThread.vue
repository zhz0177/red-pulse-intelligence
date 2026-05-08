<template>
  <div>
    <div class="text-xs text-stone-500 mb-2">交流评论（+2，合规互动）</div>

    <div v-if="!canComment" class="text-xs text-stone-400 mb-2">
      请先
      <router-link to="/login" class="text-red-900 hover:text-red-800 underline">登录</router-link>
      后发表评论
    </div>

    <div v-else class="flex gap-2">
      <input
        v-model="commentDraft"
        type="text"
        maxlength="250"
        class="flex-1 text-sm border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-red-900"
        placeholder="写下你的互助评论…（20-250字）"
      />
      <button
        type="button"
        @click="submitRootComment"
        :disabled="submitting"
        class="px-4 py-2 rounded-xl bg-red-900 text-white text-sm font-bold hover:bg-red-800 transition border-0 cursor-pointer disabled:opacity-50"
      >
        {{ submitting ? '提交中…' : '发送' }}
      </button>
    </div>

    <div v-if="rootErr" class="mt-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl p-2">
      {{ rootErr }}
    </div>

    <div v-if="rootComments.length" class="mt-3 space-y-2">
      <ReliefCommentNode
        v-for="c in rootComments"
        :key="c.id"
        :comment="c"
        :relief-id="reliefId"
        :depth="0"
        :get-children-by-parent-id="getChildrenByParentId"
        :can-reply="canComment"
        :show-admin-controls="false"
      />
    </div>

    <div v-else class="text-xs text-stone-400 mt-3">暂无评论</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useIdeologyStore } from '../../stores/ideology'
import ReliefCommentNode from './ReliefCommentNode.vue'

const props = defineProps({
  reliefId: { type: [String, Number], required: true },
})

const store = useIdeologyStore()

const ROOT_KEY = '__root__'

const commentDraft = ref('')
const submitting = ref(false)
const rootErr = ref('')

const canComment = computed(() => store.curUserId !== 'anonymous')

const commentsForRelief = computed(() => {
  return store.reliefComments.filter(c => String(c.reliefId) === String(props.reliefId))
})

const childrenByParentId = computed(() => {
  const obj = {}
  for (const c of commentsForRelief.value) {
    const pid = c.parentId == null || c.parentId === '' ? ROOT_KEY : String(c.parentId)
    if (!obj[pid]) obj[pid] = []
    obj[pid].push(c)
  }

  // replies 默认按时间倒序
  for (const key of Object.keys(obj)) {
    obj[key].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  }

  // 根评论：置顶优先（仅对根评论生效）
  const rootsRaw = obj[ROOT_KEY] || []
  const pinned = rootsRaw.filter(x => Boolean(x.pinned)).sort((a, b) => (b.pinnedAt || 0) - (a.pinnedAt || 0))
  const normal = rootsRaw.filter(x => !Boolean(x.pinned)).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  obj[ROOT_KEY] = [...pinned, ...normal]
  return obj
})

const rootComments = computed(() => childrenByParentId.value[ROOT_KEY] || [])

function getChildrenByParentId(parentId) {
  return childrenByParentId.value[String(parentId)] || []
}

async function submitRootComment() {
  rootErr.value = ''
  if (!canComment.value) {
    rootErr.value = '请先登录'
    return
  }
  submitting.value = true
  try {
    await store.submitReliefComment({ reliefId: props.reliefId, text: commentDraft.value })
    commentDraft.value = ''
  } catch (e) {
    rootErr.value = e?.message || '评论失败'
  } finally {
    submitting.value = false
  }
}
</script>

