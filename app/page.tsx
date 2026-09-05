"use client";

import { useEffect, useState } from "react";

type Testimonial = { name: string; url: string };

const MUSIC = [
  { title: "Billie Jean - Michael Jackson", file: "/music/music1.mp3" },
  { title: "That's What I Like - Bruno Mars", file: "/music/music2.mp3" },
  { title: "Only - Lee Hi", file: "/music/music3.mp3" },
];

const LOCAL_TESTIMONIALS = [
  "Screenshot_20260826-015705.jpg","Screenshot_20260826-015547.jpg","Screenshot_20260826-015746.jpg",
  "testimoni-INV-MTF9O3P4-9IDR5-8434151970-1788062529588.png","Screenshot_20260826-015622.jpg","Screenshot_20260826-015520.jpg",
  "Screenshot_20260826-015446.jpg","testimoni-INV-MTF2E3W6-BITSE-8606484909-1788049322204.png","Screenshot_20260826-015458.jpg",
  "000-auto-8211835813364-PAY_1788164178566_8606484909.png","Screenshot_20260826-015832.jpg","Screenshot_20260826-015715.jpg",
  "Screenshot_20260826-015654.jpg","Screenshot_20260826-015633.jpg","Screenshot_20260826-015734.jpg","Screenshot_20260826-015530.jpg",
  "000-auto-8212102767804-PAY_1787897224144_8606484909.png","Screenshot_20260826-015539.jpg","Screenshot_20260826-015510.jpg",
  "000-auto-8211550816503-PAY_1788440954263_6418986544.png","000-auto-8211834585714-PAY_1788165404907_8606484909.png","Screenshot_20260826-015819.jpg",
  "002.jpg","Screenshot_20260826-015600.jpg","000-auto-8212102930566-PAY_1787897059552_8606484909.png","Screenshot_20260826-015756.jpg",
  "000-auto-8211836086006-PAY_1788163900317_8518233752.png","Screenshot_20260826-015612.jpg","Screenshot_20260826-015644.jpg",
  "000-auto-8211491140470-PAY_1788508799705_8472943604.png","000-auto-8211398513451-PAY_1788601046769_8792238648.png",
  "000-auto-8211812233254-PAY_1788187758364_8606484909.png","000-auto-8212102193413-PAY_1787897784541_8606484909.png","Screenshot_20260826-015724.jpg",
  "001.jpg","Screenshot_20260826-015809.jpg","000-auto-8212100856860-PAY_1787899070312_8434151970.png"
];

function localItems(): Testimonial[] {
  return LOCAL_TESTIMONIALS.map((name) => ({ name, url: `/testimonials/${encodeURIComponent(name)}` }));
}

export default function Home() {
  const [items, setItems] = useState<Testimonial[]>(localItems());
  const [active, setActive] = useState<Testimonial | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);
  const [auto, setAuto] = useState("Testimoni siap ditampilkan");

  async function refresh() {
    try {
      const res = await fetch("/api/testimonials", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.items) && data.items.length) {
        setItems(data.items);
        setAuto(`♡ ${data.items.length} testimoni · diperbarui otomatis`);
      }
    } catch { /* local fallback remains visible */ }
  }

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 60000);
    return () => clearInterval(timer);
  }, []);

  function toggleMusic(index: number) {
    const current = document.getElementById(`music-${index}`) as HTMLAudioElement | null;
    if (!current) return;
    document.querySelectorAll("audio[data-music]").forEach((el) => {
      if (el !== current) {
        (el as HTMLAudioElement).pause();
        (el as HTMLAudioElement).currentTime = 0;
      }
    });
    if (current.paused) {
      current.play().then(() => setPlaying(index)).catch(() => setPlaying(null));
    } else {
      current.pause();
      setPlaying(null);
    }
  }

  return (
    <main className="page">
      <div className="wash" /><div className="petals">✿　♡　✦　୨୧　✿</div>
      <section className="phone">
        <header className="hero">
          <div className="portrait"><img src="/character.png" alt="AIXI STORE character" /></div>
          <div className="heroShade" />
          <div className="badge">AX · AIXI STORE</div>
        </header>

        <section className="content">
          <p className="eyebrow">CUSTOMER LOVE</p>
          <h1>Testimoni AIXI</h1>
          <div className="divider"><span>♡</span><i /><span>✦</span><i /><span>♡</span></div>
          <p className="sub">Kumpulan pengalaman & bukti dari pelanggan AIXI STORE</p>

          <div className="musicGrid">
            {MUSIC.map((m, i) => (
              <button className={`musicCard ${playing === i ? "active" : ""}`} key={m.file} onClick={() => toggleMusic(i)}>
                <span className="musicNote">{playing === i ? "❚❚" : "♪"}</span>
                <span className="musicName">{m.title}</span>
                <audio id={`music-${i}`} data-music preload="metadata"><source src={m.file} type="audio/mpeg" /></audio>
              </button>
            ))}
          </div>

          <div className="heading"><span>✿</span> TESTIMONI PELANGGAN <small>{items.length} FOTO</small></div>
          <p className="auto">{auto}</p>

          <div className="gallery">
            {items.map((item, index) => (
              <article className="card" key={`${item.name}-${index}`} onClick={() => setActive(item)}>
                <div className="cardHead"><b>Testimoni {index + 1}</b>{index === 0 && <em>Terbaru</em>}</div>
                <img src={item.url} alt={`Testimoni ${index + 1}`} loading="lazy" />
              </article>
            ))}
          </div>
          <footer>© 2026 AIXI STORE · MADE WITH ♡</footer>
        </section>
      </section>

      {active && <div className="lightbox" onClick={(e) => e.target === e.currentTarget && setActive(null)}>
        <button className="close" onClick={() => setActive(null)}>×</button>
        <div className="viewer"><div className="viewerTitle">Testimoni {items.indexOf(active) + 1}</div><img src={active.url} alt="Testimoni diperbesar" /></div>
      </div>}
    </main>
  );
}
