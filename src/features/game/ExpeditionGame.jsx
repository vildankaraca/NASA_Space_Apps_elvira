import ArchiveCard from './components/ArchiveCard';
import { useEffect, useState } from 'react';
import { expeditions } from '../../data/expeditions';
import './ExpeditionGame.css';

const storageKey = id => `elvira-expedition-v1-${id}`;
function readProgress(id, data) {
  try { const saved = JSON.parse(localStorage.getItem(storageKey(id))); const valid = new Set(data.scenes.flatMap(s => s.targets.map(t => t.id)));
    return { radarUsed: Array.isArray(saved?.radarUsed) ? saved.radarUsed.filter(id => data.scenes.some(scene => scene.id === id)) : [], found: Array.isArray(saved?.found) ? saved.found.filter(x => valid.has(x)) : [], index: Math.max(0, Math.min(data.scenes.length - 1, Number(saved?.index) || 0)) }; } catch { return { found: [], index: 0, radarUsed: [] }; }
}
function radarSignal(point, targets, aspect = 16 / 9) {
  if (!point || !targets.length) return { strength: 0, level: 'AWAITING SCAN', pulseIntervalMs: 1400 };
  const distance = Math.min(...targets.map(t => Math.hypot((point.x - t.box[0] - t.box[2] / 2) * aspect, point.y - t.box[1] - t.box[3] / 2))) / Math.hypot(100 * aspect, 100);
  const strength = Math.max(0, Math.min(1, 1 - distance / .65));
  return { strength, level: strength > .87 ? 'VERY CLOSE' : strength > .7 ? 'CLOSE' : strength > .4 ? 'WARM' : 'DISTANT', pulseIntervalMs: Math.round(1400 - strength * 1250) };
}
export default function ExpeditionGame({ sector, onExit, onRadarSignal }) {
  const data = expeditions[sector.id];
  const [initial] = useState(() => readProgress(sector.id, data));
  const [found, setFound] = useState(initial.found);
  const [radarUsed, setRadarUsed] = useState(initial.radarUsed);
  const [index, setIndex] = useState(initial.index);
  const [phase, setPhase] = useState(data.video ? 'landing' : 'story');
  const [card, setCard] = useState(null);
  const [warning, setWarning] = useState(null);
  const [radarUntil, setRadarUntil] = useState(0);
  const [now, setNow] = useState(0);
  const [point, setPoint] = useState(null);
  const [aspect, setAspect] = useState(16 / 9);
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [debug, setDebug] = useState(false);
  const scene = data.scenes[index];
  const hintUsed = radarUsed.includes(scene.id);
  const all = data.scenes.flatMap(s => s.targets);
  const remaining = scene.targets.filter(t => !found.includes(t.id));
  const seconds = Math.max(0, Math.ceil((radarUntil - now) / 1000));
  const active = radarUntil > 0 && seconds > 0 && phase === 'search' && !card;
  const signal = radarSignal(active ? point : null, remaining, aspect);
  useEffect(() => { try { localStorage.setItem(storageKey(sector.id), JSON.stringify({ found, index, radarUsed })); } catch { /* Play remains available without storage. */ } }, [found, index, radarUsed, sector.id]);
  useEffect(() => { if (!radarUntil) return; const timer = setInterval(() => { const time = Date.now(); setNow(time); if (time >= radarUntil) setRadarUntil(0); }, 100); return () => clearInterval(timer); }, [radarUntil]);
  useEffect(() => { if (!warning) return; const timer = setTimeout(() => setWarning(null), 2400); return () => clearTimeout(timer); }, [warning]);
  useEffect(() => { onRadarSignal?.({ active, strength: signal.strength, level: signal.level, pulseIntervalMs: signal.pulseIntervalMs }); }, [active, signal.strength, signal.level, signal.pulseIntervalMs, onRadarSignal]);
  useEffect(() => () => onRadarSignal?.({ active: false, strength: 0, level: 'OFF', pulseIntervalMs: 0 }), [onRadarSignal]);
  function navigate(next, nextPhase = 'briefing') { setIndex(next); setPhase(nextPhase); setRadarUntil(0); setPoint(null); setWarning(null); setImageError(false); setCard(null); }
  function openCard(target) { setCard(target); setRadarUntil(0); }
  function discover(target) { setFound(ids => ids.includes(target.id) ? ids : [...ids, target.id]); setWarning(null); openCard(target); }
  function locate(event) { const rect = event.currentTarget.getBoundingClientRect(); setAspect(rect.width / rect.height); setPoint({ x: (event.clientX - rect.left) / rect.width * 100, y: (event.clientY - rect.top) / rect.height * 100 }); }
  return <main className="expedition" style={{ '--sector': sector.themeColor }}>
    <header className="ex-header"><div><p className="ex-eyebrow">ABANDONED, BUT NOT FORGOTTEN</p><h1>{sector.title.split(':')[0]} / Expedition</h1></div><button onClick={onExit}>← Sectors</button></header>
    {phase === 'landing' ? <section className="ex-landing">
      {!videoError && <video src={data.video} autoPlay muted playsInline controls onEnded={() => setPhase('story')} onError={() => setVideoError(true)} />}
      <div className="ex-landing-copy"><p className="ex-eyebrow">DESCENT SEQUENCE</p><h2>{videoError ? 'Your expedition is ready.' : 'A new world. Forgotten stories.'}</h2><button onClick={() => setPhase('story')}>{videoError ? 'Continue' : 'Skip landing →'}</button></div>
    </section> : <div className="ex-layout"><section className="ex-main">
      {phase === 'story' && <section className="ex-story"><p className="ex-eyebrow">TRANSMISSION / MISSION CONTROL</p><h2>The silence has a story.</h2><p>{data.story}</p><button className="ex-primary" onClick={() => navigate(index)}>{found.length ? 'Resume expedition →' : 'Begin expedition →'}</button>{data.video && <button onClick={() => setPhase('landing')}>Replay landing</button>}</section>}
      {phase === 'briefing' && <section className="ex-story"><p className="ex-eyebrow">MISSION {index + 1} / {data.scenes.length}</p><h2>{scene.title}</h2><p>Recover {scene.targets.length === 1 ? 'this explorer’s story' : 'both explorers’ stories'}. Look for their shapes among the forgotten machines.</p>
        <div className="ex-brief-targets">{scene.targets.map(t => <div key={t.id}><img className={found.includes(t.id) ? '' : 'ex-silhouette'} src={t.image} alt={found.includes(t.id) ? t.name : `Silhouette of ${t.name}`} /><h3>{t.name}</h3><p>{t.brief}</p></div>)}</div>
        <button onClick={() => index ? navigate(index - 1) : setPhase('story')}>← Back</button><button className="ex-primary" onClick={() => setPhase('search')}>Enter search area →</button></section>}
      {phase === 'search' && <>
        <div className="ex-mission-heading"><div><p className="ex-eyebrow">MISSION {index + 1} / {data.scenes.length}</p><h2>{scene.title}</h2></div><span>{scene.targets.length - remaining.length}/{scene.targets.length} RECOVERED</span></div>
        <div className="ex-radar"><button disabled={active || hintUsed || !remaining.length} onClick={() => { if (hintUsed || !remaining.length) return; const time = Date.now(); setRadarUsed(ids => [...new Set([...ids, scene.id])]); setNow(time); setPoint(null); setRadarUntil(time + 5000); }}>Radar hint {active ? seconds + 's' : hintUsed ? ' / Used' : ' / 5s / 1 use'}</button>
          <span role="status">{active ? point ? signal.level : 'Move your pointer or touch the scene' : 'SCANNER STANDBY'}</span><meter min="0" max="1" value={active ? signal.strength : 0} aria-label="Radar proximity" /><span className="ex-pulse" style={{ opacity: active ? 1 : .2, animationDuration: `${signal.pulseIntervalMs}ms` }} /></div>
        <div className="ex-scene" onPointerMove={locate} onPointerDown={locate} onClick={() => setWarning({ text: 'No match. Follow the mission clues and keep searching.' })}>
          {imageError ? <div className="ex-story"><p>Scene could not load.</p><button onClick={e => { e.stopPropagation(); setImageError(false); }}>Retry image</button></div> : <img key={scene.id} src={scene.image} alt={`${scene.title}, illustrated hidden-object scene`} onError={() => setImageError(true)} draggable={false} />}
          {!imageError && scene.targets.map((t, i) => <button key={t.id} aria-label={`Inspect object ${i + 1}`} className={`ex-hit ${found.includes(t.id) ? 'recovered' : ''} ${debug ? 'debug' : ''}`} style={{ left: `${t.box[0]}%`, top: `${t.box[1]}%`, width: `${t.box[2]}%`, height: `${t.box[3]}%` }} onFocus={() => setPoint({ x: t.box[0] + t.box[2] / 2, y: t.box[1] + t.box[3] / 2 })} onClick={e => { e.stopPropagation(); discover(t); }}>{debug ? t.name : ''}</button>)}
        </div>
        <p className="ex-feedback" role="status">{warning?.text || (remaining.length ? 'Search the scene. Every machine has a story.' : 'All mission targets recovered. Your archive is growing.')}</p>
        <div className="ex-clues">{scene.targets.map(t => <article key={t.id}><span className="ex-eyebrow">{found.includes(t.id) ? 'RECOVERED' : 'SEARCH TARGET'}</span><h3>{t.name}</h3><p>{t.brief}</p></article>)}</div>
        <nav className="ex-nav"><button onClick={() => navigate(index)}>← Briefing</button>{index > 0 && <button onClick={() => navigate(index - 1, 'search')}>Previous mission</button>}<button className="ex-primary" disabled={remaining.length > 0} onClick={() => index + 1 < data.scenes.length ? navigate(index + 1) : navigate(index, 'complete')}>{index + 1 === data.scenes.length ? 'Complete expedition' : 'Next mission →'}</button></nav>
        {import.meta.env.DEV && <details className="ex-debug"><summary>Scene alignment tools</summary><label><input type="checkbox" checked={debug} onChange={e => setDebug(e.target.checked)} /> Show target areas</label><p>{point ? `${point.x.toFixed(1)}%, ${point.y.toFixed(1)}%` : 'Point at the scene to inspect coordinates.'}</p></details>}
      </>}
      {phase === 'complete' && <section className="ex-story"><p className="ex-eyebrow">EXPEDITION COMPLETE</p><h2>Forgotten no longer.</h2><p>You recovered {found.length} stories. Your collection stays with you when you return.</p><button onClick={() => navigate(0)}>Revisit missions</button><button className="ex-primary" onClick={onExit}>Choose another sector →</button></section>}
      <p className="ex-caption">Illustrated archive scenes, not historical landing-site reconstructions.{sector.id === 'deepSpace' && ' The surface backdrops are artistic composites; these spacecraft explored other destinations.'}</p>
    </section><aside className="ex-collection"><p className="ex-eyebrow">YOUR FIELD ARCHIVE</p><h2>Recovered stories</h2><p>{found.length} / {all.length} cards collected</p><div className="ex-card-grid">{all.map((t,i) => <button className={`ex-mini ${found.includes(t.id) ? 'unlocked' : ''}`} key={t.id} disabled={!found.includes(t.id)} onClick={() => openCard(t)} aria-label={`${t.name}: ${found.includes(t.id) ? 'open collected card' : 'locked'}`}><span>#{String(i + 1).padStart(2,'0')}</span><img className={found.includes(t.id) ? '' : 'ex-silhouette'} src={t.image} alt="" /><strong>{found.includes(t.id) ? t.name : 'UNKNOWN'}</strong><small>{found.includes(t.id) ? 'VIEW CARD ↗' : 'AWAITING DISCOVERY'}</small></button>)}</div></aside></div>}
    {card && <ArchiveCard key={card.id} target={card} onClose={() => setCard(null)} />}
  </main>;
}
