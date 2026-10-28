import { Headphones, Keyboard, RotateCcw, Type } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { prefetch, useAtlas } from "../atlas/context";
import type { Entry } from "../atlas/types";
import { play, stopAudio } from "../lib/audio";
import { cue } from "../lib/sound";
import { hashSeed, shuffle } from "../lib/text";
import { clean, correctCharacterCount, same, typingDelta, typingMetrics } from "../lib/typing";
import { store, useLang, useStore, useT } from "../store/store";
import { AmbiencePicker } from "../ui/Ambience";
import { Illustration } from "../ui/Illustration";

type Mode = "word" | "sentence" | "dictation";
type Source = "recent" | "mistakes" | "saved" | "path";

export function Practice() {
  const atlas = useAtlas();
  const progress = useStore((s) => s.progress);
  const startLevel = useStore((s) => s.settings.startLevel);
  const t = useT();
  const [mode, setMode] = useState<Mode>("word");
  const [source, setSource] = useState<Source>(() => (Object.keys(progress.cards).length ? "recent" : "path"));
  const [round, setRound] = useState<{ entries: Entry[]; key: number } | null>(null);

  const modes: [Mode, string, string, typeof Type][] = [
    ["word", t.practice.modes.word[0], t.practice.modes.word[1], Type],
    ["sentence", t.practice.modes.sentence[0], t.practice.modes.sentence[1], Keyboard],
    ["dictation", t.practice.modes.dictation[0], t.practice.modes.dictation[1], Headphones],
  ];
  const sources: [Source, string][] = [
    ["recent", t.practice.sources.recent],
    ["mistakes", t.practice.sources.mistakes],
    ["saved", t.practice.sources.saved],
    ["path", t.practice.sources.path],
  ];

  const pool = useMemo(() => {
    const learned = Object.entries(progress.cards)
      .sort((a, b) => (b[1].last ?? 0) - (a[1].last ?? 0))
      .map(([id]) => id);
    const ids =
      source === "recent" ? learned : source === "mistakes" ? progress.mistakes : source === "saved" ? progress.bookmarks : atlas.words.filter((w) => w.cefr >= startLevel).slice(0, 400).map((w) => w.id);
    return ids.filter((id) => atlas.byId.has(id));
  }, [atlas, progress.cards, progress.mistakes, progress.bookmarks, source, startLevel]);

  const start = async () => {
    const ids = shuffle(pool.slice(0, 60), hashSeed(String(Date.now()))).slice(0, 10);
    const entries = (await prefetch(atlas, ids)).filter((e): e is Entry => !!e && (mode === "word" || e.ex.length > 0));
    if (entries.length) setRound({ entries, key: Date.now() });
  };

  if (round) return <TypingRound key={round.key} mode={mode} entries={round.entries} onExit={() => setRound(null)} onAgain={start} />;

  const best = progress.typing.filter((x) => x.mode === mode).reduce((m, x) => Math.max(m, x.wpm), 0);
  return (
    <div className="page practice">
      <header className="page-head">
        <p className="eyebrow">{t.practice.eyebrow}</p>
        <h1 className="display">{t.practice.title}</h1>
        <p className="lede">{t.practice.lede}</p>
      </header>
      <div className="practice-grid">
        <section className="panel">
          <h3 className="eyebrow">{t.practice.modeHeader}</h3>
          <div className="mode-cards">
            {modes.map(([k, name, desc, Icon]) => (
              <button key={k} className={`mode-card ${mode === k ? "is-on" : ""}`} onClick={() => setMode(k)} aria-pressed={mode === k}>
                <Icon size={22} strokeWidth={1.7} />
                <b>{name}</b>
                <small>{desc}</small>
              </button>
            ))}
          </div>
          <h3 className="eyebrow">{t.practice.sourceHeader}</h3>
          <div className="segmented segmented-wide">
            {sources.map(([k, label]) => (
              <button key={k} className={source === k ? "is-on" : ""} onClick={() => setSource(k)} aria-pressed={source === k}>
                {label}
              </button>
            ))}
          </div>
          <p className="muted">
            {pool.length
              ? source === "path"
                ? t.practice.poolPathHint
                : t.practice.poolCountHint(pool.length)
              : t.practice.poolEmptyHint}
          </p>
          <button className="btn btn-primary btn-xl" onClick={start} disabled={!pool.length}>
            {t.practice.startRound}
          </button>
        </section>
        <section className="panel practice-side">
          <img src={`${import.meta.env.BASE_URL}brand/${mode === "dictation" ? "listen" : "typing"}.webp`} alt="" />
          <dl className="mini-stats">
            <div>
              <dt>{t.practice.bestSpeed}</dt>
              <dd>
                {best}
                <small>WPM</small>
              </dd>
            </div>
            <div>
              <dt>{t.practice.roundsDone}</dt>
              <dd>{progress.typing.length}</dd>
            </div>
          </dl>
          <p className="muted">{t.practice.wpmNote}</p>
        </section>
      </div>
    </div>
  );
}

function TypingRound({ mode, entries, onExit, onAgain }: { mode: Mode; entries: Entry[]; onExit: () => void; onAgain: () => void }) {
  const atlas = useAtlas();
  const settings = useStore((s) => s.settings);
  const lang = useLang();
  const t = useT();
  const [i, setI] = useState(0);
  const [value, setValue] = useState("");
  const totalsRef = useRef({ typed: 0, correct: 0, accepted: 0, ms: 0 });
  const [totals, setTotals] = useState(totalsRef.current);
  const [done, setDone] = useState(false);
  const started = useRef<number | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const e = entries[i];
  const target = mode === "word" ? e.w : e.ex[0].en;

  useEffect(() => {
    setValue("");
    started.current = null;
    input.current?.focus();
    if (mode === "dictation") void play(atlas.audio(e, "ex"), e.ex[0].en, settings.accent);
    if (mode === "word" && settings.autoplay) void play(atlas.audio(e, settings.accent), e.w, settings.accent);
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => stopAudio(), []);

  const onChange = (next: string) => {
    if (done) return;
    if (started.current === null && next) started.current = performance.now();
    const d = typingDelta(value, next, target);
    if (settings.sfx && d.total > 0) void cue("key");
    const cur = totalsRef.current;
    totalsRef.current = { ...cur, typed: cur.typed + d.total, correct: cur.correct + d.correct };
    setTotals(totalsRef.current);
    setValue(next);
    if (clean(next).length >= clean(target).length && same(next.trimEnd(), target)) finishItem(next);
  };

  const finishItem = (final: string) => {
    const ms = started.current ? performance.now() - started.current : 0;
    const accepted = correctCharacterCount(final, target);
    if (settings.sfx) void cue("correct");
    const cur = totalsRef.current;
    const nt = { ...cur, accepted: cur.accepted + accepted, ms: cur.ms + ms };
    totalsRef.current = nt;
    setTotals(nt);
    if (i + 1 >= entries.length) {
      setDone(true);
      const m = typingMetrics(nt.correct, nt.typed, nt.accepted, nt.ms);
      store.progress((p) => ({ ...p, typing: [...p.typing, { at: Date.now(), mode, items: entries.length, wpm: m.wpm, accuracy: m.accuracy }].slice(-500) }));
    } else window.setTimeout(() => setI(i + 1), 260);
  };

  const m = typingMetrics(totals.correct, totals.typed, totals.accepted, totals.ms);
  const chars = Array.from(target);
  const typed = Array.from(value);
  const meaning = lang === "zh" ? e.senses[0].zh : e.senses[0].en || e.senses[0].zh;

  if (done)
    return (
      <div className="page practice">
        <section className="panel typing-done">
          <p className="eyebrow">{t.practice.roundDone}</p>
          <h1 className="display">
            {m.wpm} <small>WPM</small>
          </h1>
          <p className="lede">{t.practice.accuracyLine(m.accuracy, entries.length)}</p>
          <div className="summary-actions">
            <button className="btn btn-ghost" onClick={onExit}>
              {t.practice.backBtn}
            </button>
            <button className="btn btn-primary btn-xl" onClick={onAgain} autoFocus>
              <RotateCcw size={18} /> {t.practice.againBtn}
            </button>
          </div>
        </section>
      </div>
    );

  return (
    <div className="page practice typing">
      <header className="typing-top">
        <button className="btn btn-ghost" onClick={onExit}>
          {t.practice.endBtn}
        </button>
        <AmbiencePicker />
        <div className="learn-progress">
          <span style={{ width: `${(i / entries.length) * 100}%` }} />
        </div>
        <span className="typing-meter">
          <b>{m.wpm}</b> WPM · <b>{m.accuracy}%</b>
        </span>
      </header>
      <section className="typing-stage" onClick={() => input.current?.focus()}>
        {mode === "word" && (
          <div className="typing-cue">
            <Illustration src={atlas.img(e)} word={e.w} topic={0} eager />
            <p>
              <span className="pos">{e.senses[0].pos}</span> {meaning}
            </p>
          </div>
        )}
        {mode !== "word" && (
          <p className="typing-zh">
            {mode === "dictation" && (
              <button className="link" onClick={() => play(atlas.audio(e, "ex"), e.ex[0].en, settings.accent)}>
                {t.practice.listenAgain}
              </button>
            )}
            {lang === "zh" ? e.ex[0].zh : `${e.w}: ${meaning}`}
          </p>
        )}
        <p className={`typing-text ${mode === "word" ? "is-word" : ""} ${mode === "dictation" ? "is-hidden" : ""}`} lang="en" aria-hidden="true">
          {chars.map((ch, k) => {
            const chTyped = typed[k];
            const cls = chTyped === undefined ? (k === typed.length ? "is-caret" : "") : same(chTyped, ch) ? "is-ok" : "is-bad";
            const show = mode === "dictation" && chTyped === undefined ? (ch === " " ? " " : /[A-Za-z]/.test(ch) ? "·" : ch) : ch;
            return (
              <span key={k} className={cls}>
                {show}
              </span>
            );
          })}
        </p>
        <input
          ref={input}
          className="typing-input"
          value={value}
          onChange={(ev) => onChange(ev.target.value)}
          autoFocus
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          aria-label={t.practice.inputAria}
        />
        <p className="muted typing-help">
          {mode === "dictation" ? t.practice.dictationHelp : t.practice.typingHelp} {t.practice.itemCount(i + 1, entries.length)}
        </p>
      </section>
    </div>
  );
}
