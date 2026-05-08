<template>
  <div class="bg-white rounded-xl shadow-lg border border-amber-700/20 p-6 max-w-sm">
    <div class="text-center mb-4">
      <div class="text-4xl mb-2">🏅</div>
      <h3 class="text-lg font-bold text-red-900">电子荣誉证书</h3>
    </div>
    <div class="paper-bg p-6 text-center" id="certificate-content">
      <div class="border-2 border-amber-700 p-4 rounded">
        <p class="text-xs text-amber-700 mb-2">红脉智联 · 志愿服务荣誉证书</p>
        <h4 class="text-xl font-bold text-red-900 my-3">{{ data.username }}</h4>
        <p class="text-sm text-stone-600 mb-2">
          在"{{ data.projectTitle }}"志愿服务项目中表现优异
        </p>
        <p class="text-sm text-stone-600 mb-3">服务学时: <span class="font-bold text-red-900">{{ data.hours || 8 }}小时</span></p>
        <div class="border-t border-amber-700/30 pt-3 mt-3">
          <p class="text-xs text-stone-400">溯源码: {{ data.certificateCode }}</p>
          <p class="text-xs text-stone-400 mt-1">颁发日期: {{ data.date || today }}</p>
        </div>
      </div>
    </div>
    <button @click="downloadPDF" class="w-full mt-4 btn-red text-center text-sm">
      下载 PDF 证书
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Object, default: () => ({}) }
})

const today = computed(() => new Date().toLocaleDateString('zh-CN'))

async function downloadPDF() {
  try {
    const { default: html2canvas } = await import('html2canvas')
    const { jsPDF } = await import('jspdf')
    const el = document.getElementById('certificate-content')
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#faf8f0' })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 190
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    pdf.addImage(imgData, 'PNG', 10, 20, imgWidth, imgHeight)
    pdf.save(`荣誉证书_${props.data.username || '志愿者'}.pdf`)
  } catch (e) {
    alert('PDF 生成失败，请重试')
  }
}
</script>
