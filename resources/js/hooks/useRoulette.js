import { useRef, useState, useCallback, useLayoutEffect } from 'react';
import { router } from '@inertiajs/react';

const STRIP_LEN = 60;
const WIN_INDEX = 50;
const SPIN_MS = 4000;

function pickRandom(prizes) {
  if (!prizes || prizes.length === 0) return null;
  const total = prizes.reduce((s, p) => s + p.chance, 0);
  let r = Math.random() * total;
  for (const p of prizes) { r -= p.chance; if (r < 0) return p; }
  return prizes[0];
}

export function useRoulette(caseId, allPrizes) {
  const rouletteRef = useRef(null);
  const stripRef = useRef(null);
  
  const [spinning, setSpinning] = useState(false);
  const [winPrize, setWinPrize] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [strip, setStrip] = useState(() =>
    Array.from({ length: STRIP_LEN }, () => pickRandom(allPrizes))
  );

  // Центрируем ленту в покое
  useLayoutEffect(() => {
    const s = stripRef.current, r = rouletteRef.current;
    if (!s || !r || !s.children[10]) return;
    const el = s.children[10];
    const off = el.offsetLeft + el.offsetWidth / 2 - r.clientWidth / 2;
    s.style.transition = 'none';
    s.style.transform = `translateX(${-off}px)`;
  }, []);

  const openCase = useCallback(async () => {
    if (spinning) return;
    setSpinning(true);

    try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || '';

        const res = await fetch(`/api/case/${caseId}/open`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
            },
            // Отправляем count: 1, чтобы бэкенд знал, что открываем один
            body: JSON.stringify({ count: 1 }), 
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Ошибка');
        }

        const data = await res.json();
        const winner = data.prizes[0]; // Берем первый приз

        router.reload({ only: ['balance', 'auth'] });

        setWinPrize(winner);

        // Пересобираем ленту для анимации
        setStrip(Array.from({ length: STRIP_LEN }, (_, i) =>
            i === WIN_INDEX ? winner : pickRandom(allPrizes)
        ));
        
        setTimeout(() => {
            startAnimation(winner);
        }, 100);

    } catch (error) {
        console.error(error);
        alert(error.message);
        setSpinning(false);
    }
  }, [spinning, caseId, allPrizes]);

  const startAnimation = useCallback((winner) => {
    const s = stripRef.current, r = rouletteRef.current;
    if (!s || !r) return;

    setTimeout(() => {
        const item = s.children[WIN_INDEX];
        if (!item) return;

        s.style.transition = 'none';
        s.style.transform = 'translateX(0)';
        void s.offsetWidth;

        const jitter = (Math.random() - 0.5) * item.offsetWidth * 0.7;
        const target = item.offsetLeft + item.offsetWidth / 2 + jitter - r.clientWidth / 2;

        requestAnimationFrame(() => {
            s.style.transition = `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.6, 0.1, 1)`;
            s.style.transform = `translateX(${-target}px)`;
        });

        let done = false;
        const finish = () => {
            if (done) return;
            done = true;
            s.removeEventListener('transitionend', finish);
            setSpinning(false);
            setModalOpen(true);
        };
        s.addEventListener('transitionend', finish);
        setTimeout(finish, SPIN_MS + 300);
    }, 50);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setWinPrize(null);
    setStrip(Array.from({ length: STRIP_LEN }, () => pickRandom(allPrizes)));
  }, [allPrizes]);

  return {
    rouletteRef, 
    stripRef, 
    strip, 
    spinning, 
    winPrize, 
    modalOpen,
    openCase, 
    closeModal, 
    WIN_INDEX,
  };
}