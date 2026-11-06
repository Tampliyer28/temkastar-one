import { useMemo } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useRoulette } from '@/hooks/useRoulette';
import { Roulette } from '@/components/ui/Roulette';
import { PrizeBox } from '@/components/ui/PrizeBox';
import { WinModal } from '@/components/ui/WinModal';

export default function CasePage({ caseData, prizes }) {
  const {
    rouletteRef, stripRef, strip, spinning, winPrize, modalOpen,
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

        <Roulette
          rouletteRef={rouletteRef}
          stripRef={stripRef}
          strip={strip}
          spinning={spinning}
          winIndex={WIN_INDEX}
          isWinIndexRevealed={modalOpen}
          price={caseData.price}
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

      <WinModal open={modalOpen} prize={winPrize} onClose={closeModal} />
    </AppLayout>
  );
}