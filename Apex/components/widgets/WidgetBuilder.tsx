// components/widgets/WidgetBuilder.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  BLOCK_REGISTRY,
  CATEGORY_META,
  BlockDefinition,
  BlockSlot,
} from "@/components/../.agent/skills/widgets/blocks";
import type { WidgetConfig } from "./types";

interface WidgetBuilderProps {
  onClose: () => void;
  onWidgetCreated: (config: WidgetConfig) => void;
}

type Category = BlockDefinition["category"] | "all";

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "comparison", label: "Comparison" },
  { id: "telemetry", label: "Telemetry" },
  { id: "strategy", label: "Strategy" },
  { id: "battle", label: "Battle" },
];

// ── Inline slot dropdown ────────────────────────────────

function SlotDropdown({
  slot,
  value,
  onChange,
}: {
  slot: BlockSlot;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (slot.type === "text") {
    return (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={slot.label}
        className="inline-block rounded-lg px-3 py-1 text-sm font-mono outline-none mx-1 min-w-[160px]"
        style={{
          background: "var(--glass-bg-hover)",
          border: "1px solid var(--glass-border-strong)",
          color: "var(--text-primary)",
          backdropFilter: "blur(8px)",
        }}
      />
    );
  }

  const selected = slot.options?.find((o) => o.value === value);

  return (
    <div ref={ref} className="inline-block relative mx-1">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-mono font-medium transition-all duration-150"
        style={{
          background: "var(--glass-bg-hover)",
          border: "1px solid var(--glass-border-strong)",
          color: "var(--text-primary)",
          backdropFilter: "blur(8px)",
          boxShadow: open
            ? "0 0 0 2px var(--glass-border), inset 0 1px 0 var(--glass-specular)"
            : "inset 0 1px 0 var(--glass-specular)",
        }}
      >
        <span>{selected?.label ?? value}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--text-subtle)" }}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1.5 z-50 min-w-[140px] rounded-xl overflow-hidden py-1"
          style={{
            background: "var(--glass-drawer-bg)",
            border: "1px solid var(--glass-border-strong)",
            backdropFilter: "blur(32px)",
            boxShadow: "0 16px 48px var(--glass-shadow-strong), inset 0 1px 0 var(--glass-specular)",
          }}
        >
          {slot.options?.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-[11px] font-mono transition-colors"
              style={{
                color: opt.value === value ? "var(--text-primary)" : "var(--text-muted)",
                background: opt.value === value ? "var(--glass-bg-hover)" : "transparent",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--glass-bg-hover)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = opt.value === value ? "var(--glass-bg-hover)" : "transparent";
                (e.currentTarget as HTMLElement).style.color = opt.value === value ? "var(--text-primary)" : "var(--text-muted)";
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Block template renderer ─────────────────────────────

function BlockWorkspace({
  block,
  values,
  onChange,
}: {
  block: BlockDefinition;
  values: Record<string, string>;
  onChange: (id: string, v: string) => void;
}) {
  const meta = CATEGORY_META[block.category];

  const parts = block.template.split(/(\{[a-z_]+\})/g);

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{
        background: "var(--glass-bg)",
        border: `1px solid ${meta.color}40`,
        boxShadow: `inset 0 1px 0 var(--glass-specular), 0 0 32px ${meta.glow}`,
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Category tag */}
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}` }}
        />
        <span className="text-[9px] font-mono tracking-widest" style={{ color: meta.color }}>
          {meta.label.toUpperCase()}
        </span>
      </div>

      {/* Template with inline slot dropdowns */}
      <div className="text-lg font-mono leading-loose flex flex-wrap items-center" style={{ color: "var(--text-muted)" }}>
        {parts.map((part, i) => {
          const match = part.match(/^\{([a-z_]+)\}$/);
          if (match) {
            const slotId = match[1];
            const slot = block.slots.find((s) => s.id === slotId);
            if (!slot) return null;
            return (
              <SlotDropdown
                key={i}
                slot={slot}
                value={values[slotId] ?? slot.defaultValue}
                onChange={(v) => onChange(slotId, v)}
              />
            );
          }
          return (
            <span key={i} className="mx-0.5" style={{ color: "var(--text-subtle)" }}>
              {part}
            </span>
          );
        })}
      </div>

      {/* Slot legend */}
      <div className="flex flex-wrap gap-2 pt-1" style={{ borderTop: "1px solid var(--glass-border)" }}>
        {block.slots.map((slot) => (
          <div key={slot.id} className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full" style={{ background: "var(--text-subtle)" }} />
            <span className="text-[9px] font-mono" style={{ color: "var(--text-faint)" }}>{slot.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main WidgetBuilder component ────────────────────────

export default function WidgetBuilder({ onClose, onWidgetCreated }: WidgetBuilderProps) {
  const [category, setCategory] = useState<Category>("all");
  const [selectedBlock, setSelectedBlock] = useState<BlockDefinition | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredBlocks =
    category === "all"
      ? BLOCK_REGISTRY
      : BLOCK_REGISTRY.filter((b) => b.category === category);

  function selectBlock(block: BlockDefinition) {
    setSelectedBlock(block);
    setError(null);
    const defaults: Record<string, string> = {};
    block.slots.forEach((s) => { defaults[s.id] = s.defaultValue; });
    setValues(defaults);
  }

  function updateSlot(id: string, v: string) {
    setValues((prev) => ({ ...prev, [id]: v }));
  }

  const sentence = selectedBlock ? selectedBlock.buildSentence(values) : "";

  async function generate() {
    if (!selectedBlock) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/widget-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sentence,
          blockId: selectedBlock.id,
          suggestedType: selectedBlock.suggestedType,
          suggestedSize: selectedBlock.suggestedSize,
          slotValues: values,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "Generation failed. Try again.");
        return;
      }
      onWidgetCreated(data.config as WidgetConfig);
      onClose();
    } catch (err) {
      setError("Network error. Check your connection.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Scrim */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      />

      {/* Window */}
      <div
        className="relative w-full max-w-4xl flex flex-col rounded-3xl overflow-hidden"
        style={{
          height: "min(82vh, 680px)",
          background: "var(--glass-drawer-bg)",
          border: "1px solid var(--glass-border-strong)",
          backdropFilter: "blur(40px) saturate(1.5)",
          boxShadow:
            "inset 0 1px 0 var(--glass-specular), 0 32px 80px var(--glass-shadow-strong), 0 0 0 1px var(--glass-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Specular top edge */}
        <div className="absolute top-0 left-12 right-12 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

        {/* ── Title bar ── */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid var(--glass-border)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(225,6,0,0.8), rgba(180,0,0,0.6))",
                boxShadow: "0 0 12px rgba(225,6,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="1" width="4" height="4" rx="1" fill="white" fillOpacity="0.9" />
                <rect x="7" y="1" width="4" height="4" rx="1" fill="white" fillOpacity="0.5" />
                <rect x="1" y="7" width="4" height="4" rx="1" fill="white" fillOpacity="0.5" />
                <rect x="7" y="7" width="4" height="4" rx="1" fill="white" fillOpacity="0.9" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide" style={{ color: "var(--text-primary)" }}>Widget Builder</h2>
              <p className="text-[9px] font-mono tracking-widest" style={{ color: "var(--text-faint)" }}>SELECT A BLOCK · FILL THE SLOTS · GENERATE</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: "var(--glass-bg-hover)", color: "var(--text-subtle)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-subtle)"; }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 min-h-0">

          {/* Left: Block palette */}
          <div
            className="w-56 sm:w-64 shrink-0 flex flex-col"
            style={{ borderRight: "1px solid var(--glass-border)" }}
          >
            {/* Category tabs */}
            <div className="flex flex-wrap gap-1 p-3 shrink-0" style={{ borderBottom: "1px solid var(--glass-border)" }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className="px-2.5 py-1 rounded-lg text-[9px] font-mono tracking-widest transition-all duration-150"
                  style={
                    category === cat.id
                      ? {
                          background: "var(--glass-bg-hover)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--glass-border-strong)",
                        }
                      : {
                          background: "transparent",
                          color: "var(--text-subtle)",
                          border: "1px solid transparent",
                        }
                  }
                >
                  {cat.label.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Block list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {filteredBlocks.map((block) => {
                const meta = CATEGORY_META[block.category];
                const active = selectedBlock?.id === block.id;
                return (
                  <button
                    key={block.id}
                    onClick={() => selectBlock(block)}
                    className="w-full text-left p-3 rounded-xl transition-all duration-200"
                    style={{
                      background: active ? "var(--glass-bg-hover)" : "var(--glass-bg)",
                      border: `1px solid ${active ? meta.color + "50" : "var(--glass-border)"}`,
                      boxShadow: active ? `0 0 12px ${meta.glow}` : "none",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: meta.color }}
                      />
                      <span className="text-[11px] font-mono font-medium truncate" style={{ color: "var(--text-muted)" }}>
                        {block.label}
                      </span>
                    </div>
                    <p className="text-[9px] font-mono leading-relaxed pl-3.5" style={{ color: "var(--text-subtle)" }}>
                      {block.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Workspace */}
          <div className="flex-1 flex flex-col min-w-0 p-4 sm:p-6">
            {selectedBlock ? (
              <>
                <BlockWorkspace
                  block={selectedBlock}
                  values={values}
                  onChange={updateSlot}
                />
                {/* Sentence preview */}
                <div
                  className="mt-4 p-4 rounded-xl"
                  style={{
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  <p className="text-[9px] font-mono tracking-widest mb-2" style={{ color: "var(--text-faint)" }}>ASSEMBLED REQUEST</p>
                  <p className="text-sm font-mono leading-relaxed" style={{ color: "var(--text-muted)" }}>"{sentence}"</p>
                </div>
              </>
            ) : (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--glass-bg-hover)", border: "1px solid var(--glass-border)" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-subtle)" }}>
                    <rect x="2" y="2" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="14" y="2" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="2" y="14" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="14" y="14" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-mono" style={{ color: "var(--text-muted)" }}>Select a block</p>
                  <p className="text-[10px] font-mono mt-1" style={{ color: "var(--text-faint)" }}>Choose from the left to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer: Generate button ── */}
        <div
          className="shrink-0 px-5 py-4 flex items-center justify-between gap-4"
          style={{ borderTop: "1px solid var(--glass-border)" }}
        >
          {error ? (
            <p className="text-[11px] font-mono text-red-400 flex-1">{error}</p>
          ) : (
            <p className="text-[9px] font-mono flex-1 tracking-widest" style={{ color: "var(--text-faint)" }}>
              {selectedBlock ? "POWERED BY GEMINI 2.5 FLASH" : "PICK A BLOCK TO BEGIN"}
            </p>
          )}
          <button
            onClick={generate}
            disabled={!selectedBlock || generating}
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: selectedBlock && !generating ? "#E10600" : "var(--glass-bg-hover)",
              color: selectedBlock && !generating ? "#FFFFFF" : "var(--text-muted)",
              boxShadow:
                selectedBlock && !generating
                  ? "0 0 20px rgba(225,6,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)"
                  : "none",
            }}
          >
            {generating ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Generating…</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L9 5.5H13.5L10 8.5L11.5 13L7 10.5L2.5 13L4 8.5L0.5 5.5H5L7 1Z" fill="currentColor" fillOpacity="0.9" />
                </svg>
                <span>Generate Widget</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
