import React, { useEffect, useRef } from 'react'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import PdfJsWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker'

export default function SecurePDFViewer({ srcUrl, token, watermarkText }) {
  const containerRef = useRef(null)
  const overlayRef = useRef(null)

  // Security: disable right-click, print/save shortcuts, and browser print dialog
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    
    // Block right-click context menu
    const onContext = (e) => e.preventDefault()
    
    // Block keyboard shortcuts (Ctrl+P, Ctrl+S, PrintScreen)
    const onKeyDown = (e) => {
      const key = e.key.toLowerCase()
      const ctrl = e.ctrlKey || e.metaKey
      if ((ctrl && (key === 'p' || key === 's')) || key === 'printscreen') {
        e.preventDefault()
        e.stopPropagation()
        alert('Printing and saving are disabled.')
        return false
      }
    }
    
    // Block browser print dialog (File → Print, or window.print())
    const blockPrint = (e) => {
      e.preventDefault()
      alert('Printing is disabled for this protected document.')
      return false
    }
    
    // Override window.print() function
    const originalPrint = window.print
    window.print = () => {
      alert('Printing is disabled for this protected document.')
      return false
    }
    
    // Block beforeprint event (fires when print dialog opens)
    window.addEventListener('beforeprint', blockPrint)
    
    // Block afterprint event (fires when print dialog closes)
    window.addEventListener('afterprint', blockPrint)
    
    document.addEventListener('contextmenu', onContext)
    document.addEventListener('keydown', onKeyDown, true)
    
    return () => {
      document.removeEventListener('contextmenu', onContext)
      document.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('beforeprint', blockPrint)
      window.removeEventListener('afterprint', blockPrint)
      window.print = originalPrint // Restore original print function
    }
  }, [])

  // Render PDF with PDF.js
  useEffect(() => {
    let cancelled = false
    const container = containerRef.current
    if (!container) return

    // Ensure worker is configured once
    if (!GlobalWorkerOptions.workerPort) {
      GlobalWorkerOptions.workerPort = new PdfJsWorker()
    }

    async function load() {
      try {
        container.innerHTML = ''
        const loading = document.createElement('div')
        loading.textContent = 'Loading PDF…'
        loading.style.padding = '16px'
        container.appendChild(loading)

        const res = await fetch(srcUrl, { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) {
          const msg = await res.text().catch(() => '')
          container.innerHTML = `<div style="padding:16px;color:crimson">Failed to load PDF (${res.status}) ${msg}</div>`
          return
        }
        const buf = await res.arrayBuffer()
        if (cancelled) return

        const pdf = await getDocument({ data: buf }).promise
        container.innerHTML = ''
        for (let p = 1; p <= pdf.numPages; p++) {
          const page = await pdf.getPage(p)
          const viewport = page.getViewport({ scale: 1.2 })
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          canvas.width = Math.floor(viewport.width)
          canvas.height = Math.floor(viewport.height)
          canvas.style.display = 'block'
          canvas.style.margin = '0 auto 8px auto'
          container.appendChild(canvas)
          await page.render({ canvasContext: ctx, viewport }).promise
        }
      } catch (err) {
        console.error('PDF load error', err)
        container.innerHTML = `<div style="padding:16px;color:crimson">Error loading PDF: ${err?.message || err}</div>`
      }
    }

    load()
    return () => { cancelled = true }
  }, [srcUrl, token])

  // Watermark overlay
  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return
    overlay.textContent = watermarkText
  }, [watermarkText])

  const overlayStyle = {
    position: 'fixed', inset: 0, pointerEvents: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '32px', color: 'rgba(0,0,0,0.18)',
    transform: 'rotate(-25deg)',
    textAlign: 'center',
    whiteSpace: 'pre-wrap',
    userSelect: 'none',
    zIndex: 1000,
  }

  // Add CSS to block printing
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @media print {
        body * {
          visibility: hidden !important;
        }
        body::before {
          content: "Printing is disabled for this protected document.";
          visibility: visible !important;
          display: block;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 24px;
          color: #000;
        }
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      <div ref={containerRef} style={{ background: '#f7f7f7', minHeight: '60vh', padding: '8px' }} />
      <div ref={overlayRef} style={overlayStyle} />
    </div>
  )
}


