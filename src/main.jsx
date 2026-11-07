import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import { initialize } from "./interactions.js";

function Panel({ bg, className = "", children }) {
  return (
    <section className={`sec pg-${bg} ${className}`}>
      <div className="reveal">{children}</div>
    </section>
  );
}
function App({ c }) {
  const [muted, setMuted] = useState(false);
  const audio = useRef(null);
  useEffect(() => {
    document.title = c.title;
    Object.entries(c.theme).forEach(([k, v]) =>
      document.documentElement.style.setProperty(`--${k}`, v),
    );
    initialize(c);
  }, [c]);
  const date = new Date(`${c.hero.date}T12:00:00`);
  return (
    <>
      <style>
        {["arch", "silk", "paper"]
          .map(
            (bg) =>
              `.pg-${bg}{background-image:url(${JSON.stringify(c.media[bg])})}`,
          )
          .join("")}
      </style>
      <audio ref={audio} id="bgMusic" preload="auto" aria-hidden="true">
        <source src={c.media.audio} type="audio/mpeg" />
      </audio>
      <section id="opener" className="opener" aria-label={c.opening.label}>
        <video
          id="openingVideo"
          className="opening-video"
          playsInline
          preload="auto"
          muted
          poster={c.media.openingPoster}
        >
          <source src={c.media.openingVideo} type="video/mp4" />
        </video>
        <button
          id="openBtn"
          className="open-btn"
          aria-label={c.opening.label}
        />
        <button id="skipBtn" className="skip-btn">
          {c.opening.skip}
        </button>
      </section>
      <button
        className="music-toggle"
        aria-label={muted ? c.opening.unmute : c.opening.mute}
        onClick={() => {
          if (muted) {
            audio.current.play().catch(() => {});
          }
          audio.current.muted = !muted;
          setMuted(!muted);
        }}
      >
        {muted ? "♫" : "♪"}
      </button>
      <canvas id="confetti" aria-hidden="true" />
      <div id="sparkles" className="sparkles hidden" aria-hidden="true" />
      <main id="website" className="website hidden" aria-hidden="true">
        <Panel bg="arch" className="hero">
          <div className="arabic bismillah">{c.hero.blessing}</div>
          <p className="intro">{c.hero.intro}</p>
          <h1>
            {[c.couple.first, c.couple.second].map((p, i) => (
              <React.Fragment key={i}>
                {i > 0 && <em>{c.couple.separator}</em>}
                <span className="person">
                  <span className="name">{p.name}</span>
                  <span className="parent">
                    <b>{p.relation}</b> {p.parent}
                  </span>
                </span>
              </React.Fragment>
            ))}
          </h1>
          <p className="lead">{c.hero.lead}</p>
          {/* <div className="date-card">
            <strong>{date.getDate()}</strong>
            <div className="date-copy">
              <span>
                {date
                  .toLocaleDateString(c.locale, { month: "long" })
                  .toUpperCase()}
              </span>
              <b>{date.getFullYear()}</b>
            </div>
          </div> */}
          <p className="date-label">{c.hero.label}</p>
        </Panel>
        <Panel bg="silk" className="scratch-section">
          <span className="caps">{c.scratch.eyebrow}</span>
          <h2>{c.scratch.title}</h2>
          <p className="sub">{c.scratch.subtitle}</p>
          <div className="scratch-card" id="scratchCard">
            <div className="scratch-under">
              <span className="tiny">{c.scratch.tiny}</span>
              <div className="reveal-date">{c.scratch.date}</div>
              <div className="reveal-title">{c.scratch.revealTitle}</div>
              <p>{c.scratch.message}</p>
            </div>
            <canvas
              id="scratchCanvas"
              role="button"
              tabIndex={0}
              aria-label={c.scratch.label}
            />
          </div>
        </Panel>
        <Panel bg="paper" className="quote">
          <div className="arabic verse">{c.verse.arabic}</div>
          <div className="rule" />
          <p className="trans">{c.verse.translation}</p>
          <small>{c.verse.source}</small>
        </Panel>
        <Panel bg="arch" className="calendar">
          <span className="caps">{c.calendar.eyebrow}</span>
          <h2>{c.calendar.title}</h2>
          <div className="cal" id="calendar" aria-label={c.calendar.label}>
            <div className="cal-month" id="calMonth" />
            <div className="cal-week">
              {c.calendar.weekdays.map((d, i) => (
                <i key={i}>{d}</i>
              ))}
            </div>
            <div className="cal-grid" id="calGrid" />
          </div>
          <p className="cal-note" id="calNote" />
        </Panel>
        <Panel bg="silk" className="countdown">
          <span className="caps">{c.countdown.eyebrow}</span>
          <h2>{c.countdown.title}</h2>
          <div className="cd" id="countdown" aria-live="off">
            {["D", "H", "M", "S"].map((id, i) => (
              <div className="cd-box" key={id}>
                <b id={`cd${id}`}>00</b>
                <span>{c.countdown.units[i]}</span>
              </div>
            ))}
          </div>
          <p className="cd-note" id="cdNote">
            {c.countdown.note}
          </p>
        </Panel>
        {c.events.map((e, i) => (
          <Panel key={i} bg={e.background} className="event">
            <span className="caps">{e.eyebrow}</span>
            <h3>{e.title}</h3>
            <div className="rule" />
            <p className="ev-date">{e.date}</p>
            <strong>{e.time}</strong>
            <small>
              {e.address.map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <br />}
                  {s}
                </React.Fragment>
              ))}
            </small>
            {e.directionsLabel && (
              <a
                href={
                  e.directionsUrl ||
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.address.join(", "))}`
                }
                target="_blank"
                rel="noreferrer"
              >
                {e.directionsLabel}
              </a>
            )}
          </Panel>
        ))}
        <Panel bg="silk" className="story">
          <span className="caps">{c.story.eyebrow}</span>
          <h2>
            {c.story.title.map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <br />}
                {s}
              </React.Fragment>
            ))}
          </h2>
          <p className="sub">{c.story.text}</p>
          <div className="divider">{c.story.divider}</div>
        </Panel>
        <Panel bg="paper" className="closing">
          <span className="caps">{c.closing.eyebrow}</span>
          <div className="arabic dua-arabic">{c.closing.arabic}</div>
          <p className="trans">{c.closing.translation}</p>
          <div className="rule" />
          <p className="sub">{c.closing.message}</p>
          <div className="foot-names">{c.couple.shortNames}</div>
          <small>{c.closing.year}</small>
        </Panel>
      </main>
      <nav id="slideNav" className="slide-nav hidden" aria-label={c.slideshow.label}>
        <button id="prevSlide" type="button">{c.slideshow.previous}</button>
        <span id="slideStatus" aria-live="polite" aria-atomic="true" />
        <button id="nextSlide" type="button">{c.slideshow.next}</button>
        <button id="pauseSlides" className="pause-slides" type="button">{c.slideshow.pause}</button>
      </nav>
    </>
  );
}
fetch(`${import.meta.env.BASE_URL}config.json`)
  .then((r) => {
    if (!r.ok) throw Error("Unable to load config.json");
    return r.json();
  })
  .then((c) =>
    createRoot(document.getElementById("root")).render(<App c={c} />),
  )
  .catch((e) => {
    document.getElementById("root").textContent = e.message;
  });
