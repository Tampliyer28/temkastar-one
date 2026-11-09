import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState, useMemo, useEffect, useRef } from 'react';
import { LevelUpModal } from '@/Components/ui/LevelUpModal';

const fmt = (n) => Number(n || 0).toLocaleString('ru-RU');

function useAnimatedNumber(target, duration = 300) {
    const [value, setValue] = useState(target);
    const fromRef = useRef(target);
    const rafRef = useRef(null);

    useEffect(() => {
        const from = fromRef.current;
        if (from === target) return;

        const t0 = performance.now();
        const tick = (now) => {
            const t = Math.min((now - t0) / duration, 1);
            const eased = 1 - (1 - t) * (1 - t);
            setValue(from + (target - from) * eased);
            
            if (t < 1) {
                rafRef.current = requestAnimationFrame(tick);
            } else {
                fromRef.current = target;
            }
        };
        
        rafRef.current = requestAnimationFrame(tick);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [target, duration]);

    return value;
}

export default function Upgrade({ inventory, catalog }) {
    const [selectedItems, setSelectedItems] = useState([]);
    const [targetGift, setTargetGift] = useState(null);
    
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [result, setResult] = useState(null);
    const [levelUp, setLevelUp] = useState(null);

    const [isRefreshing, setIsRefreshing] = useState(false);

    const [invSearch, setInvSearch] = useState('');
    const [invSort, setInvSort] = useState('price_desc');
    
    const [catSearch, setCatSearch] = useState('');
    const [catSort, setCatSort] = useState('price_asc');

    const currentValue = useMemo(() => selectedItems.reduce((sum, item) => sum + item.price, 0), [selectedItems]);

    const chance = useMemo(() => {
        if (!targetGift || currentValue === 0) return 0;
        return Math.min((currentValue / targetGift.price) * 100, 90);
    }, [currentValue, targetGift]);

    const animatedChance = useAnimatedNumber(chance, 400);

    const isInvalidTarget = targetGift && currentValue >= targetGift.price;
    const canUpgrade = targetGift && selectedItems.length > 0 && !isSpinning && !isInvalidTarget && !isRefreshing;

    useEffect(() => {
        if (isRefreshing) {
            const timer = setTimeout(() => {
                setIsRefreshing(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [inventory, isRefreshing]);

    const addItem = (item) => {
        if (isSpinning || isRefreshing) return;
        if (selectedItems.length >= 5) {
            return alert('Максимальное количество предметов для апгрейда — 5.');
        }
        
        const alreadySelected = selectedItems.filter(i => i.id === item.id).length;
        if (alreadySelected >= item.count) return;
        
        setSelectedItems([...selectedItems, item]);
    };

    const clearAllItems = () => {
        if (isSpinning || isRefreshing) return;
        setSelectedItems([]);
    };

    const selectTarget = (gift) => {
        if (isSpinning || isRefreshing) return;
        if (currentValue >= gift.price) return alert('Цель должна быть дороже ставки!');
        setTargetGift(gift);
    };

    const handleUpgrade = async () => {
        if (!canUpgrade) return;

        setIsSpinning(true);
        setResult(null);
        setIsRefreshing(true); 

        let serverResult = null;
        
        try {
            const res = await fetch('/api/upgrade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({
                    inventory_ids: selectedItems.map(i => i.id),
                    target_gift_id: targetGift.id,
                })
            });

            const data = await res.json();
            if (!res.ok) {
                serverResult = { success: false, error: data.message }; 
            } else {
                serverResult = data;
                if (data.levelUp) {
                    setLevelUp(data.levelUp);
                }
            }
            
        } catch (e) {
            serverResult = { success: false, error: 'Ошибка сети' };
        }

        const isWin = serverResult ? serverResult.success : false;

        const chanceAngle = (chance / 100) * 360;
        let targetAngle = isWin 
            ? Math.random() * (chanceAngle - 5) 
            : chanceAngle + Math.random() * (360 - chanceAngle - 5);

        const fullSpins = 6 * 360;
        
        setRotation((prevRotation) => {
            const currentMod = prevRotation % 360;
            let angleDiff = targetAngle - currentMod;
            if (angleDiff < 0) angleDiff += 360;
            return prevRotation + fullSpins + angleDiff;
        });

        setTimeout(() => {
            setIsSpinning(false);
            setResult(isWin ? 'success' : 'fail');
            setSelectedItems([]);
            setTargetGift(null);

            setTimeout(() => {
                setResult(null); 
            }, 2000);
            
            router.reload({ only: ['inventory'] }); 

        }, 5300);
    };

    const filteredInventory = useMemo(() => {
        let res = [...inventory];
        if (invSearch) res = res.filter(i => i.name.toLowerCase().includes(invSearch.toLowerCase()));
        return res.sort((a, b) => invSort === 'price_desc' ? b.price - a.price : a.price - b.price);
    }, [inventory, invSearch, invSort]);

    const filteredCatalog = useMemo(() => {
        let res = [...catalog];
        if (catSearch) res = res.filter(i => i.name.toLowerCase().includes(catSearch.toLowerCase()));
        return res.sort((a, b) => catSort === 'price_asc' ? a.price - b.price : b.price - a.price);
    }, [catalog, catSearch, catSort]);

    const textColorClass = result === 'success' ? 'text-success' : result === 'fail' ? 'text-fail' : 'text-white';

    return (
        <AppLayout>
            <Head title="Апгрейд — TemkaStar" />
            <main className="cont df upgrade-page">
                
                <h1 className="gradient-underline up-title">Апгрейд</h1>

                <div className="up-top-panel">
                    
                    {/* 1. СТАВКА */}
                    <div className="up-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <p className="up-label" style={{ margin: 0 }}>Можно добавить еще {Math.max(0, 5 - selectedItems.length)} предметов</p>
                            {selectedItems.length > 0 && !isSpinning && !isRefreshing && (
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
                                    cx="120" cy="120" r="100" fill="transparent" stroke="#3292FF" strokeWidth="20"
                                    strokeDasharray={2 * Math.PI * 100}
                                    strokeDashoffset={2 * Math.PI * 100 * (1 - animatedChance / 100)}
                                    strokeLinecap="butt"
                                    style={{ transition: 'none' }} 
                                />
                            </svg>

                            <div className="up-wheel-text">
                                {result === 'success' ? (
                                    <span className="up-chance text-success" style={{ fontSize: '24px', textAlign: 'center' }}>ВЫИГРАЛ</span>
                                ) : result === 'fail' ? (
                                    <span className="up-chance text-fail" style={{ fontSize: '24px', textAlign: 'center' }}>ПРОИГРАЛ</span>
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
                                    transition: isSpinning ? 'transform 5s cubic-bezier(0.1, 0.7, 0.1, 1)' : 'none',
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
                            disabled={!canUpgrade || isRefreshing}
                        >
                            {isSpinning ? 'КРУТИМ...' : (isRefreshing ? 'ОБНОВЛЕНИЕ...' : (isInvalidTarget ? 'ЦЕЛЬ ДЕШЕВЛЕ' : 'ПРОКРУТИТЬ'))}
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
                    <div className="up-table-section" style={{ position: 'relative' }}>
                        
                        {isRefreshing && (
                            <div style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                background: 'rgba(7, 11, 22, 0.8)',
                                zIndex: 100,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: '10px',
                                backdropFilter: 'blur(4px)',
                                cursor: 'wait',
                                pointerEvents: 'all'
                            }}>
                                <div style={{ color: '#3292FF', fontSize: '18px', fontWeight: 'bold' }}>
                                    Загрузка данных...
                                </div>
                            </div>
                        )}

                        <div className="up-table-header">
                            <h3>Мои предметы ({inventory.length})</h3>
                            <div className="up-filters">
                                <input type="text" placeholder="Поиск..." value={invSearch} onChange={e => setInvSearch(e.target.value)} />
                                <select value={invSort} onChange={e => setInvSort(e.target.value)}>
                                    <option value="price_desc">Дорогие</option>
                                    <option value="price_asc">Дешевые</option>
                                </select>
                            </div>
                        </div>

                        <div className="up-grid">
                            {filteredInventory.map(item => (
                                <div 
                                    key={item.id} 
                                    onClick={() => addItem(item)}
                                    className={`up-card ${isSpinning || isRefreshing ? 'up-disabled' : ''}`}
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
                                <input type="text" placeholder="Поиск..." value={catSearch} onChange={e => setCatSearch(e.target.value)} />
                                <select value={catSort} onChange={e => setCatSort(e.target.value)}>
                                    <option value="price_asc">Дешевые</option>
                                    <option value="price_desc">Дорогие</option>
                                </select>
                            </div>
                        </div>

                        <div className="up-grid">
                            {filteredCatalog.map(gift => {
                                const isDisabled = currentValue >= gift.price;
                                return (
                                    <div 
                                        key={gift.id} 
                                        onClick={() => selectTarget(gift)}
                                        className={`up-card ${isSpinning || isRefreshing || isDisabled ? 'up-disabled' : ''} ${targetGift?.id === gift.id ? 'up-selected' : ''}`}
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

            <LevelUpModal open={!!levelUp} level={levelUp?.new_level} onClose={() => setLevelUp(null)} />
        </AppLayout>
    );
}