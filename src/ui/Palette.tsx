import { CornerDownLeft, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Atlas, WordRef } from "../atlas/types";
import { useAtlas } from "../atlas/context";
import { topicName } from "../lib/i18n";
import { openWord } from "../lib/router";
import { useLang, useT } from "../store/store";
import { Illustration } from "./Illustration";

export function searchAtlas(atlas: Atlas, raw: string, limit = 40): WordRef[] {
  const q = raw.trim().toLowerCase();
  if (!q) return [];
  const zh = /[一-鿿]/.test(q);
  const hits: [number, WordRef][] = [];
  for (const w of atlas.words) {
    let score = 0;
    if (zh) {
      const i = w.zh.indexOf(q);
      if (i >= 0) score = 60 - Math.min(40, i) - w.zh.length * 0.2;
    } else {
      const word = w.word.toLowerCase();
      if (word === q) score = 1000;
      else if (word.startsWith(q)) score = 500 - word.length;
      else if (word.includes(q)) score = 200 - word.indexOf(q) - word.length;
      else {
        const peeked = atlas.peek(w.id);
        if (peeked?.senses[0]?.en.toLowerCase().includes(q)) score = 90;
      }
    }
    if (score > 0) hits.push([score, w]);
  }
  hits.sort((a, b) => b[0] - a[0] || a[1].order - b[1].order);
  return hits.slice(0, limit).map((h) => h[1]);
}

export function Palette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const atlas = useAtlas();
  const lang = useLang();
  const t = useT();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchAtlas(atlas, q, 30), [atlas, q]);
  useEffect(() => {
    if (open) {
      setQ("");
      setSel(0);
      requestAnimationFrame(() => input.current?.focus());
    }
  }, [open]);
  useEffect(() => setSel(0), [q]);
  if (!open) return null;
  const pick = (w: WordRef) => {
    onClose();
    openWord(w.id);
  };
  return (
    <div className="palette-root" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="palette" role="dialog" aria-modal="true" aria-label={t.palette.dialogAria}>
        <label className="palette-input">
          <Search size={20} />
          <input
            ref={input}
            value={q}
            placeholder={t.palette.placeholder}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSel((s) => Math.min(results.length - 1, s + 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setSel((s) => Math.max(0, s - 1));
              }
              if (e.key === "Enter" && results[sel]) pick(results[sel]);
            }}
            aria-controls="palette-list"
            aria-activedescendant={results[sel] ? `pal-${results[sel].id}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd>Esc</kbd>
        </label>
        <ul id="palette-list" className="palette-list" role="listbox">
          {results.map((w, i) => {
            const peeked = atlas.peek(w.id);
            const topic = atlas.topics[w.topic];
            const sub = lang === "zh" ? w.zh : peeked?.senses[0]?.en ? `${peeked.senses[0].pos} ${peeked.senses[0].en}` : `${w.ipa} · ${topic ? topicName(lang, topic[0], topic[1]) : ""}`;
            return (
              <li
                key={w.id}
                id={`pal-${w.id}`}
                role="option"
                aria-selected={i === sel}
                className={i === sel ? "is-sel" : ""}
                onMouseEnter={() => setSel(i)}
                onClick={() => pick(w)}
              >
                <Illustration src={atlas.img(w, "thumb")} word={w.word} topic={w.topic} className="palette-thumb" />
                <span className="palette-word" lang="en">
                  {w.word}
                </span>
                <span className="palette-zh">{sub}</span>
                {i === sel && <CornerDownLeft size={15} className="palette-enter" />}
              </li>
            );
          })}
          {q && !results.length && <li className="palette-empty">{t.palette.empty(q)}</li>}
          {!q && (
            <li className="palette-hint">
              {t.palette.hint(atlas.count.toLocaleString())}
              <kbd>↑</kbd>
              <kbd>↓</kbd> {t.palette.selectKey} <kbd>↵</kbd> {t.palette.openKey}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
