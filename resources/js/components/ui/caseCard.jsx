import { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useRoulette } from '@/hooks/useRoulette';
import { Roulette } from '@/components/ui/Roulette';
import { PrizeBox } from '@/components/ui/PrizeBox';
import { WinModal } from '@/components/ui/WinModal';

export default function CasePage({ caseData, prizes }) {
  const [count, setCount] = useState(1);

  const {
    setRouletteRefs, setStripRefs, strips, spinning, winPrizes, modalOpen,
    openCase, closeModal, WIN_INDEX,
  } = useRoulette(caseData.id, prizes);

  const sorted = useMemo(
    () => [...prizes].sort((a, b) => a.chance - b.chance),
    [prizes]
  );

  return (
    <AppLayout>
      <Head title={`${caseData.name} — TemkaStar`} />
      <main className="cont case-page df">
        <section className="case-head df">
          <a href="/" className="back-link">← Все кейсы</a>
          <h1 className="case-title gradient-underline">{caseData.name}</h1>
        </section>

        {/* Если не крутим — показываем одну рулетку */}
        {!spinning && strips.length === 0 && (
          <section className="roulette-wrap df">
            <div className="roulette" ref={(el) => setRouletteRefs([el])}>
              <div className="roulette-pointer" />
              <div className="roulette-strip" ref={(el) => setStripRefs([el])}>
                 {/* Для пустой рулетки можно взять любой приз для отображения */}
                 {Array.from({ length: 20 }).map((_, i) => (
                    <RouletteItem key={i} prize={prizes[0]} isWin={false} />
                 ))}
              </div>
            </div>
          </section>
        )}

        {/* Если крутим — показываем столько рулеток, сколько выбрали */}
        {spinning && (
          <section className="roulettes-multi df" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {strips.map((strip, index) => (
                <div key={index} style={{ flex: '1', maxWidth: '300px' }}>
                    <div className="roulette" ref={(el) => {
                        if (el && !rouletteRefs[index]) setRouletteRefs(prev => [...prev, el]);
                    }}>
                        <div className="roulette-pointer" />
                        <div className="roulette-strip" ref={(el) => {
                            if (el && !stripRefs[index]) setStripRefs(prev => [...prev, el]);
                        }}>
                            {strip.map((prize, i) => (
                                <RouletteItem key={i} prize={prize} isWin={i === WIN_INDEX} />
                            ))}
                        </div>
                    </div>
                </div>
            ))}
          </section>
        )}

        <div className="roulette-controls df" style={{ marginTop: '30px' }}>
          {/* Выбор количества */}
          {!spinning && (
            <div className="df" style={{ gap: '10px', marginRight: '20px' }}>
              {[1, 2, 5].map(n => (
                <button
                  key={n}
                  className={`btn-demo ${count === n ? 'active' : ''}`}
                  onClick={() => setCount(n)}
                  style={{ padding: '10px 20px' }}
                >
                  x{n}
                </button>
              ))}
            </div>
          )}

          <button 
            className="btn-open" 
            disabled={spinning} 
            onClick={() => openCase(count)}
          >
            Открыть за {Number(caseData.price * count).toLocaleString('ru-RU')}
            <img className="coin-img" src={caseData.currency_img} alt="" />
          </button>
        </div>

        <section className="section-case df">
          <h2 className="gradient-underline">Что внутри кейса</h2>
          <div className="all-case-cont df">
            {sorted.map((p) => <PrizeBox key={p.id} prize={p} />)}
          </div>
        </section>
      </main>

      <WinModal open={modalOpen} prizes={winPrizes} onClose={closeModal} />
    </AppLayout>
  );
}