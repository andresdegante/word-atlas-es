import { Bookmark, BookmarkCheck, Lightbulb, Share2 } from "lucide-react";
import type { Entry, WordRef } from "../atlas/types";
import { useAtlas } from "../atlas/context";
import { topicName } from "../lib/i18n";
import { splitHighlight, splitPair } from "../lib/text";
import { formatInterval, isMastered } from "../store/srs";
import { toggleBookmark, useLang, useStore, useT } from "../store/store";
import { Illustration } from "./Illustration";
import { Speak } from "./Speak";
import { shareWord } from "./share";
import { openWord } from "../lib/router";

export function Highlight({ text, word }: { text: string; word: string }) {
  const parts = splitHighlight(text, word);
  if (!parts) return <>{text}</>;
  return (
    <>
      {parts[0]}
      <mark>{parts[1]}</mark>
      {parts[2]}
    </>
  );
}

export function Pronounce({ entry, refw }: { entry: Entry; refw: WordRef | Entry }) {
  const atlas = useAtlas();
  const accent = useStore((s) => s.settings.accent);
  const t = useT();
  const both = entry.uk && entry.us && entry.uk !== entry.us;
  const items: ["uk" | "us", string, string][] = both
    ? [["uk", t.entry.uk, entry.uk], ["us", t.entry.us, entry.us]]
    : [[accent, accent === "uk" ? t.entry.uk : t.entry.us, entry.uk || entry.us]];
  if (!both && items[0][2] === "") return null;
  return (
    <div className="pron">
      {(accent === "us" ? [...items].reverse() : items).map(([acc, label, ipa]) => (
        <Speak
          key={acc}
          url={atlas.audio(refw, acc)}
          text={entry.w}
          accent={acc}
          size="sm"
          label={
            <>
              <em>{label}</em>
              <span className="ipa">{ipa}</span>
            </>
          }
        />
      ))}
    </div>
  );
}

export function EntryView({ entry, mode = "detail", eager = true }: { entry: Entry; mode?: "detail" | "intro" | "reveal"; eager?: boolean }) {
  const atlas = useAtlas();
  const ref = atlas.byId.get(entry.id);
  const card = useStore((s) => s.progress.cards[entry.id]);
  const saved = useStore((s) => s.progress.bookmarks.includes(entry.id));
  const accent = useStore((s) => s.settings.accent);
  const lang = useLang();
  const t = useT();
  const topicIdx = atlas.topics.findIndex((tp) => tp[0] === entry.topic);
  const topic = atlas.topics[topicIdx];
  const exUrls = [atlas.audio(entry, "ex"), atlas.audio(entry, "ex2")];
  const famLinks = entry.fam.map((f) => {
    const w = f.replace(/\s*\(.*\)\s*$/, "").trim().toLowerCase();
    const hit = atlas.words.find((x) => x.word.toLowerCase() === w);
    return { label: f, id: hit?.id };
  });
  const mastered = card ? isMastered(card) : false;
  const status = card ? (mastered ? t.entry.mastered : t.entry.learning) : null;

  return (
    <article className={`entry entry-${mode}`}>
      <div className="entry-art">
        <Illustration src={atlas.img(entry)} word={entry.w} topic={topicIdx} eager={eager} alt={t.entry.illustrationAlt(entry.w)} />
      </div>
      <div className="entry-body">
        <header className="entry-head">
          <div className="entry-tags">
            <span className={`chip chip-level lv-${entry.cefr}`}>{entry.cefr}</span>
            {topic && <span className="chip">{topicName(lang, topic[0], topic[1])}</span>}
            {status && <span className={`chip chip-status ${mastered ? "is-done" : ""}`}>{status}</span>}
          </div>
          {mode === "detail" && (
            <div className="entry-actions">
              <button className={`icon-btn ${saved ? "is-on" : ""}`} onClick={() => toggleBookmark(entry.id)} aria-pressed={saved} aria-label={saved ? t.entry.unsave : t.entry.save} title={saved ? t.entry.unsave : t.entry.save}>
                {saved ? <BookmarkCheck size={19} /> : <Bookmark size={19} />}
              </button>
              <button className="icon-btn" onClick={() => shareWord(atlas, entry)} aria-label={t.entry.share} title={t.entry.share}>
                <Share2 size={19} />
              </button>
            </div>
          )}
        </header>
        {ref && (
          <p className="specimen">
            № {String(ref.order + 1).padStart(4, "0")}
            <i />
            Word Atlas
          </p>
        )}
        <h2 className="headword" lang="en">
          {entry.w}
        </h2>
        <Pronounce entry={entry} refw={ref ?? entry} />

        <ol className="senses">
          {entry.senses.map((s, i) => (
            <li key={i}>
              <span className="pos">{s.pos}</span>
              {lang === "zh" ? (
                <>
                  <span className="zh">{s.zh}</span>
                  {s.en && (
                    <span className="en" lang="en">
                      {s.en}
                    </span>
                  )}
                </>
              ) : (
                <span className="zh" lang="en">
                  {s.en || s.zh}
                </span>
              )}
            </li>
          ))}
        </ol>

        {entry.ex.length > 0 && (
          <section className="block">
            <h3 className="eyebrow">{t.entry.examples}</h3>
            <ul className="examples">
              {entry.ex.map((x, i) => (
                <li key={i}>
                  {entry.ex.length > 1 && <span className={`ex-tag ${i ? "is-ielts" : ""}`}>{i ? t.entry.ieltsCtx : t.entry.dailyCtx}</span>}
                  <p className="ex-en" lang="en">
                    <Highlight text={x.en} word={entry.w} />
                    <Speak url={exUrls[i] ?? null} text={x.en} accent={i === 1 && exUrls[1] ? "us" : accent} size="sm" className="ex-speak" />
                  </p>
                  {lang === "zh" && <p className="ex-zh">{x.zh}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {entry.col.length > 0 && (
          <section className="block">
            <h3 className="eyebrow">{t.entry.collocations}</h3>
            <ul className="collocations">
              {entry.col.map((c) => {
                const { en, zh } = splitPair(c);
                return (
                  <li key={c}>
                    <span lang="en">{en}</span>
                    {lang === "zh" && zh && <small>{zh}</small>}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {(famLinks.length > 0 || entry.syn.length > 0 || entry.ant.length > 0) && (
          <section className="block relations">
            {famLinks.length > 0 && (
              <div>
                <h3 className="eyebrow">{t.entry.wordFamily}</h3>
                <p>
                  {famLinks.map((f) =>
                    f.id && mode === "detail" ? (
                      <button key={f.label} className="link" onClick={() => openWord(f.id!)}>
                        {f.label}
                      </button>
                    ) : (
                      <span key={f.label}>{f.label}</span>
                    ),
                  )}
                </p>
              </div>
            )}
            {entry.syn.length > 0 && (
              <div>
                <h3 className="eyebrow">{t.entry.synonyms}</h3>
                <p>{entry.syn.map((s) => <span key={s}>{s}</span>)}</p>
              </div>
            )}
            {entry.ant.length > 0 && (
              <div>
                <h3 className="eyebrow">{t.entry.antonyms}</h3>
                <p>{entry.ant.map((s) => <span key={s}>{s}</span>)}</p>
              </div>
            )}
          </section>
        )}

        {lang === "zh" && entry.tip && (
          <aside className="tip">
            <Lightbulb size={17} strokeWidth={1.8} />
            <p>{entry.tip}</p>
          </aside>
        )}

        {entry.note && (
          <p className="usage-note">
            {t.entry.usageNote}
            {entry.note}
          </p>
        )}

        {mode === "detail" && card && (
          <p className="memory-note">
            {card.due <= Date.now() ? t.entry.reviewNow : t.entry.nextReview(formatInterval(card.due - Date.now(), lang))} · {t.entry.stability(card.s < 1 ? "<1" : String(Math.round(card.s)))} · {t.entry.reps(card.reps)}
          </p>
        )}
      </div>
    </article>
  );
}
