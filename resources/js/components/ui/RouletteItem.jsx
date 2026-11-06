const RARITIES = {
  common:    'var(--rar-common)',
  uncommon:  '#3292FF', 
  rare:      '#8C25ED', // В вашей БД rare идет перед epic, задайте свой цвет
  epic:      '#FFB020',
  legendary: '#FFD700', // Золотой для легендарок
};

const FALLBACK_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#3292FF" d="M32 4l8.4 17.6 19.2 2.6-14 13.4 3.5 19.1L32 47.6 14.9 56.7l3.5-19.1-14-13.4 19.2-2.6z"/></svg>'
);

export function RouletteItem({ prize, isWin }) {
  const rarColor = RARITIES[prize.rarity] || RARITIES.common;
  return (
    <div className={`roulette-item${isWin ? ' is-win' : ''}`} style={{ '--rar': rarColor }}>
      <img src={prize.img} alt="" draggable={false} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }} />
      <span>{prize.name}</span>
    </div>
  );
}
export { RARITIES, FALLBACK_IMG };