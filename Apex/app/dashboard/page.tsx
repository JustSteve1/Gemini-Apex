// app/dashboard/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { WidgetFrame, getWidgetByType, WIDGET_REGISTRY } from "@/components/widgets";
import WidgetBuilder from "@/components/widgets/WidgetBuilder";
import ThemeToggle from "@/components/layout/ThemeToggle";
import type { WidgetConfig } from "@/components/widgets";

const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: "w-speed",
    type: "speed_trace",
    size: "2x1",
    title: "Speed Trace",
    params: { drivers: ["44", "16"], lapNumber: 22, sessionType: "R" },
  },
  {
    id: "w-tyre",
    type: "tyre_deg",
    size: "2x1",
    title: "Tyre Deg",
    params: { drivers: ["44", "16"], sessionType: "R", stintStart: 1, stintEnd: 20 },
  },
  {
    id: "w-gap",
    type: "gap",
    size: "1x1",
    title: "Gap",
    params: { driverAhead: "4", driverBehind: "44", sessionType: "R" },
  },
  {
    id: "w-battery",
    type: "battery",
    size: "1x1",
    title: "ERS",
    params: { driver: "44", lapNumber: 22, sessionType: "R" },
  },
  {
    id: "w-h2h",
    type: "head_to_head",
    size: "2x2",
    title: "Head to Head",
    params: { driver1: "44", driver2: "16", sessionType: "R" },
  },
  {
    id: "w-agent",
    type: "agent",
    size: "1x2",
    title: "Apex",
    params: { placeholder: "Ask about the race..." },
  },
];

export default function DashboardPage() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [editing, setEditing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);

  const removeWidget = (id: string) => setWidgets((w) => w.filter((x) => x.id !== id));

  const addWidget = (type: string) => {
    const entry = getWidgetByType(type);
    if (!entry) return;
    setWidgets((w) => [
      ...w,
      {
        id: `w-${Date.now()}`,
        type: entry.type,
        size: entry.defaultSize,
        title: entry.label,
        params: entry.defaultConfig.params || {},
        dataSource: entry.defaultConfig.dataSource,
      },
    ]);
    setDrawerOpen(false);
  };

  const addBuiltWidget = (config: WidgetConfig) => setWidgets((w) => [...w, config]);

  return (
    <div className="min-h-screen dashboard-canvas">

      {/* ── Header ── */}
      <header className="glass-header sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-12">

          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: "#E10600",
                boxShadow: "0 0 14px rgba(225,6,0,0.55), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              <span className="text-[11px] font-black text-white">A</span>
            </div>
            <span className="text-xs font-mono font-bold tracking-widest apex-text-muted group-hover:apex-text-primary transition-colors">
              APEX
            </span>
            <span className="hidden sm:flex items-center gap-2 pl-2 border-l" style={{ borderColor: "var(--glass-border)" }}>
              <span className="text-[9px] font-mono apex-text-faint">AUSTRALIAN GP</span>
              <span className="w-1 h-1 rounded-full bg-emerald-500/60 animate-pulse" />
              <span className="text-[9px] font-mono apex-text-faint">LAP 22/58</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {editing && (
              <button
                onClick={() => setDrawerOpen(true)}
                className="apex-ghost-btn flex items-center gap-1.5 h-8 px-3 text-[10px] font-mono rounded-lg"
              >
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                  <line x1="4.5" y1="1" x2="4.5" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="1" y1="4.5" x2="8" y2="4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                ADD
              </button>
            )}
            <button
              onClick={() => { setEditing(!editing); if (editing) setDrawerOpen(false); }}
              className={`h-8 px-4 text-[10px] font-mono rounded-lg transition-all duration-200 ${
                editing ? "apex-active-btn" : "apex-ghost-btn"
              }`}
            >
              {editing ? "DONE" : "EDIT"}
            </button>
            <ThemeToggle />
          </div>
        </div>

        {editing && (
          <div className="apex-edit-banner px-4 py-2 flex items-center justify-center gap-3">
            <div className="flex items-center gap-[3px]">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-[3px] h-[3px] rounded-full apex-text-subtle" style={{ background: "var(--text-subtle)" }} />
              ))}
            </div>
            <span className="text-[8px] font-mono apex-text-faint tracking-[0.2em] uppercase">
              Drag to reorder · resize from corner · tap × to remove
            </span>
          </div>
        )}
      </header>

      {/* ── Grid ── */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 pb-32">
        <div className="grid grid-cols-2 sm:grid-cols-4 auto-rows-[160px] sm:auto-rows-[180px] gap-3">
          {widgets.map((w) => {
            const entry = getWidgetByType(w.type);
            if (!entry) return null;
            const Component = entry.component;
            return (
              <WidgetFrame
                key={w.id}
                config={w}
                editing={editing}
                onRemove={() => removeWidget(w.id)}
              >
                <Component config={w} />
              </WidgetFrame>
            );
          })}

          {editing && (
            <div
              onClick={() => setDrawerOpen(true)}
              className="apex-dashed-slot col-span-1 row-span-1 flex flex-col items-center justify-center gap-2 cursor-pointer group"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "var(--glass-bg-hover)" }}
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="apex-text-subtle group-hover:apex-text-muted transition-colors">
                  <line x1="5.5" y1="1" x2="5.5" y2="10" stroke="var(--text-subtle)" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="1" y1="5.5" x2="10" y2="5.5" stroke="var(--text-subtle)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-[8px] font-mono apex-text-faint tracking-widest">ADD WIDGET</span>
            </div>
          )}
        </div>
      </main>

      {/* ── Add Widget Drawer ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          />
          <div
            className="glass-drawer relative w-full max-w-lg rounded-t-3xl p-6 pb-10 max-h-[72vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent rounded-full" />
            <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: "var(--glass-border-strong)" }} />
            <p className="text-[10px] font-mono apex-text-subtle mb-5 tracking-[0.2em]">ADD WIDGET</p>
            <div className="grid grid-cols-3 gap-2">
              {WIDGET_REGISTRY.map((entry) => {
                const active = widgets.some((w) => w.type === entry.type);
                return (
                  <button
                    key={entry.type}
                    onClick={() => !active && addWidget(entry.type)}
                    disabled={active}
                    className="apex-drawer-card glass-tile flex flex-col items-center justify-center gap-2 p-4 min-h-[84px] rounded-2xl"
                  >
                    <span className="text-lg">{entry.icon}</span>
                    <span className="text-[9px] font-mono apex-text-muted text-center leading-tight">{entry.label}</span>
                    <span
                      className="text-[8px] font-mono px-1.5 py-0.5 rounded-full apex-text-subtle"
                      style={{ background: "var(--glass-bg-hover)" }}
                    >
                      {entry.defaultSize}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Create Widget button ── */}
      <button
        onClick={() => setBuilderOpen(true)}
        className="builder-btn fixed left-1/2 z-40 flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm text-white"
        style={{
          bottom: "5rem",
          background: "#E10600",
          boxShadow: "0 0 28px rgba(225,6,0,0.55), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
          border: "1px solid rgba(255,100,80,0.3)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="1" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.9" />
          <rect x="8" y="1" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.5" />
          <rect x="1" y="8" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.5" />
          <rect x="8" y="8" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.9" />
        </svg>
        <span>Create Widget</span>
      </button>

      {/* ── Status bar — floating glass pill ── */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30">
        <div className="glass-pill flex items-center px-5 h-8 rounded-full">
          <span className="text-[8px] font-mono apex-text-faint whitespace-nowrap tracking-widest">
            P1 VER &nbsp;·&nbsp; P2 HAM +1.2 &nbsp;·&nbsp; P3 NOR +2.4 &nbsp;·&nbsp; P4 LEC +3.1 &nbsp;·&nbsp; P5 PIA +4.8
          </span>
        </div>
      </div>

      {/* ── Widget Builder ── */}
      {builderOpen && (
        <WidgetBuilder
          onClose={() => setBuilderOpen(false)}
          onWidgetCreated={addBuiltWidget}
        />
      )}
    </div>
  );
}
