import api from './index'

export const getShopItems = () => api.get('/shop.php?action=items')
export const buyItem = (data) => api.post('/shop.php?action=buy', data)
export const getInventory = () => api.get('/shop.php?action=inventory')
export const getBalance = () => api.get('/shop.php?action=balance')
export const equipCostume = (data) => api.post('/shop.php?action=equip', data)
export const getCostume = () => api.get('/shop.php?action=costume')
export const resetCostume = () => api.post('/shop.php?action=reset-costume')
export const useGameItem = (data) => api.post('/shop.php?action=use-item', data)
export const earnBeans = (data) => api.post('/shop.php?action=earn', data)
