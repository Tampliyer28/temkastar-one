import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const LEVELS = [
    { lvl: 1,  xp: 0,         reward: 'Стартовый', type: 'default', icon: '🌱' },
    { lvl: 2,  xp: 2500,      reward: '500 ₽ на баланс', type: 'default', icon: '💰' },
    { lvl: 3,  xp: 7500,      reward: '100 монет', type: 'default', icon: '💎' },
    { lvl: 4,  xp: 18000,     reward: '1500 ₽ на баланс', type: 'default', icon: '💰' },
    { lvl: 5,  xp: 40000,     reward: 'Подарок в инвентарь', type: 'epic', icon: '🎁' },
    { lvl: 6,  xp: 75000,     reward: '3000 ₽ на баланс', type: 'default', icon: '💰' },
    { lvl: 7,  xp: 130000,    reward: '1000 монет', type: 'default', icon: '💎' },
    { lvl: 8,  xp: 220000,    reward: '5000 ₽ на баланс', type: 'default', icon: '💰' },
    { lvl: 9,  xp: 350000,    reward: '2000 монет', type: 'default', icon: '💎' },
    { lvl: 10, xp: 550000,    reward: '10000 ₽ + Подарок', type: 'epic', icon: '🎁' },
    { lvl: 15, xp: 1200000,   reward: '25000 ₽ на баланс', type: 'default', icon: '💰' },
    { lvl: 20, xp: 2500000,   reward: '5000 монет + Подарок', type: 'legend', icon: '🎁' },
    { lvl: 25, xp: 5000000,   reward: '50000 ₽ на баланс', type: 'default', icon: '💰' },
    { lvl: 30, xp: 10000000,  reward: '100000 ₽ на баланс', type: 'legend', icon: '💰' },
    { lvl: 40, xp: 25000000,  reward: '250000 ₽ на баланс', type: 'legend', icon: '💰' },
    { lvl: 50, xp: 60000000,  reward: '1000000 ₽ + VIP подарок', type: 'vip', icon: '👑' },
];

export default function About() {
    return (
        <AppLayout>
            <Head title="О нас и Уровни — TemkaStar" />
            
            <main className="cont df" style={{ flexDirection: 'column', paddingTop: '40px', paddingBottom: '80px' }}>
                {/* Блок "О нас" */}
                <section className="df" style={{ flexDirection: 'column', marginBottom: '60px' }}>
                    <h1 className="gradient-underline" style={{ marginBottom: '30px' }}>О проекте</h1>
                    <div style={{ background: '#0F1021', padding: '30px', borderRadius: '10px', border: '1px solid #1B2A42', color: '#6475A7', fontFamily: 'Montserrat', fontSize: '16px', lineHeight: '1.8' }}>
                        <p style={{ marginBottom: '15px' }}>
                            <strong style={{ color: '#fff' }}>TemkaStar</strong> — это честная платформа для открытия кейсов и апгрейдов. Мы ценим наших игроков и создали прозрачную систему наград.
                        </p>
                        <p>
                            Каждое действие приносит вам опыт (XP). Чем больше вы играете, тем выше ваш уровень и тем больше бонусов вы получаете.
                        </p>
                    </div>
                </section>

                {/* Блок "Уровни" */}
                <section className="df" style={{ flexDirection: 'column' }}>
                    <h1 className="gradient-underline" style={{ marginBottom: '30px' }}>Система уровней</h1>
                    
                    <div className="levels-table-wrapper">
                        <table className="levels-table">
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'center' }}>Уровень</th>
                                    <th>Необходимо XP (всего)</th>
                                    <th>Награда</th>
                                </tr>
                            </thead>
                            <tbody>
                                {LEVELS.map((lvl) => (
                                    <tr key={lvl.lvl}>
                                        <td className="level-cell">
                                            <span className={`lvl-${lvl.lvl}`}>{lvl.lvl}</span>
                                        </td>
                                        <td className="xp-cell">
                                            {lvl.xp.toLocaleString('ru-RU')} <span>XP</span>
                                        </td>
                                        <td className="bonus-cell">
                                            <span className={`badge-bonus ${lvl.type}`}>
                                                {lvl.icon} {lvl.reward}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </AppLayout>
    );
}