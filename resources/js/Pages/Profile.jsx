import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';
import { WithdrawModal } from '@/components/ui/WithdrawModal';
import { SellModal } from '@/components/ui/SellModal';
import { WithdrawAllModal } from '@/Components/ui/WithdrawAllModal';

const fmt = (n) => Number(n || 0).toLocaleString('ru-RU');

export default function Profile({ userData, balance, inventory }) {
    const [sortOrder, setSortOrder] = useState('');
    const [sellingAll, setSellingAll] = useState(false);
    const [withdrawGift, setWithdrawGift] = useState(null);
    const [sellGift, setSellGift] = useState(null);
    const [isWithdrawAllOpen, setIsWithdrawAllOpen] = useState(false);

    const sortedInventory = [...inventory].sort((a, b) => {
        if (sortOrder === 'price_desc') return b.price - a.price;
        if (sortOrder === 'price_asc') return a.price - b.price;
        if (sortOrder === 'name') return a.name.localeCompare(b.name);
        return 0;
    });

    const totalSellPrice = inventory.reduce((sum, item) => sum + (item.price * (item.count || 1)), 0);

    const handleSellAll = async () => {
        if (!confirm(`Вы уверены, что хотите продать ВСЕ подарки за ${fmt(totalSellPrice)} ₽?`)) return;
        setSellingAll(true);
        try {
            const res = await fetch('/api/inventory/sell-all', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
            });
            if (res.ok) router.reload({ only: ['inventory', 'balance', 'userData'] });
            else alert('Не удалось продать инвентарь');
        } catch (err) {
            console.error(err);
            alert('Ошибка при продаже');
        } finally {
            setSellingAll(false);
        }
    };

    const totalItems = inventory.reduce((sum, item) => sum + (item.count || 1), 0);

    // ── Расчёт прогресса до следующего уровня ──
    const xp = Number(userData.xp ?? 0);
    const xpCurrentLvl = Number(userData.xp_current_lvl ?? 0);
    const xpNext = userData.xp_next; // может быть null на макс. уровне

    let progressPercent = 0;
    let xpToNext = 0;
    if (xpNext != null && xpNext > xpCurrentLvl) {
        const inLevel = xp - xpCurrentLvl;
        const need = xpNext - xpCurrentLvl;
        progressPercent = Math.min(100, Math.max(0, (inLevel / need) * 100));
        xpToNext = Math.max(0, xpNext - xp);
    }

    return (
        <AppLayout>
            <Head title="Личный кабинет — TemkaStar" />

            <main className="cont df" style={{ flexDirection: 'column', paddingTop: '40px' }}>
                <section className="lk-sats cont mt df">
                    <div className="left-box-lk df">
                        <div className="photo-ava df">{userData.login.charAt(0).toUpperCase()}</div>
                        <div className="info-lk df">
                            <h1>{userData.login}</h1>
                            <p><span className="title-lk">Регистрация: </span>{userData.registered_at}</p>
                            <p><span className="title-lk">TG: </span>{userData.telegram || 'Не указан'}</p>

                            {/* ── XP и уровень ── */}
                            <div className="xp-block">
                                <div className="xp-header">
                                    <span className="lvl-text">Уровень {userData.level}</span>
                                    <span className="xp-total">
                                        <b>{fmt(xp)}</b> XP всего
                                    </span>
                                </div>

                                {xpNext != null ? (
                                    <>
                                        <div className="xp-bar">
                                            <div
                                                className="xp-bar-fill"
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                        <p className="xp-hint">
                                            {fmt(xp)} / {fmt(xpNext)} XP
                                            {' '}— до {userData.next_level} уровня осталось{' '}
                                            <b>{fmt(xpToNext)} XP</b>
                                        </p>
                                    </>
                                ) : (
                                    <p className="xp-hint">Максимальный уровень достигнут 👑</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="right-box-lk df">
                        <h2>Баланс</h2>
                        <div className="many-cont2 df">
                            <div className="df">
                                <p className="many">{fmt(balance?.coins)}</p>
                                <img className="coin-img" src="/images/ui/coin.png" alt="COIN" />
                            </div>
                            <div className="df">
                                <p className="many">{fmt(balance?.rubles)}</p>
                                <span className="rub">₽</span>
                            </div>
                        </div>
                        <div className="btn-cont df">
                            <Link href="/deposit" className="link-profile">Пополнить</Link>
                            <Link href="/" className="link-profile">Кейсы</Link>
                        </div>
                        <Link href="/logout" method="post" as="button" className="btn-logout">
                            Выйти
                        </Link>
                    </div>
                </section>

                <section className="section-case cont df">
                    <h2 className="gradient-underline">статистика</h2>
                    <div className="all-case-cont mt df">
                        <div className="box-stat df"><h2>{fmt(userData.stats.cases)}</h2><p>Открытых кейсов</p></div>
                        <div className="box-stat df"><h2>{fmt(userData.stats.upgrades)}</h2><p>Апгрейдов</p></div>
                        <div className="box-stat df"><h2>{fmt(totalItems)}</h2><p>NFT в инвентаре</p></div>
                        <div className="box-stat df"><h2>{fmt(userData.stats.withdrawals_sum)} ₽</h2><p>Сумма выводов</p></div>
                    </div>
                </section>

                <section className="section-case cont df w100">
                    <h2 className="gradient-underline">инвентарь</h2>
                    <div className="df" style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '15px' }}>
                        <form className="sort-inv" onSubmit={(e) => e.preventDefault()} style={{ margin: 0 }}>
                            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={{ width: '100%', minWidth: '200px' }}>
                                <option value="">Без сортировки</option>
                                <option value="price_desc">Сначала дорогие</option>
                                <option value="price_asc">Сначала дешевые</option>
                                <option value="name">По названию (А-Я)</option>
                            </select>
                        </form>

                        {inventory.length > 0 && (
                            <div className="df" style={{ gap: '10px', flexWrap: 'wrap' }}>
                                <button
                                    className="btn-open"
                                    onClick={handleSellAll}
                                    disabled={sellingAll}
                                    style={{ padding: '10px 20px', fontSize: '16px' }}
                                >
                                    {sellingAll ? 'Продажа...' : `Продать всё за ${fmt(totalSellPrice)} ₽`}
                                </button>
                                <button
                                    className="btn-open"
                                    onClick={() => setIsWithdrawAllOpen(true)}
                                    style={{ padding: '10px 20px', fontSize: '16px', background: 'var(--color-9)', borderColor: 'var(--color-9)' }}
                                >
                                    Вывести всё
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="all-case-cont mt df">
                        {sortedInventory.length > 0 ? (
                            sortedInventory.map((gift) => (
                                <div key={gift.id} className="box-gift-inv df" style={{ position: 'relative' }}>
                                    <p className="name-gift">{gift.name}</p>
                                    <img src={gift.img} alt={gift.name} className="img-gift-inv" />
                                    {gift.count > 1 && (
                                        <span style={{ position: 'absolute', top: '5px', right: '5px', background: '#3292FF', color: '#fff', padding: '2px 8px', borderRadius: '5px', fontSize: '14px', fontWeight: 'bold', zIndex: 10 }}>
                                            x{gift.count}
                                        </span>
                                    )}
                                    <p className="price-inv">{fmt(gift.price)} <span className="rub">₽</span></p>
                                    <div className="btn-cont-inv df">
                                        <button className="sell-btn" onClick={() => setSellGift(gift)}>Продать</button>
                                        <button className="export-btn" onClick={() => setWithdrawGift(gift)}>Вывести</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: 'var(--color-6)', textAlign: 'center', width: '100%' }}>
                                У вас пока нет подарков в инвентаре.
                            </p>
                        )}
                    </div>
                </section>
            </main>

            <WithdrawModal open={!!withdrawGift} gift={withdrawGift} onClose={() => setWithdrawGift(null)} />
            <SellModal open={!!sellGift} gift={sellGift} onClose={() => setSellGift(null)} />
            <WithdrawAllModal
                open={isWithdrawAllOpen}
                onClose={() => setIsWithdrawAllOpen(false)}
                totalPrice={totalSellPrice}
            />
        </AppLayout>
    );
}