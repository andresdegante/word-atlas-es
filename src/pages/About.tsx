import { ArrowUpRight, Database, Github, Heart } from "lucide-react";
import { useAtlas } from "../atlas/context";
import { REPO_URL } from "../config";
import { useT } from "../store/store";

const BASE = import.meta.env.BASE_URL;

export function About() {
  const atlas = useAtlas();
  const t = useT();
  return (
    <div className="page about">
      <header className="about-hero">
        <img src={`${BASE}brand/og.webp`} alt="" />
        <div>
          <p className="eyebrow">{t.about.eyebrow}</p>
          <h1 className="display">{t.about.title}</h1>
          <p className="lede">{t.about.lede1(atlas.count.toLocaleString())}</p>
          <p className="lede">{t.about.lede2}</p>
          <div className="about-actions">
            <a className="btn btn-primary" href={REPO_URL} target="_blank" rel="noreferrer">
              <Github size={18} /> {t.about.githubBtn}
            </a>
            <a className="btn btn-ghost" href={`${REPO_URL}/tree/main/data`} target="_blank" rel="noreferrer">
              <Database size={18} /> {t.about.downloadBtn}
            </a>
          </div>
        </div>
      </header>

      <div className="about-grid">
        <section className="panel">
          <h3 className="eyebrow">{t.about.whyTitle}</h3>
          <ul className="feature-list">
            {t.about.whyItems.map(([head, body]) => (
              <li key={head}>
                <b>{head}</b> {body}
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h3 className="eyebrow">{t.about.shortcutsTitle}</h3>
          <dl className="keys">
            <div>
              <dt>
                <kbd>⌘</kbd>
                <kbd>K</kbd> {t.about.or} <kbd>/</kbd>
              </dt>
              <dd>{t.about.scSearch}</dd>
            </div>
            <div>
              <dt>
                <kbd>1</kbd>–<kbd>4</kbd>
              </dt>
              <dd>{t.about.scChoose}</dd>
            </div>
            <div>
              <dt>
                <kbd>Enter</kbd>
              </dt>
              <dd>{t.about.scConfirm}</dd>
            </div>
            <div>
              <dt>
                <kbd>←</kbd> <kbd>→</kbd>
              </dt>
              <dd>{t.about.scPrevNext}</dd>
            </div>
            <div>
              <dt>
                <kbd>Esc</kbd>
              </dt>
              <dd>{t.about.scClose}</dd>
            </div>
          </dl>
        </section>

        <section className="panel">
          <h3 className="eyebrow">{t.about.sourceTitle}</h3>
          <p className="muted">{t.about.sourceP1}</p>
          <p className="muted">{t.about.sourceP2}</p>
        </section>

        <section className="panel">
          <h3 className="eyebrow">{t.about.devTitle}</h3>
          <p className="muted">{t.about.devP}</p>
          <a className="link" href={`${REPO_URL}#readme`} target="_blank" rel="noreferrer">
            {t.about.readDocs} <ArrowUpRight size={14} />
          </a>
        </section>
      </div>
      <p className="colophon">
        <Heart size={14} /> {t.about.colophon}
      </p>
    </div>
  );
}
