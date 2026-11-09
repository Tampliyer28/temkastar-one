import { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useRoulette } from '@/hooks/useRoulette';
import { Roulette } from '@/components/ui/Roulette';
import { PrizeBox } from '@/components/ui/PrizeBox';
import { WinModal } from '@/components/ui/WinModal';
import { LevelUpModal } from '@/Components/ui/LevelUpModal';

export default function CasePage({ caseData, prizes }) {
  const [levelUp, setLevelUp] = useState(null);

  const {
    rouletteRefs, stripRefs, strips, count, setCount, spinning,
    winPrizes, modalOpen, openCase, closeModal, WIN_INDEX,
  } = useRoulette(caseData.id, prizes, {
    onLevelUp: (data) => setLevelUp(data),
  });

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

        <Roulette
          rouletteRefs={rouletteRefs}
          stripRefs={stripRefs}
          strips={strips}
          spinning={spinning}
          winIndex={WIN_INDEX}
          isWinIndexRevealed={modalOpen}
          price={caseData.price}
          count={count}
          onCountChange={setCount}
          onOpen={openCase}
          coinImg={caseData.currency_img}
        />

        <section className="section-case df">
          <h2 className="gradient-underline">Что внутри кейса</h2>
          <div className="all-case-cont df">
            {sorted.map((p) => <PrizeBox key={p.id} prize={p} />)}
          </div>
        </section>
      </main>

      <WinModal open={modalOpen} prizes={winPrizes} onClose={closeModal} />
      <LevelUpModal open={!!levelUp} level={levelUp?.new_level} onClose={() => setLevelUp(null)} />
    </AppLayout>
  );
}