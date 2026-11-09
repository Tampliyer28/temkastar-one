import { useRef, useState, useCallback, useLayoutEffect } from 'react';
import { router } from '@inertiajs/react';

const STRIP_LEN = 60;
const WIN_INDEX = 50;
const SPIN_MS = 4000;
const SPIN_EXTRA_MS = 600;
export const COUNT_OPTIONS = [1, 2, 5, 10];

function pickRandom(prizes) {
  if (!prizes || prizes.length === 0) return null;
  const total = prizes.reduce((s, p) => s + p.chance, 0);
  let r = Math.random() * total;
  for (const p of prizes) { r -= p.chance; if (r < 0) return p; }
  return prizes[0];
}

const makeStrip = (prizes, winner = null) =>
  Array.from({ length: STRIP_LEN }, (_, i) =>
    winner && i === WIN_INDEX ? winner : pickRandom(prizes)
  );

const makeStrips = (prizes, n, winners = null) =>
  Array.from({ length: n }, (_, i) => makeStrip(prizes, winners ? winners[i] : null));

export function useRoulette(caseId, allPrizes, callbacks = {}) {
  const rouletteRefs = useRef([]);
  const stripRefs = useRef([]);

  const [count, setCountState] = useState(1);
  const [spinning, setSpinning] = useState(false);
  const [winPrizes, setWinPrizes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [strips, setStrips] = useState(() => makeStrips(allPrizes, 1));

  useLayoutEffect(() => {
    strips.forEach((_, i) => {
      const s = stripRefs.current[i], r = rouletteRefs.current[i];
      if (!s || !r || !s.children[10]) return;
      const el = s.children[10];
      const off = el.offsetLeft + el.offsetWidth / 2 - r.clientWidth / 2;
      s.style.transition = 'none';
      s.style.transform = `translateX(${-off}px)`;
    });
  }, [strips]);

  const setCount = useCallback((n) => {
    if (spinning || modalOpen) return;
    setCountState(n);
    setStrips(makeStrips(allPrizes, n));
  }, [spinning, modalOpen, allPrizes]);

  const startAnimation = useCallback((n) => {
    setTimeout(() => {
      for (let i = 0; i < n; i++) {
        const s = stripRefs.current[i], r = rouletteRefs.current[i];
        const item = s?.children[WIN_INDEX];
        if (!s || !r || !item) continue;

        s.style.transition = 'none';
        s.style.transform = 'translateX(0)';
        void s.offsetWidth;

        const jitter = (Math.random() - 0.5) * item.offsetWidth * 0.7;
        const target = item.offsetLeft + item.offsetWidth / 2 + jitter - r.clientWidth / 2;
        const duration = SPIN_MS + (n > 1 ? Math.random() * SPIN_EXTRA_MS : 0);

        requestAnimationFrame(() => {
          s.style.transition = `transform ${duration}ms cubic-bezier(0.12, 0.6, 0.1, 1)`;
          s.style.transform = `translateX(${-target}px)`;
        });
      }

      setTimeout(() => {
        setSpinning(false);
        setModalOpen(true);
      }, SPIN_MS + (n > 1 ? SPIN_EXTRA_MS : 0) + 300);
    }, 50);
  }, []);

  const openCase = useCallback(async () => {
    if (spinning || modalOpen) return;
    setSpinning(true);

    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content
        || document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || '';

      const res = await fetch(`/api/case/${caseId}/open`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({ count }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Ошибка');
      }

      const data = await res.json();
      const winners = data.prizes || [];
      if (winners.length === 0) throw new Error('Сервер не вернул призы');

      // ВЫЗОВ МОДАЛКИ ПРИ ПОВЫШЕНИИ УРОВНЯ
      if (data.levelUp && callbacks.onLevelUp) {
        callbacks.onLevelUp(data.levelUp);
      }

      router.reload({ only: ['balance', 'auth'] });

      setWinPrizes(winners);
      setStrips(makeStrips(allPrizes, winners.length, winners));

      setTimeout(() => startAnimation(winners.length), 100);
    } catch (error) {
      console.error(error);
      alert(error.message);
      setSpinning(false);
    }
  }, [spinning, modalOpen, caseId, count, allPrizes, startAnimation, callbacks]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setWinPrizes([]);
    setStrips(makeStrips(allPrizes, count));
  }, [allPrizes, count]);

  return {
    rouletteRefs,
    stripRefs,
    strips,
    count,
    setCount,
    spinning,
    winPrizes,
    modalOpen,
    openCase,
    closeModal,
    WIN_INDEX,
  };
}