"use client"
import React, { useCallback, useEffect, useState } from 'react'
import SignaturePad from '../../../../components/ui/SignaturePad'
import { uploadSignature, listSignatures } from '../../../../lib/api/signatures'

export default function SignaturePage() {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(true)

  const loadPreview = useCallback(async () => {
    setLoadingPreview(true)
    try {
      const json = await listSignatures('self')
      const src =
        typeof json?.data?.dataUrl === 'string'
          ? json.data.dataUrl
          : typeof json?.dataUrl === 'string'
            ? json.dataUrl
            : typeof json?.signature?.dataUrl === 'string'
              ? json.signature.dataUrl
              : null
      if (src) setPreview(src)
    } catch { /* ignore */ } finally {
      setLoadingPreview(false)
    }
  }, [])

  useEffect(() => { void Promise.resolve().then(() => loadPreview()); }, [loadPreview])

  const handleSave = async () => {
    if (!dataUrl) return setMessage('Please sign first')
    setSaving(true)
    setMessage(null)
    try {
      await uploadSignature(dataUrl, true)
      setPreview(dataUrl)
      setMessage('Signature saved')
    } catch (err) {
      console.error(err)
      setMessage('Upload failed')
    } finally {
      setSaving(false)
    }
  }

  const handleClear = () => {
    setDataUrl(null)
    setMessage(null)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Signature</h2>
        <p className="mt-1 text-xs text-slate-500">Draw your signature below and save it as your default.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3">
        <SignaturePad onChange={setDataUrl} width={720} height={220} />
      </div>

      {dataUrl && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
          <span className="text-[11px] font-medium text-slate-600">New signature ready</span>
          <button type="button" onClick={handleClear} className="text-[11px] font-semibold text-red-600 transition hover:text-red-700">
            Clear
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !dataUrl}
        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? 'Saving...' : 'Save as default'}
      </button>

      {message && <p className="text-xs font-medium text-slate-600">{message}</p>}

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Current signature</p>
        {loadingPreview ? (
          <p className="mt-2 text-xs text-slate-400">Loading...</p>
        ) : preview ? (
          <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3">
            <img src={preview} alt="Saved signature" className="max-h-28 w-auto" />
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-400">No saved signature.</p>
        )}
      </div>
    </div>
  )
}
