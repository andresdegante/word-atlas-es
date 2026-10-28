import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useAtlas } from "../atlas/context";
import type { Lang } from "../lib/i18n";
import { store, useLang, useT } from "../store/store";

export function Onboarding() {
  const atlas = useAtlas();
  const lang = useLang();
  const t = useT();
  const [level, setLevel] = useState(1);
  const [goal, setGoal] = useState(10);
  const levels = t.onboard.levels;
  const finish = () => store.settings({ onboarded: true, startLevel: atlas.cefr.indexOf(levels[level][0]), dailyNew: goal });
  return (
    <div className="onboard" role="dialog" aria-modal="true" aria-label={t.onboard.dialogAria}>
      <div className="onboard-card">
        <img className="onboard-art" src={`${import.meta.env.BASE_URL}brand/hero.webp`} alt="" />
        <div className="onboard-body">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <p className="eyebrow">{t.onboard.eyebrow}</p>
            <div className="lang-switch" role="group" aria-label={t.top.langTitle}>
              {(["es", "en", "zh"] as Lang[]).map((l) => (
                <button key={l} className={lang === l ? "is-on" : ""} onClick={() => store.settings({ lang: l })} aria-pressed={lang === l}>
                  {l === "zh" ? "中" : l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <h1 className="display">
            {t.onboard.title1(atlas.count.toLocaleString())}
            <br />
            {t.onboard.title2}
          </h1>
          <fieldset>
            <legend>{t.onboard.whereStart}</legend>
            <div className="choice-grid">
              {levels.map(([code, name, desc], i) => (
                <button key={code} className={`choice ${level === i ? "is-on" : ""}`} onClick={() => setLevel(i)} aria-pressed={level === i}>
                  <span className={`chip chip-level lv-${code}`}>{code}</span>
                  <b>{name}</b>
                  <small>{desc}</small>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>{t.onboard.dailyGoal}</legend>
            <div className="segmented segmented-wide">
              {[5, 10, 15, 20].map((n) => (
                <button key={n} className={goal === n ? "is-on" : ""} onClick={() => setGoal(n)} aria-pressed={goal === n}>
                  {t.onboard.goalOption(n)}
                </button>
              ))}
            </div>
          </fieldset>
          <button className="btn btn-primary btn-xl" onClick={finish}>
            {t.onboard.startBtn} <ArrowRight size={20} />
          </button>
          <p className="muted">{t.onboard.note}</p>
        </div>
      </div>
    </div>
  );
}
