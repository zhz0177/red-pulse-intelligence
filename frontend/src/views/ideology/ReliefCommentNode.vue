<template>
  <div
    :class="[
      'rounded-2xl p-3 border transition',
      depth === 0 ? 'bg-stone-50 border-stone-200' : 'bg-white border-stone-200'
    ]"
    :style="{ marginLeft: `${depth * 10}px`, marginRight: `${Math.max(0, 0) }px` }"
  >
    <div class="flex items-start justify-between gap-3 flex-wrap">
      <div class="min-w-0">
        <div class="text-xs text-stone-500">
          {{ comment.username || '用户' }} · {{ timeAgo(comment.createdAt) }}
          <span
            v-if="depth === 0 && isRoot && comment.pinned"
            class="ml-2 text-amber-900 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5 text-[11px] font-bold"
          >
            置顶
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="canReply"
          type="button"
          @click="replyOpen = !replyOpen"
          class="text-xs px-3 py-1 rounded-xl border border-stone-200 hover:border-red-900/60 hover:text-red-900 transition cursor-pointer bg-white"
        >
          {{ replyOpen ? '收起' : '回复' }}
        </button>

        <button
          v-if="showAdminControls"
          type="button"
          @click="togglePin"
          class="text-xs px-3 py-1 rounded-xl border border-amber-200 hover:border-amber-500 hover:text-amber-900 transition cursor-pointer bg-white"
          :disabled="!(isRoot && depth === 0)"
          :class="!(isRoot && depth === 0) ? 'opacity-40 cursor-not-allowed' : ''"
          :title="isRoot && depth === 0 ? '置顶/取消置顶' : '仅支持根评论置顶'"
        >
          {{ comment.pinned ? '取消置顶' : '置顶' }}
        </button>

        <button
          v-if="showAdminControls"
          type="button"
          @click="deleteComment"
          class="text-xs px-3 py-1 rounded-xl border border-red-200 hover:border-red-500 hover:text-red-900 transition cursor-pointer bg-white"
        >
          删除
        </button>
      </div>
    </div>

    <div class="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed mt-2">
      {{ comment.content }}
    </div>

    <div v-if="replyOpen" class="mt-3">
      <textarea
        v-model="replyDraft"
        rows="3"
        class="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-red-900"
        maxlength="250"
        placeholder="写下你的回复…（20-250字）"
      />
      <div class="mt-2 flex items-center justify-end gap-2 flex-wrap">
        <button
          type="button"
          @click="submitReply"
          class="px-4 py-2 rounded-xl bg-red-900 text-white text-sm font-bold hover:bg-red-800 transition border-0 cursor-pointer"
        >
          发送
        </button>
        <button
          type="button"
          @click="replyOpen = false"
          class="px-4 py-2 rounded-xl bg-stone-100 text-stone-600 text-sm font-bold hover:bg-stone-200 transition border-0 cursor-pointer"
        >
          取消
        </button>
      </div>
      <div v-if="replyErr" class="mt-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl p-2">
        {{ replyErr }}
      </div>
    </div>

    <div v-if="getChildrenByParentId(comment.id).length" class="mt-3 space-y-2">
      <ReliefCommentNode
        v-for="child in getChildrenByParentId(comment.id)"
        :key="child.id"
        :comment="child"
        :relief-id="reliefId"
        :depth="depth + 1"
        :get-children-by-parent-id="getChildrenByParentId"
        :can-reply="canReply"
        :show-admin-controls="showAdminControls"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useIdeologyStore } from '../../stores/ideology'

defineOptions({ name: 'ReliefCommentNode' })

const props = defineProps({
  comment: { type: Object, required: true },
  reliefId: { type: [String, Number], required: true },
  depth: { type: Number, default: 0 },
  getChildrenByParentId: { type: Function, required: true },
  canReply: { type: Boolean, default: false },
  showAdminControls: { type: Boolean, default: false },
})

const store = useIdeologyStore()

const replyOpen = ref(false)
const replyDraft = ref('')
const replyErr = ref('')

const isRoot = computed(() => props.comment.parentId == null || props.comment.parentId === '')

function timeAgo(ts) {
  if (!ts) return ''
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return '刚刚'
  if (m < 60) return `${m}分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}小时前`
  const d = Math.floor(h / 24)
  return `${d}天前`
}

async function submitReply() {
  replyErr.value = ''
  try {
    await store.submitReliefComment({
      reliefId: props.reliefId,
      text: replyDraft.value,
      parentId: props.comment.id,
    })
    replyDraft.value = ''
    replyOpen.value = false
  } catch (e) {
    replyErr.value = e?.message || '回复失败'
  }
}

async function togglePin() {
  if (!(isRoot.value && props.depth === 0)) return
  try {
    await store.adminSetReliefCommentTop({
      commentId: props.comment.id,
      pinned: !props.comment.pinned,
    })
  } catch (e) {
    alert(e?.message || '置顶失败')
  }
}

async function deleteComment() {
  const ok = confirm('确定删除该评论及其所有回复吗？')
  if (!ok) return
  try {
    await store.adminDeleteReliefComment({ commentId: props.comment.id })
  } catch (e) {
    alert(e?.message || '删除失败')
  }
}
</script>

