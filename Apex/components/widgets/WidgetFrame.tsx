// components/widgets/WidgetFrame.tsx
"use client";

import { WidgetConfig, SIZE_CLASSES } from "./types";

interface WidgetFrameProps {
  config: WidgetConfig;
  editing?: boolean;
  onRemove?: () => void;
  children: React.ReactNode;
}

function GripHandle() {
  return (
    <div className="grid grid-cols-2 gap-[3.5px]">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="w-[3px] h-[3px] rounded-full"
          style={{ background: "var(--text-subtle)" }}
        />
      ))}
    </div>
  );
}

function ResizeHandle() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      style={{ color: "var(--text-subtle)" }}
    >
      <path d="M11 1L1 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M11 6L6 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default function WidgetFrame({
  config,
  editing = false,
  onRemove,
  children,
}: WidgetFrameProps) {
  return (
    <div className={`${SIZE_CLASSES[config.size]} relative`}>
      <div className={`glass-tile h-full flex flex-col ${editing ? "glass-tile-editing" : ""}`}>

        {/* Specular highlight — top edge */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10" />

        {/* Specular sweep — visible on hover in edit mode */}
        <div
          className="specular-sweep absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none z-10"
          style={{ transform: "translateX(-100%) skewX(-20deg)" }}
        />

        {/* ── Header ── */}
        <div
          className={`relative flex items-center gap-2 px-3 py-2.5 shrink-0 ${
            editing ? "cursor-grab active:cursor-grabbing" : ""
          }`}
          style={{
            background: "linear-gradient(to bottom, var(--glass-bg-hover), transparent)",
            borderBottom: "1px solid var(--glass-border)",
          }}
        >
          {editing && (
            <div className="shrink-0 opacity-60">
              <GripHandle />
            </div>
          )}

          <span className="flex-1 text-[10px] font-mono uppercase tracking-[0.18em] truncate select-none" style={{ color: "var(--text-subtle)" }}>
            {config.title}
          </span>

          {editing && onRemove && (
            <button
              onClick={onRemove}
              className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center hover:text-red-400 transition-all duration-200"
              style={{ color: "var(--text-subtle)", background: "transparent" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.15)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.0)";
              }}
              aria-label="Remove widget"
            >
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <line x1="1" y1="1" x2="8" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="8" y1="1" x2="1" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 min-h-0 p-3">{children}</div>
      </div>

      {/* ── Resize handle (edit mode) ── */}
      {editing && (
        <div
          className="absolute bottom-0 right-0 w-6 h-6 flex items-end justify-end p-[5px] cursor-se-resize z-20 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Resize widget"
        >
          <ResizeHandle />
        </div>
      )}
    </div>
  );
}
