import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getBalance, getInventory, getCostume, equipCostume as apiEquip, resetCostume as apiReset, earnBeans as apiEarnBeans } from '../api/shop'

export const useShopStore = defineStore('shop', () => {
  const LS_BEANS = 'inherit-beans'
  const LS_INVENTORY = 'inherit-inventory'

  const beans = ref(0)
  const inventory = ref([])
  const costume = ref({ head_css: null, body_css: null, accessory_css: null, head_item_id: null, body_item_id: null, accessory_item_id: null })

  // 从 localStorage 初始化（刷新时快速恢复）
  try {
    const savedBeans = localStorage.getItem(LS_BEANS)
    if (savedBeans !== null) beans.value = Math.max(0, parseInt(savedBeans, 10) || 0)
  } catch {}
  try {
    const savedInv = localStorage.getItem(LS_INVENTORY)
    if (savedInv) inventory.value = JSON.parse(savedInv) || []
  } catch {}

  async function fetchBalance() {
    try {
      const res = await getBalance()
      beans.value = res.data.beans
      try { localStorage.setItem(LS_BEANS, String(beans.value)) } catch {}
    } catch {}
  }

  async function fetchInventory() {
    try {
      const res = await getInventory()
      inventory.value = res.data
      try { localStorage.setItem(LS_INVENTORY, JSON.stringify(inventory.value || [])) } catch {}
    } catch {}
  }

  async function fetchCostume() {
    try {
      const res = await getCostume()
      costume.value = res.data
      localStorage.setItem('mascot-costume', JSON.stringify(res.data))
    } catch {}
  }

  async function saveCostume(data) {
    await apiEquip(data)
    await fetchCostume()
  }

  async function clearCostume() {
    await apiReset()
    costume.value = { head_css: null, body_css: null, accessory_css: null, head_item_id: null, body_item_id: null, accessory_item_id: null }
    localStorage.setItem('mascot-costume', JSON.stringify(costume.value))
  }

  async function refreshAll() {
    await Promise.all([fetchBalance(), fetchInventory(), fetchCostume()])
  }

  async function earn(reason) {
    // 后端 reason 会做白名单校验；前端只负责触发
    await apiEarnBeans({ reason })
    await fetchBalance()
  }

  function reset() {
    beans.value = 0
    inventory.value = []
    costume.value = { head_css: null, body_css: null, accessory_css: null, head_item_id: null, body_item_id: null, accessory_item_id: null }
    localStorage.removeItem('mascot-costume')
    try { localStorage.removeItem(LS_BEANS) } catch {}
    try { localStorage.removeItem(LS_INVENTORY) } catch {}
  }

  // 从 localStorage 初始化装扮（页面刷新时快速恢复）
  try {
    const saved = localStorage.getItem('mascot-costume')
    if (saved) costume.value = JSON.parse(saved)
  } catch {}

  return { beans, inventory, costume, fetchBalance, fetchInventory, fetchCostume, saveCostume, clearCostume, refreshAll, earn, reset }
})
