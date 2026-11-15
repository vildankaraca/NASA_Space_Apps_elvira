import ExpeditionGame from './features/game/ExpeditionGame';
import { useState, useEffect } from 'react';
import { moonData } from './data/moonData';
import { marsData } from './data/marsData';
import { deepSpaceData } from './data/deepSpaceData';

const missions = [moonData, marsData, deepSpaceData];

// Gezegenleri hafızada tutacak önbellek
const planetCache = {};
const planetListeners = {};

function cleanPlanetImage(src) {
  if (planetCache[src]) return Promise.resolve(planetCache[src]);
  if (planetListeners[src]) return planetListeners[src];

  planetListeners[src] = new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'sync';
    img.src = src;
    img.onload = () => {
      // Piksel art görselleri hızla işlemek için 256x256 boyuta optimize et
      const size = 256;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      canvas.width = size;
      canvas.height = size;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, size, size);

      const imgData = ctx.getImageData(0, 0, size, size);
      const data = imgData.data;
      const cx = size / 2;
      const cy = size / 2;
      const coreRadiusSq = (size * 0.25) * (size * 0.25);

      for (let y = 0; y < size; y++) {
        const dy = y - cy;
        for (let x = 0; x < size; x++) {
          const dx = x - cx;
          if (dx * dx + dy * dy > coreRadiusSq) {
            const idx = (y * size + x) * 4;
            // Siyah arka plan piksellerini şeffaf yap
            if (data[idx] < 22 && data[idx + 1] < 22 && data[idx + 2] < 26) {
              data[idx + 3] = 0;
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);

      canvas.toBlob((blob) => {
        const url = blob ? URL.createObjectURL(blob) : canvas.toDataURL('image/png');
        planetCache[src] = url;

        const preImg = new Image();
        preImg.src = url;
        if (preImg.decode) {
          preImg.decode().catch(() => {}).finally(() => resolve(url));
        } else {
          resolve(url);
        }
      }, 'image/png');
    };
  });

  return planetListeners[src];
}

// Uygulama yüklenir yüklenmez 3 gezegeni arka planda şeffaflaştırıp önbelleğe al
['/images/moon.jpg', '/images/mars.jpg', '/images/deepspace.jpg'].forEach(cleanPlanetImage);

function TransparentPlanet({ src, alt }) {
  const [cleanSrc, setCleanSrc] = useState(() => planetCache[src] || null);

  useEffect(() => {
    let active = true;
    if (!planetCache[src]) {
      cleanPlanetImage(src).then((url) => {
        if (active) setCleanSrc(url);
      });
    } else if (cleanSrc !== planetCache[src]) {
      setCleanSrc(planetCache[src]);
    }
    return () => { active = false; };
  }, [src, cleanSrc]);

  if (!cleanSrc) {
    return <div style={{ width: '100%', height: '100%' }} />;
  }

  return (
    <img
      src={cleanSrc}
      alt={alt}
      decoding="sync"
      loading="eager"
      className="pixel-planet-img"
    />
  );
}

export default function App() {
  const [stage, setStage] = useState('intro_start');

  const [selectedMission, setSelectedMission] = useState(null);
  const handleContinueAfterReading = () => setStage('intro_end');
  const handleSelectMission = (mission) => { setSelectedMission(mission); setStage('game'); };

  const renderPlanetArt = (id) => {
    if (id === 'moon') {
      return (
        <div className="pixel-planet-wrapper">
          <TransparentPlanet src="/images/moon.jpg" alt="The Moon" />
        </div>
      );
    }
    if (id === 'mars') {
      return (
        <div className="pixel-planet-wrapper">
          <TransparentPlanet src="/images/mars.jpg" alt="Mars" />
        </div>
      );
    }
    return (
      <div className="pixel-planet-wrapper">
        <TransparentPlanet src="/images/deepspace.jpg" alt="Deep Space" />
      </div>
    );
  };

  const isIntroStage = stage === 'intro_start' || stage === 'intro_read' || stage === 'intro_end';

  return (
    <div className="space-app-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Silkscreen:wght@400;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          background-color: #030308;
          overflow-x: hidden;
        }

        .space-app-root {
          min-height: 100vh;
          color: #e2e8f0;
          font-family: 'Space Mono', monospace;
          position: relative;
        }

        .pixel-title {
          font-family: 'Press Start 2P', monospace;
          line-height: 1.5;
          text-transform: uppercase;
        }

        .retro-font {
          font-family: 'Silkscreen', monospace;
        }

        .bg-media {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          object-fit: cover;
          z-index: 0;
        }

        /* 2D PIXEL ART RESİM STİLLERİ */
        .pixel-planet-wrapper {
          width: 160px;
          height: 160px;
          margin: 6px auto 10px auto;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: floatPlanet 4.5s infinite ease-in-out;
        }

        .pixel-planet-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        }

        @keyframes floatPlanet {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.03); }
        }

        .cinematic-overlay {
          position: relative;
          z-index: 2;
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 0 24px;
          pointer-events: none;
        }

        .story-floater {
          max-width: 860px;
          transition: opacity 1.2s ease-in-out, transform 1.6s cubic-bezier(0.22, 1, 0.36, 1), filter 1.2s ease;
        }

        .story-floater.hidden {
          opacity: 0;
          transform: translateY(35px) scale(1.06);
          filter: blur(8px);
        }

        .story-floater.visible {
          opacity: 1;
          transform: translateY(0px) scale(1);
          filter: blur(0px);
        }

        .story-floater.fading {
          opacity: 0;
          transform: translateY(-140px) scale(0.35);
          filter: blur(6px);
        }

        .cinematic-heading {
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(22px, 3.2vw, 38px);
          color: #f8fafc;
          letter-spacing: 3px;
          margin: 0 0 28px 0;
          text-shadow:
            0 4px 0 #05050d,
            -3px -3px 0 #05050d,
            3px -3px 0 #05050d,
            -3px 3px 0 #05050d,
            3px 3px 0 #05050d,
            0 0 25px rgba(168, 85, 247, 0.85),
            0 0 45px rgba(56, 189, 248, 0.5);
        }

        .cinematic-body {
          font-family: 'Silkscreen', monospace;
          font-size: clamp(14px, 1.6vw, 20px);
          line-height: 1.85;
          color: #e2e8f0;
          margin: 0;
          text-shadow:
            0 3px 0 #04040a,
            -2px -2px 0 #04040a,
            2px -2px 0 #04040a,
            -2px 2px 0 #04040a,
            2px 2px 0 #04040a,
            0 0 18px rgba(0, 0, 0, 0.95);
        }

        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 18px rgba(251, 191, 36, 0.45); }
          50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(251, 191, 36, 0.85); }
        }

        .continue-cosmos-btn {
          margin-top: 34px;
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(11px, 1.1vw, 14px);
          padding: 16px 26px;
          background: rgba(9, 11, 26, 0.82);
          color: #fcd34d;
          border: 2px solid #fcd34d;
          cursor: pointer;
          letter-spacing: 1.5px;
          animation: pulseGlow 2s infinite ease-in-out;
          transition: background 0.2s, color 0.2s;
        }

        .continue-cosmos-btn:hover {
          background: #fcd34d;
          color: #05050a;
        }

        .sector-screen {
          position: relative;
          z-index: 2;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 30px 20px;
          animation: fadeInSpace 1.2s ease forwards;
        }

        @keyframes fadeInSpace {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .sector-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 28px;
          max-width: 1040px;
          width: 100%;
          margin-top: 24px;
        }

        .retro-sector-card {
          background: rgba(8, 10, 24, 0.84);
          backdrop-filter: blur(8px);
          padding: 26px 22px;
          cursor: pointer;
          position: relative;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 420px;
          border-radius: 16px;
          border: 3px solid rgba(148, 163, 184, 0.4);
          transition: transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
        }

        .retro-sector-card:hover {
          transform: translateY(-6px) scale(1.02);
          background: rgba(14, 18, 42, 0.95);
        }

        .retro-btn {
          font-family: 'Press Start 2P', monospace;
          font-size: 11px;
          padding: 12px 18px;
          background: rgba(15, 23, 42, 0.85);
          color: #f8fafc;
          border: 2px solid #475569;
          cursor: pointer;
          text-transform: uppercase;
          transition: all 0.2s;
        }
        .retro-btn:hover {
          border-color: #38bdf8;
          color: #38bdf8;
          transform: scale(1.05);
        }
      `}</style>

      {/* 1. AŞAMA ARKA PLANI */}
      {stage === 'intro_start' && (
        <video
          src="/videos/opening.mp4"
          autoPlay
          muted
          playsInline
          onEnded={() => setStage('intro_read')}
          className="bg-media"
          style={{ filter: 'brightness(0.95)' }}
        />
      )}

      {/* 2. AŞAMA ARKA PLANI */}
      {stage === 'intro_read' && (
        <video
          src="/videos/gifroket.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="bg-media"
          style={{ filter: 'brightness(0.85)' }}
        />
      )}

      {/* 3. AŞAMA ARKA PLANI */}
      {stage === 'intro_end' && (
        <video
          src="/videos/opening2.mp4"
          autoPlay
          muted
          playsInline
          onEnded={() => setStage('select')}
          className="bg-media"
          style={{ filter: 'brightness(0.95)' }}
        />
      )}

      {/* 4. AŞAMA ARKA PLANI */}
      {stage === 'select' && (
        <img
          src="/videos/gif.gif"
          alt="Space Background Loop"
          className="bg-media"
          style={{ filter: 'brightness(0.65) contrast(1.1)' }}
        />
      )}

      {/* SİNEMATİK YAZI KATMANI */}
      {isIntroStage && (
        <div className="cinematic-overlay">
          <div
            className={`story-floater ${
              stage === 'intro_start'
                ? 'hidden'
                : stage === 'intro_read'
                ? 'visible'
                : 'fading'
            }`}
          >
            <h1 className="cinematic-heading">
              Abandoned, But Not Forgotten
            </h1>
            <p className="cinematic-body">
              Since the 1960s, humanity has sent robotic pioneers across the solar system.
              On the Moon, under the red dust of Mars, and in the freezing dark of deep space,
              our silent explorers wait to tell their stories.
            </p>

            <button
              onClick={handleContinueAfterReading}
              className="continue-cosmos-btn"
              style={{
                pointerEvents: stage === 'intro_read' ? 'auto' : 'none'
              }}
            >
              [ CONTINUE INTO THE COSMOS &gt;&gt; ]
            </button>
          </div>

          <button
            onClick={() => setStage('select')}
            className="retro-btn"
            style={{ position: 'fixed', bottom: '28px', right: '28px', pointerEvents: 'auto', opacity: 0.75 }}
          >
            Skip Intro &gt;&gt;
          </button>
        </div>
      )}

      {/* 3'LÜ SEÇİM EKRANI */}
      {stage === 'select' && (
        <div className="sector-screen">
          <div style={{ textAlign: 'center', maxWidth: '900px' }}>
            <h1 className="pixel-title" style={{ fontSize: 'clamp(20px, 2.8vw, 34px)', color: '#f8fafc', margin: '0 0 12px 0', textShadow: '0 4px 0 #000, 0 0 25px rgba(56,189,248,0.7)', letterSpacing: '3px' }}>
              LANDING SECTOR
            </h1>
          </div>

          <div className="sector-grid">
            {missions.map((m) => (
              <div
                key={m.id}
                onClick={() => handleSelectMission(m)}
                className="retro-sector-card"
                style={{
                  borderColor: m.themeColor,
                  boxShadow: `0 0 28px ${m.themeColor}45, inset 0 0 18px ${m.themeColor}15`
                }}
              >
                <div>
                  <h3 className="pixel-title" style={{ color: m.themeColor, fontSize: '18px', margin: '0 0 4px 0', textShadow: '0 3px 0 #000', letterSpacing: '2px' }}>
                    {m.title.split(':')[0]}
                  </h3>
                  
                  {renderPlanetArt(m.id)}

                  <p className="retro-font" style={{ color: '#cbd5e1', fontSize: '12px', lineHeight: '1.65', marginTop: '6px', textShadow: '0 2px 0 #000' }}>
                    {m.subtitle}
                  </p>
                </div>

                <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <span className="pixel-title" style={{ fontSize: '13px', color: '#fcd34d', letterSpacing: '2px', textShadow: '0 2px 0 #000' }}>
                    LAUNCH &gt;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GEZEGENE İNİŞ VİDEOSU */}
      {stage === 'game' && selectedMission && <ExpeditionGame key={selectedMission.id} sector={selectedMission} onExit={() => setStage('select')} />}
    </div>
  );
}