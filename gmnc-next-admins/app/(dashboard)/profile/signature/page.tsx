"use client"
import React, { useState } from 'react'
import SignaturePad from '../../../../components/ui/SignaturePad'
import { uploadSignature, listSignatures } from '../../../../lib/api/signatures'

export default function SignaturePage() {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSave = async () => {
    if (!dataUrl) return setMessage('Please sign first')
    setSaving(true)
    try {
      await uploadSignature(dataUrl, true)
      setMessage('Uploaded')
    } catch (err) {
      console.error(err)
      setMessage('Upload failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2>Capture Signature</h2>
      <SignaturePad onChange={setDataUrl} width={600} height={220} />
      <div style={{ marginTop: 12 }}>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary">
          {saving ? 'Saving...' : 'Save as default'}
        </button>
      </div>
      {message && <div style={{ marginTop: 8 }}>{message}</div>}
    </div>
  )
}
