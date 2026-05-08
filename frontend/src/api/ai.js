/**
 * AI 聊天 - 流式请求 (火山引擎 Responses API)
 * @param {Array} messages - 对话历史 [{role, content}, ...]
 * @param {Function} onChunk - 每收到一段文本的回调
 * @returns {Promise<void>}
 */
export async function chatStream(messages, onChunk) {
  const token = localStorage.getItem('token') || ''
  const res = await fetch('/api/ai.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ messages }),
  })

  if (!res.ok) {
    let msg = '请求失败'
    try {
      const text = await res.text()
      // 尝试解析 JSON 错误
      try {
        const err = JSON.parse(text)
        msg = err.message || err.error?.message || msg
      } catch {
        if (text) msg = text.substring(0, 200)
      }
    } catch {}
    throw new Error(msg)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let hasContent = false

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() // 保留不完整的行

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data: ') && !trimmed.startsWith('data:')) continue
      const data = trimmed.startsWith('data: ') ? trimmed.slice(6) : trimmed.slice(5)
      if (data === '[DONE]') return
      if (!data) continue
      try {
        const json = JSON.parse(data)
        // Responses API: response.output_text.delta
        if (json.type === 'response.output_text.delta' && json.delta) {
          onChunk(json.delta)
          hasContent = true
        }
        // Chat Completions 兼容
        else if (json.choices?.[0]?.delta?.content) {
          onChunk(json.choices[0].delta.content)
          hasContent = true
        }
        // 错误响应
        else if (json.error) {
          throw new Error(json.error.message || json.error || 'AI 接口错误')
        }
        else if (json.type === 'error') {
          throw new Error(json.message || 'AI 接口错误')
        }
      } catch (e) {
        if (e.message && e.message !== 'AI 接口错误') throw e
      }
    }
  }

  // 如果整个流没有任何内容输出，说明可能有问题
  if (!hasContent) {
    throw new Error('AI 未返回任何内容，请检查 API 配置')
  }
}
