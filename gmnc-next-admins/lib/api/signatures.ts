function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || localStorage.getItem('gmnc_token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function uploadSignature(dataUrl: string, isDefault = false) {
  // send base64 data to backend
  const res = await fetch('/api/signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ data: dataUrl, isDefault }),
  })
  if (!res.ok) throw new Error('Upload failed')
  return res.json()
}

export async function listSignatures(userId: string) {
  const res = await fetch(`/api/signature/${userId}`, { headers: authHeaders(), cache: 'no-store' })
  if (!res.ok) throw new Error('List failed')
  return res.json()
}

export async function attachSignature(payload: { relatedModel: string; relatedId: string; dataUrl?: string }) {
  const form = new FormData()
  form.append('relatedModel', payload.relatedModel)
  form.append('relatedId', payload.relatedId)
  if (payload.dataUrl) form.append('data', payload.dataUrl)

  const res = await fetch('/api/signature/attach', { method: 'POST', body: form, headers: authHeaders() })
  if (!res.ok) throw new Error('Attach failed')
  return res.json()
}
