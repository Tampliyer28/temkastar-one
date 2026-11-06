import { useEffect, useRef, useState } from 'react';
import { RARITIES, FALLBACK_IMG } from './RouletteItem';
import { router } from '@inertiajs/react';

const fmt = (n) => Number(n).toLocaleString('ru-RU');
const imgOf = (p) => (p.img.startsWith('/') ? p.img : `/${p.img}`);

function PrizeCard({ prize, small = false }) {
  const rarColor = RARITIES[prize.rarity] || RARITIES.common;
  return (
    <div className={`modal-prize${small ? ' modal-prize--sm' : ''}`} style={{ '--rar': rarColor }}>
      <img
        src={imgOf(prize)}
        alt={prize.name}
        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
      />
      <p className="name-gift">{prize.name}</p>
      <p className="price-inv">{prize.price > 0 ? `${fmt(prize.price)} ₽` : '—'}</p>
    </div>
  );
}

export function WinModal({ open, prizes, onClose }) {
  const keepRef = useRef(null);
  const [isSelling, setIsSelling] = useState(false);

  useEffect(() => {
    if (!open) return;
    keepRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !prizes || prizes.length === 0) return null;

  const multi = prizes.length > 1;
  const total = prizes.reduce((s, p) => s + (Number(p.price) || 0), 0);

  // Продажа всех подарков (работает и для 1, и для нескольких)
  const handleSellAll = async () => {
    if (!confirm('Вы уверены, что хотите продать все выигранные предметы?')) return;
    setIsSelling(true);

    try {
        const promises = prizes.map(p => 
            fetch(`/api/inventory/${p.id_inv}/sell`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
            })
        );

        await Promise.all(promises);
        router.reload({ only: ['balance', 'auth'] });
        onClose();
    } catch (e) {
        console.error(e);
        alert('Ошибка при продаже');
    } finally {
        setIsSelling(false);
    }
  };

  return (
    <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        className={`modal-box df${multi ? ' modal-box--multi' : ''}`}
        style={!multi ? { '--rar': RARITIES[prizes[0].rarity] || RARITIES.common } : undefined}
      >
        <h2>{multi ? 'Ваши выигрыши' : 'Ваш выигрыш'}</h2>

        {multi ? (
          <>
            <div className="modal-prizes">
              {prizes.map((p, i) => (
                <PrizeCard key={`${p.id}-${i}`} prize={p} small />
              ))}
            </div>
            <p className="modal-total">Общая стоимость: {fmt(total)} ₽</p>
          </>
        ) : (
          <PrizeCard prize={prizes[0]} />
        )}

        {/* Блок кнопок: Продать (слева) и В инвентарь (справа) */}
        <div className="modal-btns df">
            <button 
                className="sell-btn" 
                type="button" 
                onClick={handleSellAll}
                disabled={isSelling}
            >
                {isSelling ? 'Продажа...' : (multi ? 'Продать всё' : `Продать за ${fmt(prizes[0].price)} ₽`)}
            </button>
            <button 
                className="export-btn" 
                type="button" 
                ref={keepRef} 
                onClick={onClose} 
            >
                В инвентарь
            </button>
        </div>
      </div>
    </div>
  );
}