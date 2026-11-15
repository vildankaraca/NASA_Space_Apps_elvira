import { useEffect, useRef, useState } from 'react';
import { archiveDetails } from '../../../data/archiveDetails';
import photos from '../../../data/archivePhotos.json';
import './ArchiveCard.css';

export default function ArchiveCard({ target, onClose }) {
  const dialogRef = useRef(null);
  const backRef = useRef(null);
  const [flipped, setFlipped] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);
  const details = archiveDetails[target.id];
  const photo = photos[target.id];
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => { dialog.close(); previous?.focus(); };
  }, []);
  function flip() {
    if (!flipped && backRef.current) backRef.current.scrollTop = 0;
    setFlipped(value => !value);
  }
  return <dialog ref={dialogRef} className={flipped ? 'archive-dialog' : 'ex-card archive-original'} aria-labelledby="archive-title"
    onCancel={event => { event.preventDefault(); onClose(); }}>
    {!flipped ? <>
      <button type="button" className="ex-close" onClick={onClose} aria-label="Close card">×</button>
      <p className="ex-eyebrow">ARCHIVE / RECOVERED</p>
      <button type="button" className="archive-original-flip" onClick={flip}>Flip the card ↻</button>
      <img src={target.image} alt={`${target.name}, pixel art illustration`} />
      <h2 id="archive-title">{target.name}</h2><p>{target.brief}</p>
      <div className="ex-card-footer">COLLECTION ENTRY UNLOCKED</div>
      <button type="button" onClick={onClose}>Return to expedition</button>
    </> : <>
      <header className="archive-toolbar"><span className="archive-eyebrow">FIELD ARCHIVE / RECOVERED</span><button type="button" className="archive-close" onClick={onClose} aria-label="Close card">×</button></header>
      <h2 id="archive-title" className="archive-title">{target.name}</h2>
      <section ref={backRef} id="archive-back" className="archive-back archive-details-view" aria-label="Mission details" tabIndex={0}>
          {photo && <figure className="archive-photo">
            {photoFailed ? <div className="archive-photo-fallback">Photo unavailable. You can open the original NASA image below.</div> :
              <img src={`${import.meta.env.BASE_URL}${photo.src.replace(/^\//, '')}`} alt={photo.alt} onError={() => setPhotoFailed(true)} />}
            <figcaption>{photo.caption}<span>Credit: {photo.credit}</span><a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer">Original NASA image ↗</a></figcaption>
          </figure>}
          {details ? <>
            <dl className="archive-facts"><div><dt>MISSION</dt><dd>{details.missionName}</dd></div><div><dt>YEARS</dt><dd>{details.years}</dd></div><div><dt>LOCATION</dt><dd>{details.location}</dd></div></dl>
            <section className="archive-section"><h3>01 / WHY IT WENT</h3><p>{details.purpose}</p></section>
            <section className="archive-section"><h3>02 / WHAT IT TAUGHT US</h3><p>{details.science}</p></section>
            <section className="archive-section"><h3>03 / ITS STORY</h3><p>{details.story}</p></section>
            {details.note && <p className="archive-context">{details.note}</p>}
            <a className="archive-source" href={details.nasaUrl} target="_blank" rel="noopener noreferrer">Explore the NASA mission ↗</a>
          </> : <p>More mission details are on their way.</p>}

      </section>
      <footer className="archive-actions"><span className="archive-side-label">MISSION FILE · Scroll to explore</span><button type="button" className="archive-flip-button" onClick={flip}>↶ Back to card</button></footer>
    </>}
  </dialog>;
}
