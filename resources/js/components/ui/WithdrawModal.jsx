import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

const fmt = (n) => Number(n || 0).toLocaleString('ru-RU');

export function WithdrawModal({ open, gift, onClose }) {
    const [recipient, setRecipient] = useState('');
    const [count, setCount] = useState(1);
    const [loading, setLoading] = useState(false);

    // Сбрасываем форму каждый раз, когда открывается окно (в т.ч. для другого подарка)
    useEffect(() => {
        if (!open) return;
        setCount(1);
        setRecipient('');
        setLoading(false);
    }, [open, gift?.id]);

    if (!open || !gift) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!recipient) return alert('Укажите получателя');
        if (count < 1 || count > gift.count) return alert('Неверное количество');

        setLoading(true);
        try {
            const res = await fetch(`/api/inventory/${gift.id}/withdraw`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Accept': 'application/json', 
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '' 
                },
                // ЯВНО ПРИВОДИМ К ЧИСЛУ
                body: JSON.stringify({ recipient, count: Number(count) }),
            });
            const data = await res.json();
            if (res.ok) { router.reload({ only: ['inventory', 'userData'] }); onClose(); }
            else alert(data.message || 'Ошибка вывода');
        } catch (err) { console.error(err); alert('Ошибка сети'); } finally { setLoading(false); }
    };

    return (
        <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-box df" style={{ maxWidth: '400px' }}>
                <h2>Вывод подарка</h2>
                <div className="df" style={{ alignItems: 'center', gap: '15px', marginBottom: '15px', width: '100%', justifyContent: 'center' }}>
                    <img src={gift.img} alt="" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                    <div style={{ textAlign: 'left' }}>
                        <p className="name-gift" style={{ fontSize: '18px' }}>{gift.name}</p>
                        <p className="price-inv">{fmt(gift.price)} ₽ / шт</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <label className="df" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span className="title-lk" style={{ marginBottom: '5px' }}>Получатель (TG)</span>
                        <input className="inp-form" type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="@username" style={{ width: '100%' }} />
                    </label>
                    <label className="df" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span className="title-lk" style={{ marginBottom: '5px' }}>Количество (макс. {gift.count})</span>
                        <input className="inp-form" type="number" min="1" max={gift.count} value={count} onChange={(e) => setCount(Number(e.target.value))} style={{ width: '100%' }} />
                    </label>
                    <div className="df" style={{ gap: '10px', marginTop: '10px' }}>
                        <button type="submit" className="export-btn" style={{ flex: 1, borderRadius: '10px', padding: '12px' }} disabled={loading}>{loading ? 'Вывод...' : 'Вывести'}</button>
                        <button type="button" className="sell-btn" style={{ flex: 1, borderRadius: '10px', padding: '12px', background: 'var(--color-9)' }} onClick={onClose} disabled={loading}>Отмена</button>
                    </div>
                </form>
            </div>
        </div>
    );
}