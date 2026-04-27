'use client';

import { useEffect, useRef, useCallback } from 'react';

interface SignaturePadProps {
  onChange: (signatureData: string) => void;
  value?: string;
  /** Height of the drawing canvas in px. Default: 110 */
  height?: number;
  /** Show a red error border when true */
  hasError?: boolean;
}

export function SignaturePad({ onChange, value, height = 110, hasError }: SignaturePadProps) {
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);
  const isDrawing     = useRef(false);
  const lastPos       = useRef<{ x: number; y: number } | null>(null);
  const hasStrokes    = useRef(false);

  // ── initialise / redraw when value changes ──────────────────────────────
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = container.clientWidth;
    canvas.width  = w;
    canvas.height = height;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, height);

    if (value) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = value;
      hasStrokes.current = true;
    } else {
      hasStrokes.current = false;
    }
  }, [value, height]);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  // ── pointer helpers ─────────────────────────────────────────────────────
  const getPos = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current!;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const beginStroke = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawing.current = true;
    lastPos.current = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
    }
  };

  const continueStroke = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);
    ctx.lineWidth   = 1.8;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    hasStrokes.current = true;
  };

  const endStroke = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPos.current = null;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.closePath();
    onChange(canvas.toDataURL('image/png'));
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    hasStrokes.current = false;
    onChange('');
  };

  const isFilled = !!value && value.length > 100;

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className={`relative border-2 rounded-md overflow-hidden bg-white transition-colors ${
          hasError
            ? 'border-red-400'
            : isFilled
            ? 'border-green-400'
            : 'border-dashed border-gray-300'
        }`}
      >
        {/* Placeholder hint */}
        {!isFilled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-xs text-gray-300">Tanda tangan di sini</span>
          </div>
        )}

        {/* Filled indicator */}
        {isFilled && (
          <div className="absolute top-1.5 right-2 pointer-events-none select-none">
            <span className="text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
              Terisi
            </span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          style={{ height, display: 'block', touchAction: 'none' }}
          className="w-full cursor-crosshair"
          onMouseDown={beginStroke}
          onMouseMove={continueStroke}
          onMouseUp={endStroke}
          onMouseLeave={endStroke}
          onTouchStart={beginStroke}
          onTouchMove={continueStroke}
          onTouchEnd={endStroke}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {isFilled ? 'Tanda tangan telah diisi.' : 'Gambar tanda tangan Anda dengan mouse atau sentuhan layar.'}
        </p>
        {isFilled && (
          <button
            type="button"
            onClick={clearSignature}
            className="text-xs text-red-500 hover:text-red-700 underline"
          >
            Hapus
          </button>
        )}
      </div>
    </div>
  );
}
