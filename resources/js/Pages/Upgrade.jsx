import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';

const fmt = (n) => Number(n).toLocaleString('ru-RU');

// ─────────────────────────────────────────────────────────────
// EASING
// ─────────────────────────────────────────────────────────────
const easeInOutQuint = (t) =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

// ─────────────────────────────────────────────────────────────
// ПЛАВНОЕ ЧИСЛО (для шанса)
// ─────────────────────────────────────────────────────────────
function useAnimatedNumber(target, duration = 350, instant = false) {
    const [value, setValue] = useState(target);
    const fromRef = useRef(target);
    const rafRef = useRef(null);

    useEffect(() => {
        const to = target;

        if (instant) {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            fromRef.current = to;
            setValue(to);
            return;
        }

        const from = fromRef.current;
        if (from === to) return;

        const t0 = performance.now();
        const tick = (now) => {
            const t = Math.min((now - t0) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
            setValue(from + (to - from) * eased);
            if (t < 1) {
                rafRef.current = requestAnimationFrame(tick);
            } else {
                fromRef.current = to;
            }
        };
        rafRef.current = requestAnimationFrame(tick);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [target, duration, instant]);

    return value;
}

// ─────────────────────────────────────────────────────────────
// ЗВУК ТИКОВ
// ─────────────────────────────────────────────────────────────
function useTickSound() {
    const ctxRef = useRef(null);

    const playTick = useCallback((intensity = 1) => {
        try {
            if (!ctxRef.current) {
                const AC = window.AudioContext || window.webkitAudioContext;
                if (!AC) return;
                ctxRef.current = new AC();
            }
            const ctx = ctxRef.current;
            if (ctx.state === 'suspended') ctx.resume();

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(1400 + Math.random() * 200, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.03);

            const vol = 0.06 * intensity;
            gain.gain.setValueAtTime(vol, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

            osc.connect(gain).connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.06);
        } catch (_) {
            /* тихо игнорим */
        }
    }, []);

    return playTick;
}

// ─────────────────────────────────────────────────────────────
// АНИМАТОР: медленный разгон → быстрая крутка → плавная остановка
// ─────────────────────────────────────────────────────────────
function useUpgradeSpin() {
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);

    const rotationRef = useRef(0);
    const rafRef = useRef(null);
    const playTick = useTickSound();
    const lastTickSectorRef = useRef(0);

    const SECTORS = 12;
    const DEG_PER_SECTOR = 360 / SECTORS;

    const spin = useCallback((targetAngle, opts = {}) => {
        const {
            totalSpins = 10 + Math.floor(Math.random() * 4),
            duration = 5000,
            rampUp = 0.20,
            rampDown = 0.50,
        } = opts;

        return new Promise((resolve) => {
            setIsSpinning(true);

            // ── СБРОС В ВЕРХ ──
            // Ставим стрелку в 0 без анимации, чтобы каждая крутка
            // начиналась с верхней точки колеса.
            const startRotation = 0;
            rotationRef.current = 0;
            setRotation(0);
            // ──────────────────

            const startMod = 0;
            let diff = targetAngle - startMod;
            if (diff < 0) diff += 360;

            const fullDistance = totalSpins * 360 + diff;
        // ... остальное без изменений

            const t0 = performance.now();
            lastTickSectorRef.current = Math.floor(startRotation / DEG_PER_SECTOR);

            const finish = (finalValue) => {
                rotationRef.current = finalValue;
                setRotation(finalValue);
                setIsSpinning(false);
                if (rafRef.current) {
                    cancelAnimationFrame(rafRef.current);
                    rafRef.current = null;
                }
                resolve();
            };

            const frame = (now) => {
                const elapsed = now - t0;
                const t = Math.min(elapsed / duration, 1);

                let eased;
                if (t < rampUp) {
                    const u = t / rampUp;
                    eased = u * u * 0.15; // медленный разгон, 0–15% пути
                } else if (t < 1 - rampDown) {
                    const u = (t - rampUp) / (1 - rampUp - rampDown);
                    eased = 0.15 + u * 0.7; // быстрая крутка, 15–85% пути
                } else {
                    const u = (t - (1 - rampDown)) / rampDown;
                    eased = 0.85 + (1 - Math.pow(1 - u, 5)) * 0.15; // торможение, 85–100%
                }

                const current = startRotation + fullDistance * eased;

                if (t >= 1) {
                    finish(startRotation + fullDistance);
                    return;
                }

                const sector = Math.floor(current / DEG_PER_SECTOR);
                if (sector !== lastTickSectorRef.current) {
                    const progress = Math.min((current - startRotation) / fullDistance, 1);
                    playTick(1 - progress * 0.6);
                    lastTickSectorRef.current = sector;
                }

                rotationRef.current = current;
                setRotation(current);
                rafRef.current = requestAnimationFrame(frame);
            };

            rafRef.current = requestAnimationFrame(frame);
        });
    }, [playTick]);

    useEffect(
        () => () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        },
        []
    );

    return { rotation, isSpinning, spin };
}

// ─────────────────────────────────────────────────────────────
// КОМПОНЕНТ
// ─────────────────────────────────────────────────────────────
export default function Upgrade({ inventory, catalog }) {
    const [selectedItems, setSelectedItems] = useState([]);
    const [targetGift, setTargetGift] = useState(null);

    const [result, setResult] = useState(null);

    const { rotation, isSpinning, spin } = useUpgradeSpin();

    const [invSearch, setInvSearch] = useState('');
    const [invSort, setInvSort] = useState('price_desc');
    const [catSearch, setCatSearch] = useState('');
    const [catSort, setCatSort] = useState('price_asc');

    const currentValue = useMemo(
        () => selectedItems.reduce((sum, item) => sum + item.price, 0),
        [selectedItems]
    );

    const chance = useMemo(() => {
        if (!targetGift || currentValue === 0) return 0;
        return Math.min((currentValue / targetGift.price) * 100, 90);
    }, [currentValue, targetGift]);

    // Плавная анимация шанса. После спина (result !== null) — мгновенный сброс.
    const animatedChance = useAnimatedNumber(chance, 350, result !== null);

    const isInvalidTarget = targetGift && currentValue >= targetGift.price;
    const canUpgrade = targetGift && selectedItems.length > 0 && !isSpinning && !isInvalidTarget;

    const addItem = (item) => {
        if (isSpinning) return;
        if (selectedItems.length >= 5) {
            return alert('Максимальное количество предметов для апгрейда — 5.');
        }
        const alreadySelected = selectedItems.filter((i) => i.id === item.id).length;
        if (alreadySelected >= item.count) return;
        setSelectedItems([...selectedItems, item]);
    };

    const clearAllItems = () => {
        if (isSpinning) return;
        setSelectedItems([]);
    };

    const selectTarget = (gift) => {
        if (isSpinning) return;
        if (currentValue >= gift.price) return alert('Цель должна быть дороже ставки!');
        setTargetGift(gift);
    };

    const handleUpgrade = async () => {
        if (!canUpgrade) return;

        setResult(null);

        let serverResult = null;
        try {
            const res = await fetch('/api/upgrade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({
                    inventory_ids: selectedItems.map((i) => i.id),
                    target_gift_id: targetGift.id,
                }),
            });
            const data = await res.json();
            serverResult = !res.ok ? { success: false, error: data.message } : data;
        } catch (e) {
            serverResult = { success: false, error: 'Ошибка сети' };
        }

        const isWin = serverResult ? serverResult.success : false;

        const chanceAngle = (chance / 100) * 360;
        const targetAngle = isWin
            ? Math.random() * Math.max(chanceAngle - 6, 1)
            : chanceAngle + 6 + Math.random() * (360 - chanceAngle - 12);

        await spin(targetAngle, {
            totalSpins: 10 + Math.floor(Math.random() * 4),
            duration: 4000,
            rampUp: 0.25,
            rampDown: 0.35,
        });

        await new Promise((r) => setTimeout(r, 180));

        // Один батч: результат + сброс ставки/цели. Шанс сбросится мгновенно,
        // т.к. result !== null → instant = true в useAnimatedNumber.
        setResult(isWin ? 'success' : 'fail');
        setSelectedItems([]);
        setTargetGift(null);
        router.reload({ only: ['inventory'] });

        setTimeout(() => {
            setResult(null);
            
        }, 2000);
    };

    const filteredInventory = useMemo(() => {
        let res = [...inventory];
        if (invSearch) res = res.filter((i) => i.name.toLowerCase().includes(invSearch.toLowerCase()));
        return res.sort((a, b) => (invSort === 'price_desc' ? b.price - a.price : a.price - b.price));
    }, [inventory, invSearch, invSort]);

    const filteredCatalog = useMemo(() => {
        let res = [...catalog];
        if (catSearch) res = res.filter((i) => i.name.toLowerCase().includes(catSearch.toLowerCase()));
        return res.sort((a, b) => (catSort === 'price_asc' ? a.price - b.price : b.price - a.price));
    }, [catalog, catSearch, catSort]);

    const textColorClass =
        result === 'success' ? 'text-success' : result === 'fail' ? 'text-fail' : 'text-white';

    return (
        <AppLayout>
            <Head title="Апгрейд — TemkaStar" />
            <main className="cont df upgrade-page">
                <h1 className="gradient-underline up-title">Апгрейд</h1>

                <div className="up-top-panel">
                    {/* 1. СТАВКА */}
                    <div className="up-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <p className="up-label" style={{ margin: 0 }}>
                                Можно добавить еще {Math.max(0, 5 - selectedItems.length)} предметов
                            </p>
                            {selectedItems.length > 0 && !isSpinning && (
                                <button
                                    onClick={clearAllItems}
                                    style={{ background: 'none', border: 'none', color: '#F44336', cursor: 'pointer', fontSize: '12px' }}
                                >
                                    Очистить
                                </button>
                            )}
                        </div>

                        <div className="up-slots-box">
                            {selectedItems.length === 0 ? (
                                <span className="up-placeholder">Выберите предметы ниже</span>
                            ) : (
                                selectedItems.map((item, idx) => (
                                    <div key={idx} className="up-slot" style={{ cursor: 'default' }}>
                                        <img src={item.img} alt="" />
                                        <p className="up-card-name">{item.name}</p>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="up-total">
                            <span className="up-label">Сумма ставки:</span>
                            <b>{fmt(currentValue)} ₽</b>
                        </div>
                    </div>

                    {/* 2. КОЛЕСО */}
                    <div className="up-wheel-section">
                        <div className="up-wheel-container">
                            <svg width="240" height="240" viewBox="0 0 240 240" className="up-wheel-svg">
                                <circle cx="120" cy="120" r="100" fill="transparent" stroke="#1e2a3a" strokeWidth="20" />
                                <circle
                                    cx="120"
                                    cy="120"
                                    r="100"
                                    fill="transparent"
                                    stroke="#3292FF"
                                    strokeWidth="20"
                                    strokeDasharray={2 * Math.PI * 100}
                                    strokeDashoffset={2 * Math.PI * 100 * (1 - animatedChance / 100)}
                                    strokeLinecap="butt"
                                />
                            </svg>

                            <div className="up-wheel-text">
                                {result === 'success' ? (
                                    <span className="up-chance text-success" style={{ fontSize: '24px', textAlign: 'center' }}>
                                        ВЫИГРАЛ
                                    </span>
                                ) : result === 'fail' ? (
                                    <span className="up-chance text-fail" style={{ fontSize: '24px', textAlign: 'center' }}>
                                        ПРОИГРАЛ
                                    </span>
                                ) : (
                                    <>
                                        <span className={`up-chance ${textColorClass}`}>{animatedChance.toFixed(2)}%</span>
                                        <span className="up-chance-label">шанс</span>
                                    </>
                                )}
                            </div>

                            <div
                                className="up-arrow"
                                style={{
                                    transform: `rotate(${rotation}deg)`,
                                    transition: 'none',
                                }}
                            >
                                <div className="up-arrow-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
                                        <path d="M12 22L2 2h20L12 22z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <button
                            className="btn-open up-btn-spin"
                            onClick={handleUpgrade}
                            disabled={!canUpgrade}
                        >
                            {isSpinning
                                ? 'КРУТИМ...'
                                : isInvalidTarget
                                ? 'ЦЕЛЬ ДЕШЕВЛЕ'
                                : 'ПРОКРУТИТЬ'}
                        </button>
                    </div>

                    {/* 3. ПРИЗ */}
                    <div className="up-section">
                        <p className="up-label">Оружие, которое хотите получить</p>
                        <div className="up-prize-box">
                            {targetGift ? (
                                <>
                                    <img src={targetGift.img} alt="" />
                                    <p className="up-prize-name">{targetGift.name}</p>
                                </>
                            ) : (
                                <span className="up-placeholder">Выберите цель справа</span>
                            )}
                        </div>
                        <div className="up-total">
                            <span className="up-label">Цена цели:</span>
                            <b>{targetGift ? `${fmt(targetGift.price)} ₽` : '—'}</b>
                        </div>
                    </div>
                </div>

                <div className="up-bottom-panel">
                    {/* ИНВЕНТАРЬ */}
                    <div className="up-table-section">
                        <div className="up-table-header">
                            <h3>Мои предметы ({inventory.length})</h3>
                            <div className="up-filters">
                                <input type="text" placeholder="Поиск..." value={invSearch} onChange={(e) => setInvSearch(e.target.value)} />
                                <select value={invSort} onChange={(e) => setInvSort(e.target.value)}>
                                    <option value="price_desc">Дорогие</option>
                                    <option value="price_asc">Дешевые</option>
                                </select>
                            </div>
                        </div>

                        <div className="up-grid">
                            {filteredInventory.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => addItem(item)}
                                    className={`up-card ${isSpinning ? 'up-disabled' : ''}`}
                                    style={{ borderBottomColor: `var(--rar-${item.rarity === 'legendary' ? 'legend' : item.rarity})` }}
                                >
                                    {item.count > 1 && <span className="up-card-count">x{item.count}</span>}
                                    <img src={item.img} alt="" />
                                    <p className="up-card-name">{item.name}</p>
                                    <p className="up-card-price">{fmt(item.price)} ₽</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* КАТАЛОГ */}
                    <div className="up-table-section">
                        <div className="up-table-header">
                            <h3>Каталог</h3>
                            <div className="up-filters">
                                <input type="text" placeholder="Поиск..." value={catSearch} onChange={(e) => setCatSearch(e.target.value)} />
                                <select value={catSort} onChange={(e) => setCatSort(e.target.value)}>
                                    <option value="price_asc">Дешевые</option>
                                    <option value="price_desc">Дорогие</option>
                                </select>
                            </div>
                        </div>

                        <div className="up-grid">
                            {filteredCatalog.map((gift) => {
                                const isDisabled = currentValue >= gift.price;
                                return (
                                    <div
                                        key={gift.id}
                                        onClick={() => selectTarget(gift)}
                                        className={`up-card ${isSpinning || isDisabled ? 'up-disabled' : ''} ${
                                            targetGift?.id === gift.id ? 'up-selected' : ''
                                        }`}
                                        style={{ borderBottomColor: `var(--rar-${gift.rarity === 'legendary' ? 'legend' : gift.rarity})` }}
                                    >
                                        <img src={gift.img} alt="" />
                                        <p className="up-card-name">{gift.name}</p>
                                        <p className="up-card-price">{fmt(gift.price)} ₽</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}