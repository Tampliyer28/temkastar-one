import { RouletteItem } from './RouletteItem';
import { COUNT_OPTIONS } from '@/hooks/useRoulette';

const fmt = (n) => Number(n).toLocaleString('ru-RU');

export function Roulette({
  rouletteRefs, stripRefs, strips, spinning, winIndex, isWinIndexRevealed,
  price, count, onCountChange, onOpen, coinImg,
}) {
  const safeStrips = strips || [];
  const multi = safeStrips.length > 1;
  const many = safeStrips.length > 2;

  return (
    <section className="roulette-wrap df">
      <div className={`roulette-list${multi ? ' roulette-list--multi' : ''}${many ? ' roulette-list--many' : ''}`}>
        {safeStrips.map((strip, idx) => (
          <div
            key={idx}
            className={`roulette${multi ? ' roulette--compact' : ''}`}
            ref={(el) => { rouletteRefs.current[idx] = el; }}
          >
            <div className="roulette-pointer" />
            <div className="roulette-strip" ref={(el) => { stripRefs.current[idx] = el; }}>
              {strip.map((prize, i) => (
                prize ? (
                  <RouletteItem
                    key={`${prize.id}-${i}`}
                    prize={prize}
                    isWin={isWinIndexRevealed && i === winIndex}
                  />
                ) : null
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="roulette-controls df">
        <div className="count-select" role="group" aria-label="Количество кейсов">
          {COUNT_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              className={`count-btn${count === n ? ' is-active' : ''}`}
              disabled={spinning}
              aria-pressed={count === n}
              onClick={() => onCountChange(n)}
            >
              {n} шт
            </button>
          ))}
        </div>

        <button className="btn-open" type="button" disabled={spinning} onClick={onOpen}>
          Открыть за {fmt(price * count)}
          <img className="coin-img" src={coinImg} alt="" />
        </button>
      </div>
    </section>
  );
}
