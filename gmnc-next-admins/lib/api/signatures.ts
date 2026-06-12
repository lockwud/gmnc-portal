export async function uploadSignature(dataUrl: string, isDefault = false) {
  const res = await fetch('/api/signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: dataUrl, isDefault }),
  })
  const text = await res.text().catch(() => '')
  let payload: unknown = null
  try { payload = JSON.parse(text) } catch { /* not json */ }
  if (!res.ok) {
    const msg = typeof payload === 'object' && payload && typeof (payload as Record<string, unknown>).message === 'string'
      ? (payload as Record<string, string>).message
      : 'Upload failed'
    throw new Error(msg)
  }
  return payload
}

export async function listSignatures(userId: string) {
  const res = await fetch(`/api/signature/${userId}`)
  if (!res.ok) throw new Error('List failed')
  const text = await res.text().catch(() => '{}')
  return JSON.parse(text)
}

export async function attachSignature(payload: { relatedModel: string; relatedId: string; dataUrl?: string }) {
  const form = new FormData()
  form.append('relatedModel', payload.relatedModel)
  form.append('relatedId', payload.relatedId)
  if (payload.dataUrl) form.append('data', payload.dataUrl)

  const res = await fetch('/api/signature/attach', { method: 'POST', body: form })
  if (!res.ok) throw new Error('Attach failed')
  return res.json()
}
