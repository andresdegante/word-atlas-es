import { Download, RotateCcw, Upload } from "lucide-react";
import { useMemo, useRef } from "react";
import { useAtlas } from "../atlas/context";
import type { Lang } from "../lib/i18n";
import { isMastered } from "../store/srs";
import { dayKey, exportBackup, importBackup, resetProgress, store, useStore, useT, type Settings } from "../store/store";
import { toast } from "../ui/Toast";
import { streakOf } from "./Today";

export function Me({ privateAvailable }: { privateAvailable: boolean }) {
  const atlas = useAtlas();
  const progress = useStore((s) => s.progress);
  const settings = useStore((s) => s.settings);
  const saveError = useStore((s) => s.saveError);
  const t = useT();
  const file = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => {
    const cards = Object.values(progress.cards);
    const days = Object.values(progress.days);
    const r = days.reduce((n, d) => n + d.r, 0);
    const c = days.reduce((n, d) => n + d.c, 0);
    const time = days.reduce((n, d) => n + d.t, 0);
    const forecast = Array.from({ length: 7 }, (_, i) => {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      end.setDate(end.getDate() + i);
      const start = new Date(end);
      start.setHours(0, 0, 0, 0);
      return cards.filter((x) => (i === 0 ? x.due <= end.getTime() : x.due >= start.getTime() && x.due <= end.getTime())).length;
    });
    return { learned: cards.length, mastered: cards.filter(isMastered).length, reviews: r, accuracy: r ? Math.round((c / r) * 100) : 0, minutes: Math.round(time / 60), forecast };
  }, [progress]);

  const set = (patch: Partial<Settings>) => store.settings(patch);
  const download = () => {
    const blob = new Blob([exportBackup()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `word-atlas-backup-${dayKey()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  const restore = async (f: File) => {
    if (f.size > 30 * 1024 * 1024) return toast(t.me.fileTooBig, "warn");
    const r = importBackup(await f.text());
    toast(r.ok ? t.me.restoredToast(r.cards) : r.error, r.ok ? "ok" : "warn");
  };
  const maxF = Math.max(1, ...stats.forecast);

  return (
    <div className="page me">
      <header className="page-head">
        <p className="eyebrow">{t.me.eyebrow}</p>
        <h1 className="display">{t.me.title}</h1>
      </header>

      <section className="stat-strip">
        <div>
          <dt>{t.me.streak}</dt>
          <dd>
            {streakOf(progress.days)}
            <small>{t.me.daysUnit}</small>
          </dd>
        </div>
        <div>
          <dt>{t.me.lit}</dt>
          <dd>{stats.learned.toLocaleString()}</dd>
        </div>
        <div>
          <dt>{t.me.longTerm}</dt>
          <dd>{stats.mastered.toLocaleString()}</dd>
        </div>
        <div>
          <dt>{t.me.firstAcc}</dt>
          <dd>
            {stats.accuracy}
            <small>%</small>
          </dd>
        </div>
        <div>
          <dt>{t.me.studyTime}</dt>
          <dd>
            {stats.minutes}
            <small>{t.me.minutesUnit}</small>
          </dd>
        </div>
      </section>

      <div className="me-grid">
        <section className="panel">
          <h3 className="eyebrow">{t.me.past20Weeks}</h3>
          <Heatmap days={progress.days} />
          <p className="muted">{t.me.heatmapNote}</p>
        </section>

        <section className="panel">
          <h3 className="eyebrow">{t.me.forecastTitle}</h3>
          <ol className="forecast">
            {stats.forecast.map((n, i) => (
              <li key={i}>
                <span style={{ height: `${(n / maxF) * 100}%` }} />
                <b>{n}</b>
                <small>{i === 0 ? t.me.today : i === 1 ? t.me.tomorrow : `+${i}`}</small>
              </li>
            ))}
          </ol>
        </section>

        <section className="panel settings">
          <h3 className="eyebrow">{t.me.settingsTitle}</h3>
          <Field label={t.me.langLabel} hint={t.me.langHint}>
            <div className="segmented">
              {(
                [
                  ["es", "Español"],
                  ["en", "English"],
                  ["zh", "中文"],
                ] as [Lang, string][]
              ).map(([k, label]) => (
                <button key={k} className={settings.lang === k ? "is-on" : ""} onClick={() => set({ lang: k })}>
                  {label}
                </button>
              ))}
            </div>
          </Field>
          <Field label={t.me.dailyNewLabel} hint={t.me.dailyNewHint}>
            <div className="segmented">
              {[5, 10, 15, 20, 30].map((n) => (
                <button key={n} className={settings.dailyNew === n ? "is-on" : ""} onClick={() => set({ dailyNew: n })}>
                  {n}
                </button>
              ))}
            </div>
          </Field>
          <Field label={t.me.startLevelLabel} hint={t.me.startLevelHint}>
            <div className="segmented">
              {atlas.cefr.map((l, i) => (
                <button key={l} className={settings.startLevel === i ? "is-on" : ""} onClick={() => set({ startLevel: i })}>
                  {l}
                </button>
              ))}
            </div>
          </Field>
          <Field label={t.me.retentionLabel} hint={t.me.retentionHint}>
            <div className="segmented">
              {[0.85, 0.9, 0.95].map((n) => (
                <button key={n} className={settings.retention === n ? "is-on" : ""} onClick={() => set({ retention: n })}>
                  {Math.round(n * 100)}%
                </button>
              ))}
            </div>
          </Field>
          <Field label={t.me.accentLabel}>
            <div className="segmented">
              <button className={settings.accent === "uk" ? "is-on" : ""} onClick={() => set({ accent: "uk" })}>
                {t.me.accentUk}
              </button>
              <button className={settings.accent === "us" ? "is-on" : ""} onClick={() => set({ accent: "us" })}>
                {t.me.accentUs}
              </button>
            </div>
          </Field>
          <Field label={t.me.themeLabel}>
            <div className="segmented">
              {(
                [
                  ["system", t.me.themeSystem],
                  ["light", t.me.themeLight],
                  ["dark", t.me.themeDark],
                ] as const
              ).map(([k, l]) => (
                <button key={k} className={settings.theme === k ? "is-on" : ""} onClick={() => set({ theme: k })}>
                  {l}
                </button>
              ))}
            </div>
          </Field>
          <Toggle label={t.me.autoplayLabel} on={settings.autoplay} set={(v) => set({ autoplay: v })} />
          <Toggle label={t.me.sfxLabel} on={settings.sfx} set={(v) => set({ sfx: v })} />
          <Toggle label={t.me.splashLabel} on={settings.splash} set={(v) => set({ splash: v })} />
          <Toggle label={t.me.spellLabel} on={settings.spell} set={(v) => set({ spell: v })} />
          {privateAvailable && (
            <Field label={t.me.datasetLabel} hint={t.me.datasetHint}>
              <div className="segmented">
                <button className={settings.dataset === "open" ? "is-on" : ""} onClick={() => set({ dataset: "open" })}>
                  {t.me.datasetOpen}
                </button>
                <button className={settings.dataset === "private" ? "is-on" : ""} onClick={() => set({ dataset: "private" })}>
                  {t.me.datasetPriv}
                </button>
              </div>
            </Field>
          )}
        </section>

        <section className="panel">
          <h3 className="eyebrow">{t.me.dataTitle}</h3>
          <p className="muted">{t.me.dataDesc}</p>
          {saveError && <p className="warn-text">{t.me.saveErrorWarn}</p>}
          <div className="data-actions">
            <button className="btn btn-ghost" onClick={download}>
              <Download size={18} /> {t.me.exportBtn}
            </button>
            <button className="btn btn-ghost" onClick={() => file.current?.click()}>
              <Upload size={18} /> {t.me.importBtn}
            </button>
            <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files?.[0] && restore(e.target.files[0]).finally(() => (e.target.value = ""))} />
            <button
              className="btn btn-ghost btn-danger"
              onClick={() => {
                if (confirm(t.me.resetConfirm)) {
                  resetProgress();
                  toast(t.me.resetToast);
                }
              }}
            >
              <RotateCcw size={18} /> {t.me.resetBtn}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <div>
        <b>{label}</b>
        {hint && <small>{hint}</small>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, on, set }: { label: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <label className="field toggle">
      <b>{label}</b>
      <input type="checkbox" role="switch" checked={on} onChange={(e) => set(e.target.checked)} />
      <span className="switch" aria-hidden="true" />
    </label>
  );
}

function Heatmap({ days }: { days: Record<string, { r: number }> }) {
  const t = useT();
  const weeks = 20;
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (weeks * 7 - 1) - end.getDay());
  const cells: { k: string; v: number; future: boolean }[] = [];
  const d = new Date(start);
  for (let i = 0; i < (weeks + 1) * 7; i++) {
    const k = dayKey(d);
    cells.push({ k, v: days[k]?.r ?? 0, future: d > end });
    d.setDate(d.getDate() + 1);
  }
  const lvl = (v: number) => (v === 0 ? 0 : v < 10 ? 1 : v < 25 ? 2 : v < 50 ? 3 : 4);
  return (
    <div className="heatmap" role="img" aria-label={t.me.heatmapAria}>
      {cells.map((c) => (
        <span key={c.k} className={`h${c.future ? "x" : lvl(c.v)}`} title={`${c.k} · ${c.v}`} />
      ))}
    </div>
  );
}
