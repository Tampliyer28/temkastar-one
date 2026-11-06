import { useEffect, useRef } from 'react';
import { RARITIES, FALLBACK_IMG } from './RouletteItem';

const fmt = (n) => Number(n).toLocaleString('ru-RU');

export function WinModal({ open, prize, onClose }) {
  const keepRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    keepRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !prize) return null;
  const rarColor = RARITIES[prize.rarity] || RARITIES.common;
  const imgSrc = prize.img.startsWith('/') ? prize.img : `/${prize.img}`;

  return (
    <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box df" style={{ '--rar': rarColor }}>
        <h2>Ваш выигрыш</h2>
        <div className="modal-prize">
          <img src={imgSrc} alt={prize.name} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }} />
          <p className="name-gift">{prize.name}</p>
          <p className="price-inv">{prize.price > 0 ? `${fmt(prize.price)} ₽` : '—'}</p>
        </div>
        <div className="modal-btns df">
          <button className="export-btn" type="button" ref={keepRef} onClick={onClose} style={{borderRadius: '10px'}}>
            В инвентарь
          </button>
        </div>
      </div>
    </div>
  );
}