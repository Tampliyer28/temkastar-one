import { RARITIES, FALLBACK_IMG } from './RouletteItem';

const fmt = (n) => Number(n).toLocaleString('ru-RU');

export function PrizeBox({ prize }) {
  const rarColor = RARITIES[prize.rarity] || RARITIES.common;
  return (
    <div className="prize-box" style={{ '--rar': rarColor }}>
      <div className="prize-chance">{fmt(prize.chance)}%</div>
      <img src={prize.img} alt="" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }} />
      <p className="name-gift">{prize.name}</p>
      <p className="price-inv">{prize.price > 0 ? `${fmt(prize.price)} ₽` : '—'}</p>
    </div>
  );
}