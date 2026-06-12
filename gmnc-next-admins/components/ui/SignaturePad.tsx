"use client"
import React, { useRef, useEffect, useState } from 'react'

type Props = {
  width?: number
  height?: number
  onChange?: (dataUrl: string | null) => void
}

export default function SignaturePad({ width = 600, height = 250, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.lineWidth = 2
    ctx.strokeStyle = '#111827'
  }, [width, height])

  const getCtx = () => canvasRef.current?.getContext('2d') ?? null

  const pointerDown = (e: React.PointerEvent) => {
    const ctx = getCtx()
    if (!ctx) return
    setIsDrawing(true)
    const rect = (canvasRef.current as HTMLCanvasElement).getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const pointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return
    const ctx = getCtx()
    if (!ctx) return
    const rect = (canvasRef.current as HTMLCanvasElement).getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
    if (onChange) onChange(canvasRef.current?.toDataURL() ?? null)
  }

  const pointerUp = () => {
    setIsDrawing(false)
    const ctx = getCtx()
    if (!ctx) return
    ctx.closePath()
    if (onChange) onChange(canvasRef.current?.toDataURL() ?? null)
  }

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (onChange) onChange(null)
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerLeave={pointerUp}
        role="img"
        aria-label="Signature pad"
        style={{ touchAction: 'none', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6 }}
      />
      <div style={{ marginTop: 8 }}>
        <button type="button" onClick={clear} className="btn">
          Clear
        </button>
      </div>
    </div>
  )
}
