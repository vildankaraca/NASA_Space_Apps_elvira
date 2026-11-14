import { useState, useRef } from 'react';
import { moonData } from './data/moonData';
import { marsData } from './data/marsData';
import { deepSpaceData } from './data/deepSpaceData';

const missions = [moonData, marsData, deepSpaceData];

export default function App() {
  const [stage, setStage] = useState('intro');
  const [textPhase, setTextPhase] = useState('hidden');
  const [userReadyToProceed, setUserReadyToProceed] = useState(false);

  const [selectedMission, setSelectedMission] = useState(null);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [foundIds, setFoundIds] = useState([]);
  const [activeObject, setActiveObject] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const introVideoRef = useRef(null);

  const handleIntroTimeUpdate = () => {
    const vid = introVideoRef.current;
    if (!vid) return;

    const current = vid.currentTime;

    if (current < 7.0 && !userReadyToProceed) {
      if (textPhase !== 'hidden') setTextPhase('hidden');
    }
    else if (current >= 7.0 && !userReadyToProceed) {
      if (textPhase !== 'visible') setTextPhase('visible');

      if (current >= 13.0) {
        vid.currentTime = 7.5;
        vid.play();
      }
    }
  };

  const handleContinueAfterReading = () => {
    setUserReadyToProceed(true);
    setTextPhase('fading');
    if (introVideoRef.current) {
      introVideoRef.current.play();
    }
  };

  const handleIntroEnded = () => {
    setStage('select');
  };

  const handleSelectMission = (mission) => {
    setSelectedMission(mission);
    setCurrentLevelIndex(0);
    setFoundIds([]);
    setActiveObject(null);
    setShowHint(false);

    if (mission.landingVideo) {
      setStage('landing');
    } else {
      setStage('game');
    }
  };

  const currentScene = selectedMission?.scenes[currentLevelIndex];
  const allFoundInLevel = currentScene && foundIds.length === currentScene.objects.length;

  const handleObjectClick = (obj) => {
    if (!foundIds.includes(obj.id)) {
      setFoundIds([...foundIds, obj.id]);
    }
    setActiveObject(obj);
  };

  const goToNextLevel = () => {
    if (currentLevelIndex + 1 < selectedMission.scenes.length) {
      setCurrentLevelIndex(currentLevelIndex + 1);
      setFoundIds([]);
      setActiveObject(null);
      setShowHint(false);
    } else {
      setStage('select');
    }
  };

  // HAREKETLİ RETRO GEZEGEN İLLÜSTRASYONLARI
  const renderPlanetArt = (id) => {
    if (id === 'moon') {
      return (
        <div className="planet-icon moon-art">
          <div className="crater c1"><div className="sh"></div></div>
          <div className="crater c2"><div className="sh"></div></div>
          <div className="crater c3"><div className="sh"></div></div>
          <div className="crater c4"><div className="sh"></div></div>
          <div className="crater c5"><div className="sh"></div></div>
          <div className="surface-patch p1"></div>
          <div className="surface-patch p2"></div>
          <div className="pixel-dust pd1"></div>
          <div className="pixel-dust pd2"></div>
          <div className="pixel-dust pd3"></div>
        </div>
      );
    }
    if (id === 'mars') {
      return (
        <div className="planet-icon mars-art">
          <div className="mars-stripe s1"></div>
          <div className="mars-stripe s2"></div>
          <div className="mars-stripe s3"></div>
          <div className="crater m1"><div className="sh"></div></div>
          <div className="crater m2"><div className="sh"></div></div>
          <div className="crater m3"><div className="sh"></div></div>
          <div className="polar-cap"></div>
          <div className="pixel-dust pd1"></div>
          <div className="pixel-dust pd2"></div>
          <div className="pixel-dust pd3"></div>
        </div>
      );
    }
    return (
      <div className="planet-icon deepspace-art">
        <div className="space-planet-inner">
          <div className="pattern pt1"></div>
          <div className="pattern pt2"></div>
        </div>
        <div className="ring-back"></div>
        <div className="ring-front"></div>
        <div className="nebula-dust"></div>
        <div className="cosmic-star cs1"></div>
        <div className="cosmic-star cs2"></div>
        <div className="cosmic-star cs3"></div>
      </div>
    );
  };

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

        /* HAREKETLİ GEZEGEN STİLLERİ (Hafifçe küçültüldü) */
        .planet-icon {
          width: 95px;
          height: 95px;
          margin: 12px auto 16px auto;
          border-radius: 50%;
          position: relative;
          image-rendering: pixelated;
        }

        @keyframes floatPlanet {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.03); }
        }

        .moon-art {
          background: radial-gradient(circle at 35% 35%, #e2e8f0 0%, #cbd5e1 35%, #94a3b8 65%, #475569 90%, #1e293b 100%);
          box-shadow: 0 0 30px rgba(56, 189, 248, 0.4), inset -4px -4px 0px rgba(0,0,0,0.15);
          animation: floatPlanet 4.5s infinite ease-in-out;
        }
        .moon-art .crater {
          position: absolute; border-radius: 50%; background: #475569;
          box-shadow: inset 2px 2px 0px rgba(0,0,0,0.4), 1px 1px 0px rgba(255,255,255,0.15);
        }
        .moon-art .crater .sh {
          width: 80%; height: 80%; border-radius: 50%; background: #334155; margin-top: 15%; margin-left: 15%; opacity: 0.8;
        }
        .moon-art .c1 { width: 20px; height: 20px; top: 18px; left: 14px; }
        .moon-art .c2 { width: 13px; height: 13px; bottom: 18px; right: 20px; }
        .moon-art .c3 { width: 10px; height: 10px; top: 40px; left: 12px; }
        .moon-art .c4 { width: 8px; height: 8px; top: 16px; right: 24px; }
        .moon-art .c5 { width: 6px; height: 6px; bottom: 28px; left: 38px; }
        .moon-art .surface-patch {
          position: absolute; border-radius: 40%; background: rgba(255,255,255,0.12); filter: blur(1px);
        }
        .moon-art .p1 { width: 13px; height: 7px; top: 10px; left: 26px; transform: rotate(-15deg); }
        .moon-art .p2 { width: 10px; height: 10px; bottom: 12px; left: 18px; }

        .mars-art {
          background: radial-gradient(circle at 35% 35%, #f97316 0%, #ea580c 40%, #c2410c 70%, #7c2d12 90%, #3f1a0a 100%);
          box-shadow: 0 0 30px rgba(249, 115, 22, 0.4), inset -4px -4px 0px rgba(0,0,0,0.2);
          animation: floatPlanet 5s infinite ease-in-out;
          overflow: hidden;
        }
        .mars-art .mars-stripe {
          position: absolute; background: rgba(67, 20, 7, 0.35); transform: rotate(-12deg);
        }
        .mars-art .s1 { width: 110px; height: 7px; top: 16px; left: -10px; }
        .mars-art .s2 { width: 120px; height: 10px; top: 38px; left: -15px; background: rgba(67, 20, 7, 0.45); }
        .mars-art .s3 { width: 90px; height: 6px; bottom: 18px; left: -5px; }
        .mars-art .crater {
          position: absolute; border-radius: 50%; background: #431407; box-shadow: inset 1px 1px 0px rgba(0,0,0,0.5);
        }
        .mars-art .crater .sh {
          width: 80%; height: 80%; border-radius: 50%; background: #2d0e05; margin-top: 15%; margin-left: 15%;
        }
        .mars-art .m1 { width: 11px; height: 8px; top: 22px; right: 22px; }
        .mars-art .m2 { width: 13px; height: 11px; bottom: 22px; left: 12px; }
        .mars-art .m3 { width: 7px; height: 5px; top: 52px; right: 28px; }
        .mars-art .polar-cap {
          position: absolute; width: 24px; height: 7px; background: #ffedd5; top: 2px; left: 35px; border-radius: 50%; opacity: 0.85; filter: blur(0.5px);
        }

        .deepspace-art {
          background: radial-gradient(circle at 40% 40%, #c084fc 0%, #a855f7 35%, #7e22ce 65%, #4c1d95 90%, #1e1b4b 100%);
          box-shadow: 0 0 35px rgba(168, 85, 247, 0.45), inset -3px -3px 0px rgba(0,0,0,0.25);
          animation: floatPlanet 4.8s infinite ease-in-out;
        }
        .deepspace-art .space-planet-inner {
          position: absolute; width: 100%; height: 100%; border-radius: 50%; overflow: hidden;
        }
        .deepspace-art .pattern {
          position: absolute; background: rgba(59, 7, 100, 0.45); transform: rotate(-18deg);
        }
        .deepspace-art .pt1 { width: 110px; height: 12px; top: 20px; left: -10px; }
        .deepspace-art .pt2 { width: 100px; height: 9px; bottom: 24px; left: -5px; }

        @keyframes rotateRing {
          0% { transform: translate(-50%, -50%) rotate(-18deg) scaleY(1); }
          50% { transform: translate(-50%, -50%) rotate(-18deg) scaleY(1.05); }
          100% { transform: translate(-50%, -50%) rotate(-18deg) scaleY(1); }
        }
        .deepspace-art .ring-back {
          position: absolute; top: 50%; left: 50%; width: 130px; height: 24px;
          border: 5px solid #f3e8ff; border-radius: 50%;
          transform: translate(-50%, -50%) rotate(-18deg);
          clip-path: inset(0px 0px 12px 0px);
          box-shadow: 0 0 12px rgba(233, 213, 255, 0.5);
          animation: rotateRing 4.8s infinite ease-in-out;
          z-index: 1;
        }
        .deepspace-art .ring-front {
          position: absolute; top: 50%; left: 50%; width: 130px; height: 24px;
          border: 5px solid #f3e8ff; border-radius: 50%;
          transform: translate(-50%, -50%) rotate(-18deg);
          clip-path: inset(11px 0px 0px 0px);
          box-shadow: 0 0 12px rgba(233, 213, 255, 0.8);
          animation: rotateRing 4.8s infinite ease-in-out;
          z-index: 3;
        }

        @keyframes blinkStar {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .deepspace-art .cosmic-star {
          position: absolute; background: #fff; width: 4px; height: 4px; transform: rotate(45deg); animation: blinkStar 2s infinite ease-in-out; z-index: 4;
        }
        .deepspace-art .cs1 { top: -2px; right: 10px; animation-delay: 0.3s; }
        .deepspace-art .cs2 { bottom: 8px; left: -4px; animation-delay: 0.8s; }
        .deepspace-art .cs3 { top: 28px; right: -6px; animation-delay: 1.2s; }

        @keyframes driftDust {
          0% { transform: translateX(0) translateY(0); opacity: 0.3; }
          50% { transform: translateX(3px) translateY(-2px); opacity: 0.8; }
          100% { transform: translateX(0) translateY(0); opacity: 0.3; }
        }
        .pixel-dust {
          position: absolute; width: 2px; height: 2px; background: rgba(255, 255, 255, 0.4); box-shadow: 0 0 4px rgba(255,255,255,0.3); animation: driftDust 3s infinite ease-in-out;
        }
        .pd1 { top: 15%; left: 10%; animation-delay: 0.2s; }
        .pd2 { bottom: 25%; right: 10%; animation-delay: 0.9s; }
        .pd3 { top: 75%; left: 15%; animation-delay: 0.5s; }

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
          transition: opacity 1.5s ease-in-out, transform 1.8s cubic-bezier(0.22, 1, 0.36, 1), filter 1.5s ease;
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
          grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
          gap: 28px;
          max-width: 1100px;
          width: 100%;
          margin-top: 28px;
        }

        /* SEÇENEK KARTLARI BİRAZ DAHA KÜÇÜLTÜLDÜ (min-height ve padding) */
        .retro-sector-card {
          background: rgba(8, 10, 24, 0.85);
          backdrop-filter: blur(8px);
          padding: 28px 22px;
          cursor: pointer;
          position: relative;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 410px;
          transition: transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
          clip-path: polygon(
            0 12px, 12px 12px, 12px 0,
            calc(100% - 12px) 0, calc(100% - 12px) 12px, 100% 12px,
            100% calc(100% - 12px), calc(100% - 12px) calc(100% - 12px), calc(100% - 12px) 100%,
            12px 100%, 12px calc(100% - 12px), 0 calc(100% - 12px)
          );
          border: 3px solid rgba(148, 163, 184, 0.4);
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

      {stage === 'intro' && (
        <video
          ref={introVideoRef}
          src="/videos/opening.mp4"
          autoPlay
          muted
          playsInline
          onTimeUpdate={handleIntroTimeUpdate}
          onEnded={handleIntroEnded}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            zIndex: 0,
            filter: 'brightness(0.95)'
          }}
        />
      )}

      {stage === 'select' && (
        <img
          src="/videos/gif.gif"
          alt="Space Background Loop"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            zIndex: 0,
            filter: 'brightness(0.65) contrast(1.1)'
          }}
        />
      )}

      {stage === 'intro' && (
        <div className="cinematic-overlay">
          <div className={`story-floater ${textPhase}`}>
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
                pointerEvents: textPhase === 'visible' ? 'auto' : 'none'
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

      {stage === 'select' && (
        <div className="sector-screen">
          <div style={{ textAlign: 'center', maxWidth: '900px' }}>
            <h1 className="pixel-title" style={{ fontSize: 'clamp(20px, 2.6vw, 32px)', color: '#f8fafc', margin: '0 0 12px 0', textShadow: '0 4px 0 #000, 0 0 20px rgba(56,189,248,0.6)', letterSpacing: '2px' }}>
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
                  boxShadow: `0 0 30px ${m.themeColor}35, inset 0 0 20px ${m.themeColor}15`
                }}
              >
                <div>
                  <h3 className="pixel-title" style={{ color: m.themeColor, fontSize: '17px', margin: '0 0 4px 0', textShadow: '0 3px 0 #000', letterSpacing: '2px' }}>
                    {m.title.split(':')[0]}
                  </h3>
                  
                  {renderPlanetArt(m.id)}

                  {/* KATEGORİ AÇIKLAMALARI GERİ EKLENDİ */}
                  <p className="retro-font" style={{ color: '#cbd5e1', fontSize: '12px', lineHeight: '1.6', marginTop: '10px' }}>
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

      {stage === 'landing' && selectedMission && (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#000' }}>
          <video
            src={selectedMission.landingVideo}
            autoPlay
            muted
            playsInline
            onEnded={() => setStage('game')}
            onError={() => setStage('game')}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <button
            onClick={() => setStage('game')}
            className="retro-btn"
            style={{ position: 'fixed', bottom: '30px', right: '30px' }}
          >
            Skip Landing &gt;&gt;
          </button>
        </div>
      )}

      {stage === 'game' && selectedMission && currentScene && (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px dashed ${selectedMission.themeColor}66`, paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span className="retro-font" style={{ fontSize: '13px', color: selectedMission.themeColor }}>
                [{selectedMission.title.toUpperCase()}] — LEVEL {currentLevelIndex + 1} / {selectedMission.scenes.length}
              </span>
              <h2 className="pixel-title" style={{ margin: '6px 0 0', fontSize: '18px', color: '#f8fafc' }}>
                {currentScene.title}
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span className="retro-font" style={{ color: '#fcd34d', fontSize: '14px' }}>
                SIGNALS: {foundIds.length}/{currentScene.objects.length}
              </span>
              <button onClick={() => setShowHint(!showHint)} className="retro-btn" style={{ borderColor: '#fcd34d', color: '#fcd34d' }}>
                {showHint ? 'HIDE RADAR' : 'RADAR HINT'}
              </button>
              <button onClick={() => setStage('select')} className="retro-btn">
                &lt; SECTORS
              </button>
            </div>
          </header>

          <div style={{ position: 'relative', width: '100%', height: '520px', overflow: 'hidden', border: `3px solid ${selectedMission.themeColor}` }}>
            <img
              src={currentScene.backgroundImage}
              alt={currentScene.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {currentScene.objects.map((obj) => {
              const isFound = foundIds.includes(obj.id);
              return (
                <button
                  key={obj.id}
                  onClick={() => handleObjectClick(obj)}
                  style={{
                    position: 'absolute',
                    left: `${obj.xPercent}%`,
                    top: `${obj.yPercent}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: isFound ? 'rgba(34, 197, 94, 0.4)' : showHint ? 'rgba(251, 191, 36, 0.35)' : 'transparent',
                    border: isFound ? '3px solid #22c55e' : showHint ? '2px dashed #fbbf24' : 'none',
                    cursor: 'pointer'
                  }}
                />
              );
            })}
          </div>

          {activeObject && !allFoundInLevel && (
            <div style={{ marginTop: '20px', background: '#0f172a', padding: '22px', border: `3px solid ${selectedMission.themeColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="pixel-title" style={{ margin: 0, fontSize: '15px', color: selectedMission.themeColor }}>
                  SIGNAL LOCKED: {activeObject.name}
                </h3>
                <button onClick={() => setActiveObject(null)} className="retro-btn" style={{ padding: '6px 10px' }}>X</button>
              </div>
              <p className="retro-font" style={{ fontSize: '13px', color: '#fcd34d', marginTop: '10px' }}>
                STATUS: {activeObject.status}
              </p>
              <p style={{ lineHeight: '1.7', fontSize: '15px', color: '#f1f5f9' }}>"{activeObject.story}"</p>
              <div style={{ background: '#050811', padding: '12px', borderLeft: '4px solid #38bdf8', fontSize: '13px' }}>
                <strong className="retro-font" style={{ color: '#38bdf8' }}>SCIENCE IMPACT: </strong>
                {activeObject.scienceFact}
              </div>
            </div>
          )}

          <div style={{ marginTop: '20px', background: '#090d1a', padding: '18px', border: '2px solid #1e293b' }}>
            <h4 className="retro-font" style={{ margin: '0 0 12px 0', color: '#94a3b8' }}>
              INCOMING TELEMETRY CLUES (CLICK OBJECTS ON SCENE):
            </h4>
            {currentScene.objects.map((obj) => (
              <div key={obj.id} style={{ padding: '10px 0', borderBottom: '1px dashed #1e293b', color: foundIds.includes(obj.id) ? '#22c55e' : '#e2e8f0' }}>
                <strong className="retro-font">{foundIds.includes(obj.id) ? '[FOUND] ' : '[LOST] '} {obj.name}:</strong> <em>"{obj.clue}"</em>
              </div>
            ))}
          </div>

          {allFoundInLevel && (
            <div style={{ marginTop: '30px', background: '#090d1a', border: '3px solid #22c55e', padding: '28px' }}>
              <h2 className="pixel-title" style={{ color: '#22c55e', marginTop: 0, fontSize: '18px' }}>
                SECTOR COMPLETE! ARCHIVE UNLOCKED
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '22px', marginBottom: '24px' }}>
                <img src={currentScene.backgroundImage} alt="Original NASA Scene" style={{ width: '100%', border: '2px solid #334155' }} />
                <div>
                  <h3 className="retro-font" style={{ color: selectedMission.themeColor, marginTop: 0 }}>
                    MISSION SUMMARY: {currentScene.title}
                  </h3>
                  <p style={{ lineHeight: '1.7', color: '#cbd5e1' }}>
                    {currentScene.totalStory || "Every piece of hardware in this sector worked together to push the boundaries of human knowledge."}
                  </p>
                  <a
                    href={currentScene.nasaArchiveLink || currentScene.objects[0]?.nasaLink}
                    target="_blank"
                    rel="noreferrer"
                    className="retro-btn"
                    style={{ display: 'inline-block', marginTop: '14px', textDecoration: 'none', borderColor: '#38bdf8', color: '#38bdf8' }}
                  >
                    OFFICIAL NASA ARCHIVE &gt;&gt;
                  </a>
                </div>
              </div>

              <h4 className="retro-font" style={{ color: '#fcd34d', borderBottom: '1px dashed #334155', paddingBottom: '8px' }}>
                RECOVERED HARDWARE LOGS:
              </h4>
              <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
                {currentScene.objects.map((obj) => (
                  <div key={obj.id} style={{ background: '#111827', padding: '14px', borderLeft: `4px solid ${selectedMission.themeColor}` }}>
                    <strong className="retro-font" style={{ color: selectedMission.themeColor }}>{obj.name}</strong>{' '}
                    <span style={{ fontSize: '12px', color: '#fcd34d' }}>({obj.status})</span>
                    <p style={{ margin: '8px 0', fontSize: '14px', color: '#e2e8f0' }}>"{obj.story}"</p>
                    <small style={{ color: '#94a3b8' }}><strong>Science:</strong> {obj.scienceFact}</small>
                  </div>
                ))}
              </div>

              <button onClick={goToNextLevel} className="retro-btn" style={{ background: '#22c55e', color: '#000', borderColor: '#22c55e' }}>
                {currentLevelIndex + 1 < selectedMission.scenes.length ? `NEXT LEVEL (LEVEL ${currentLevelIndex + 2}) >>` : 'RETURN TO SECTORS >>'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}