import { ArrowRight, Flame, Keyboard, Sparkles } from "lucide-react";
import { useEffect, useMemo } from "react";
import { prefetch, useAtlas, useEntry } from "../atlas/context";
import { formatDateHeader, greetingForHour, LEVEL_NAMES, topicName, WEEKDAYS } from "../lib/i18n";
import { go, openWord } from "../lib/router";
import { cue } from "../lib/sound";
import { hashSeed } from "../lib/text";
import { buildSession, masteredCount, todayPlan } from "../store/session";
import { isMastered } from "../store/srs";
import { dayKey, store, useLang, useStore, useT } from "../store/store";
import { Galaxy } from "../galaxy/Galaxy";
import { Highlight, Pronounce } from "../ui/EntryView";
import { Illustration } from "../ui/Illustration";
import { Ring } from "../ui/Ring";

const BRAND = `${import.meta.env.BASE_URL}brand`;

export function streakOf(days: Record<string, { r: number }>) {
  let n = 0;
  const d = new Date();
  if (!(days[dayKey(d)]?.r > 0)) d.setDate(d.getDate() - 1);
  while (days[dayKey(d)]?.r > 0) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function Today() {
  const atlas = useAtlas();
  const progress = useStore((s) => s.progress);
  const settings = useStore((s) => s.settings);
  const lang = useLang();
  const t = useT();
  const plan = useMemo(() => todayPlan(atlas, progress, settings), [atlas, progress, settings]);
  const firstIds = [...plan.due.slice(0, 4), ...plan.fresh.slice(0, 6)].join(",");
  useEffect(() => {
    const ids = firstIds.split(",").filter(Boolean);
    const timer = window.setTimeout(() => void prefetch(atlas, ids), 800);
    return () => window.clearTimeout(timer);
  }, [atlas, firstIds]);
  const now = new Date();
  const today = progress.days[dayKey()];
  const streak = streakOf(progress.days);
  const active = progress.session && !progress.session.finished ? progress.session : null;
  const total = plan.due.length + plan.fresh.length;
  const goal = settings.dailyNew + Math.min(plan.due.length, 60);
  const doneToday = today?.r ?? 0;

  const start = (opts?: { reviewOnly?: boolean; extra?: number }) => {
    if (!active) {
      const s = buildSession(atlas, progress, opts?.extra ? { ...settings, dailyNew: (today?.n ?? 0) + opts.extra } : settings, { reviewOnly: opts?.reviewOnly });
      if (!s.steps.length) return;
      store.progress((p) => ({ ...p, session: s }));
    }
    if (settings.sfx) void cue("start");
    go({ page: "learn" });
  };

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const k = dayKey(d);
    return { k, label: WEEKDAYS[lang][d.getDay()], v: progress.days[k]?.r ?? 0, today: i === 6 };
  });

  const learned = Object.keys(progress.cards).length;
  const mastered = masteredCount(progress);
  const teaser = (active ? active.newIds : plan.fresh).slice(0, 5).map((id) => atlas.byId.get(id)!).filter(Boolean);

  return (
    <div className="page today">
      <header className="greet">
        <p className="eyebrow">{formatDateHeader(lang, now)}</p>
        <h1 className="display">{greetingForHour(lang, now.getHours())}</h1>
      </header>

      <section className={`journey ${total === 0 && !active ? "is-clear" : ""}`}>
        <img className="journey-art" src={`${BRAND}/hero.webp`} alt="" fetchPriority="high" />
        <div className="journey-body">
          {active ? (
            <>
              <p className="eyebrow eyebrow-light">{t.today.inProgress}</p>
              <h2>
                {t.today.stepsLeft[0]}
                <b>{active.steps.length - active.index}</b>
                {t.today.stepsLeft[1]}
              </h2>
              <p className="journey-lede">{t.today.savedLede}</p>
            </>
          ) : total > 0 ? (
            <>
              <p className="eyebrow eyebrow-light">{t.today.todayJourney}</p>
              <h2>
                {plan.due.length > 0 && (
                  <>
                    {t.today.reviewLabel} <b>{plan.due.length}</b>
                  </>
                )}
                {plan.due.length > 0 && plan.fresh.length > 0 && <i> · </i>}
                {plan.fresh.length > 0 && (
                  <>
                    {t.today.newLabel} <b>{plan.fresh.length}</b>
                  </>
                )}
              </h2>
              <p className="journey-lede">{t.today.journeyLede(plan.minutes)}</p>
            </>
          ) : (
            <>
              <p className="eyebrow eyebrow-light">{t.today.doneEyebrow}</p>
              <h2>{t.today.doneTitle}</h2>
              <p className="journey-lede">{t.today.doneLede}</p>
            </>
          )}
          {teaser.length > 0 && (
            <div className="teaser" aria-label={t.today.teaserAria}>
              {teaser.map((w, i) => (
                <Illustration key={w.id} src={atlas.img(w, "thumb")} word={w.word} topic={w.topic} className={`teaser-${i}`} />
              ))}
              <span>{t.today.teaserLabel}</span>
            </div>
          )}
          <div className="journey-actions">
            {active || total > 0 ? (
              <button className="btn btn-primary btn-xl" onClick={() => start()}>
                {active ? t.today.continueBtn : t.today.startBtn} <ArrowRight size={20} />
              </button>
            ) : (
              <button className="btn btn-primary btn-xl" onClick={() => start({ extra: 5 })}>
                {t.today.extraBtn} <Sparkles size={18} />
              </button>
            )}
            {!active && plan.due.length > 0 && plan.fresh.length > 0 && (
              <button className="btn btn-glass" onClick={() => start({ reviewOnly: true })}>
                {t.today.reviewOnlyBtn}
              </button>
            )}
            {!active && total === 0 && (
              <button className="btn btn-glass" onClick={() => go({ page: "practice" })}>
                <Keyboard size={18} /> {t.today.typingBtn}
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="today-grid">
        <WordOfDay />

        <section className="panel streak-panel">
          <div className="panel-head">
            <h3 className="eyebrow">{t.today.thisWeek}</h3>
            <span className={`streak ${streak ? "is-on" : ""}`}>
              <Flame size={16} /> {t.today.streakDays(streak)}
            </span>
          </div>
          <div className="streak-body">
            <Ring value={goal ? doneToday / goal : 0} size={112} stroke={8} tone="terra">
              <b>{doneToday}</b>
              <small>{t.today.answeredToday}</small>
            </Ring>
            <ol className="week">
              {week.map((d) => (
                <li key={d.k} className={`${d.v ? "is-on" : ""} ${d.today ? "is-today" : ""}`} title={`${d.k}: ${d.v} ${t.today.questionsUnit}`}>
                  <span style={{ "--h": Math.min(1, d.v / 40) } as React.CSSProperties} />
                  <small>{d.label}</small>
                </li>
              ))}
            </ol>
          </div>
          <dl className="mini-stats">
            <div>
              <dt>{t.today.lit}</dt>
              <dd>{learned.toLocaleString()}</dd>
            </div>
            <div>
              <dt>{t.today.mastered}</dt>
              <dd>{mastered.toLocaleString()}</dd>
            </div>
            <div>
              <dt>{t.today.totalWords}</dt>
              <dd>{atlas.count.toLocaleString()}</dd>
            </div>
          </dl>
        </section>

        <LevelPath />
        <GalaxyPanel learned={learned} total={atlas.count} />
        <Topics />
      </div>
    </div>
  );
}

function GalaxyPanel({ learned, total }: { learned: number; total: number }) {
  const today = useStore((s) => s.progress.days[dayKey()]);
  const ids = useStore((s) => s.progress.cards);
  const t = useT();
  const todayIds = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Object.entries(ids)
      .filter(([, c]) => c.seen >= start.getTime())
      .map(([id]) => id);
  }, [ids]);
  void today;
  return (
    <section className="galaxy-panel" onClick={() => go({ page: "atlas", view: "galaxy" })} role="link" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && go({ page: "atlas", view: "galaxy" })}>
      <Galaxy mode="mini" highlight={todayIds} />
      <div className="galaxy-panel-copy">
        <p className="eyebrow eyebrow-light">{t.today.galaxyEyebrow}</p>
        <h3>
          {t.today.galaxyTitle[0]}
          <b>{learned.toLocaleString()}</b>
          {t.today.galaxyTitle[1]}
        </h3>
        <p>{learned ? t.today.galaxyDescLit((total - learned).toLocaleString()) : t.today.galaxyDescEmpty(total.toLocaleString())}</p>
        <span className="btn btn-glass">
          {t.today.enterGalaxy} <ArrowRight size={18} />
        </span>
      </div>
    </section>
  );
}

function WordOfDay() {
  const atlas = useAtlas();
  const lang = useLang();
  const t = useT();
  const pick = useMemo(() => {
    const pool = atlas.words.filter((w) => w.cefr >= 2 && w.media & 1);
    const list = pool.length ? pool : atlas.words;
    return list[hashSeed(dayKey()) % list.length];
  }, [atlas]);
  const { entry } = useEntry(pick?.id);
  if (!pick) return null;
  const meaning = lang === "zh" ? pick.zh : entry?.senses[0] ? `${entry.senses[0].pos} ${entry.senses[0].en || entry.senses[0].zh}` : pick.zh;
  return (
    <section className="panel wotd" onClick={() => openWord(pick.id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && openWord(pick.id)} aria-label={`${t.today.wotd}: ${pick.word}`}>
      <Illustration src={atlas.img(pick)} word={pick.word} topic={pick.topic} className="wotd-art" />
      <div className="wotd-body">
        <h3 className="eyebrow">{t.today.wotd}</h3>
        <p className="wotd-word" lang="en">
          {pick.word}
        </p>
        {entry && (
          <div onClick={(e) => e.stopPropagation()}>
            <Pronounce entry={entry} refw={pick} />
          </div>
        )}
        <p className="wotd-zh">{meaning}</p>
        {entry?.ex[0] && (
          <p className="wotd-ex" lang="en">
            <Highlight text={entry.ex[0].en} word={entry.w} />
          </p>
        )}
      </div>
    </section>
  );
}

function LevelPath() {
  const atlas = useAtlas();
  const cards = useStore((s) => s.progress.cards);
  const start = useStore((s) => s.settings.startLevel);
  const lang = useLang();
  const t = useT();
  const levels = useMemo(() => {
    const out = atlas.cefr.map((name) => ({ name, total: 0, seen: 0, mastered: 0 }));
    for (const w of atlas.words) {
      const l = out[w.cefr];
      l.total++;
      const c = cards[w.id];
      if (c) {
        l.seen++;
        if (isMastered(c)) l.mastered++;
      }
    }
    return out;
  }, [atlas, cards]);
  const names = LEVEL_NAMES[lang];
  return (
    <section className="panel path-panel">
      <div className="panel-head">
        <h3 className="eyebrow">{t.today.pathTitle}</h3>
        <span className="legend">
          <i className="lg-seen" /> {t.today.legendSeen} <i className="lg-done" /> {t.today.legendDone}
        </span>
      </div>
      <ol className="route">
        {levels.map((l, i) => {
          const seen = l.seen / Math.max(1, l.total);
          const done = l.mastered / Math.max(1, l.total);
          return (
            <li key={l.name} className={`${i === start ? "is-start" : ""} ${l.seen ? "is-on" : ""}`}>
              <button onClick={() => go({ page: "atlas", level: l.name })} aria-label={`${l.name} ${names[i]}, ${l.seen} / ${l.total}`}>
                <span className="station" style={{ "--seen": seen, "--done": done } as React.CSSProperties}>
                  <b>{l.name}</b>
                </span>
                <span className="station-name">{names[i]}</span>
                <span className="station-count">
                  {l.seen}
                  <small>/{l.total}</small>
                </span>
                {i === start && <span className="station-flag">{t.today.startFlag}</span>}
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Topics() {
  const atlas = useAtlas();
  const lang = useLang();
  const t = useT();
  const counts = useMemo(() => {
    const c = new Array(atlas.topics.length).fill(0);
    atlas.words.forEach((w) => c[w.topic]++);
    return c;
  }, [atlas]);
  return (
    <section className="topics-panel">
      <div className="panel-head">
        <h3 className="eyebrow">{t.today.exploreTopics}</h3>
        <button className="link" onClick={() => go({ page: "atlas" })}>
          {t.today.openAtlas}
        </button>
      </div>
      <ul className="topic-tiles">
        {atlas.topics.map(([key, name], i) => (
          <li key={key}>
            <button onClick={() => go({ page: "atlas", topic: key })}>
              <img src={`${BRAND}/topic-${key}.webp`} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
              <span>
                <b>{topicName(lang, key, name)}</b>
                <small>{t.today.wordsCount(counts[i])}</small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
