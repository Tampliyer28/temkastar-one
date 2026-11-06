import { RouletteItem } from './RouletteItem';
const fmt = (n) => Number(n).toLocaleString('ru-RU');

export function Roulette({ rouletteRef, stripRef, strip, spinning, winIndex, isWinIndexRevealed, price, onOpen, coinImg }) {
  // Если strip не передан, ставим пустой массив
  const safeStrip = strip || [];

  return (
    <section className="roulette-wrap df">
      <div className="roulette" ref={rouletteRef}>
        <div className="roulette-pointer" />
        <div className="roulette-strip" ref={stripRef}>
          {safeStrip.map((prize, i) => (
            prize ? <RouletteItem key={`${prize.id}-${i}`} prize={prize} isWin={isWinIndexRevealed && i === winIndex} /> : null
          ))}
        </div>
      </div>
      <div className="roulette-controls df">
        <button className="btn-open" type="button" disabled={spinning} onClick={onOpen}>
          Открыть за {fmt(price)}
          <img className="coin-img" src={coinImg} alt="" />
        </button>
      </div>
    </section>
  );
}