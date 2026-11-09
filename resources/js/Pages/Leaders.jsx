import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';

const fmt = (n) => Number(n || 0).toLocaleString('ru-RU');

const TABS = [
    { key: 'cases',          label: 'Открыто кейсов',   icon: '🎁', suffix: ' шт' },
    { key: 'upgrades',       label: 'Апгрейдов',        icon: '🚀', suffix: ' шт' },
    { key: 'inventory',      label: 'NFT в инвентаре',  icon: '💎', suffix: ' шт' },
    { key: 'inventoryValue', label: 'Ценность инвентаря', icon: '💰', suffix: ' ₽' },
    { key: 'withdrawals',    label: 'Сумма выводов',    icon: '💳', suffix: ' ₽' },
];

export default function Leaders({ leaders, myRanks }) {
    const { props } = usePage();
    const authUser = props.auth?.user;
    
    const [activeTab, setActiveTab] = useState('cases');

    const currentData = leaders?.[activeTab] || [];
    const activeTabConfig = TABS.find(t => t.key === activeTab);
    const isUserInTop = currentData.some(u => u.id === authUser?.id);
    const myRankData = myRanks?.[activeTab];

    return (
        <AppLayout>
            <Head title="Лидеры — TemkaStar" />
            
            <main className="cont df leaders-page">
                <h1 className="gradient-underline leaders-title">
                    Зал Славы
                </h1>

                <div className="leaders-tabs df">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`leaders-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="podium-container df">
                    {[1, 0, 2].map((index) => {
                        const user = currentData[index];
                        if (!user) return null;
                        
                        const place = index + 1;
                        const isMe = user.id === authUser?.id;

                        return (
                            <div key={user.id} className={`podium-item df place-${place} ${isMe ? 'is-me' : ''}`}>
                                <div className={`photo-ava df podium-avatar place-${place} ${isMe ? 'is-me' : ''}`}>
                                    {user.login.charAt(0).toUpperCase()}
                                </div>
                                <span className="podium-name">{user.login}</span>
                                <span className={`podium-value place-${place}`}>
                                    {fmt(user.value)}{activeTabConfig.suffix}
                                </span>
                                <div className={`podium-pedestal place-${place}`}>
                                    {place}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="leaders-table-wrapper">
                    <div className="df leaders-table-header">
                        <div style={{ width: '80px', textAlign: 'center' }}>Место</div>
                        <div style={{ flex: 1, paddingLeft: '20px' }}>Игрок</div>
                        <div style={{ width: '200px', textAlign: 'right' }}>Результат</div>
                        <div style={{ width: '200px', textAlign: 'right' }}>Доп. инфо</div>
                    </div>

                    {currentData.slice(3).map((user, idx) => {
                        const isMe = user.id === authUser?.id;
                        return (
                            <div key={user.id} className={`df leaders-row ${isMe ? 'is-me' : ''}`}>
                                <div className="leaders-col-place">#{idx + 4}</div>
                                <div className="leaders-col-user">
                                    <div className="leaders-avatar">
                                        {user.login.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="leaders-name">
                                        {user.login}
                                        {isMe && <span className="leaders-me-badge">(Вы)</span>}
                                    </span>
                                </div>
                                <div className="leaders-col-val">
                                    {fmt(user.value)}{activeTabConfig.suffix}
                                </div>
                                <div className="leaders-col-extra">
                                    {user.extra}
                                </div>
                            </div>
                        );
                    })}

                    {currentData.length <= 3 && !isUserInTop && (
                        <div className="leaders-empty">
                            Пока нет данных для отображения
                        </div>
                    )}
                </div>

                {authUser && !isUserInTop && myRankData && (
                    <div className="my-rank-wrapper">
                        <div className="my-rank-title">Ваше место в этом рейтинге</div>
                        <div className="leaders-table-wrapper my-rank-box">
                            <div className="df">
                                <div className="my-rank-place">#{myRankData.rank}</div>
                                <div className="leaders-col-user">
                                    <div className="my-rank-avatar">
                                        {myRankData.login.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="my-rank-name">
                                        {myRankData.login} <span style={{color: 'var(--color-4)', fontSize: '14px', marginLeft: '10px'}}>(Вы)</span>
                                    </span>
                                </div>
                                <div className="my-rank-val">
                                    {fmt(myRankData.value)}{activeTabConfig.suffix}
                                </div>
                                <div className="my-rank-extra">
                                    {myRankData.extra}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </AppLayout>
    );
}