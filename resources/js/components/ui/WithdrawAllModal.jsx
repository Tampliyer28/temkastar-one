import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

const fmt = (n) => Number(n || 0).toLocaleString('ru-RU');

export function WithdrawAllModal({ open, onClose, totalPrice }) {
    const [recipient, setRecipient] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;
        setRecipient('');
        setLoading(false);
    }, [open]);

    if (!open) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!recipient) return alert('Укажите получателя');

        setLoading(true);
        try {
            const res = await fetch('/api/inventory/withdraw-all', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Accept': 'application/json', 
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '' 
                },
                body: JSON.stringify({ recipient }),
            });
            
            const data = await res.json();
            
            if (res.ok) {
                alert(data.message); // <--- Возвращаем сообщение
                router.reload({ only: ['inventory', 'userData'] });
                onClose();
            } else {
                alert(data.message || 'Ошибка вывода');
            }
        } catch (err) { 
            console.error(err); 
            alert('Ошибка сети'); 
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-box df" style={{ maxWidth: '400px' }}>
                <h2>Вывод всего инвентаря</h2>
                <p style={{ color: 'var(--color-6)', textAlign: 'center', marginBottom: '20px', fontFamily: 'Montserrat' }}>
                    Вы собираетесь вывести все подарки на общую сумму <br/>
                    <strong style={{ color: '#3292FF', fontSize: '20px' }}>{fmt(totalPrice)} ₽</strong>
                </p>

                <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <label className="df" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span className="title-lk" style={{ marginBottom: '5px' }}>Получатель (TG)</span>
                        <input 
                            className="inp-form" 
                            type="text" 
                            value={recipient} 
                            onChange={(e) => setRecipient(e.target.value)} 
                            placeholder="@username" 
                            style={{ width: '100%' }} 
                        />
                    </label>
                    <div className="df" style={{ gap: '10px', marginTop: '10px' }}>
                        <button type="submit" className="export-btn" style={{ flex: 1, borderRadius: '10px', padding: '12px' }} disabled={loading}>
                            {loading ? 'Вывод...' : 'Вывести всё'}
                        </button>
                        <button type="button" className="sell-btn" style={{ flex: 1, borderRadius: '10px', padding: '12px', background: 'var(--color-9)' }} onClick={onClose} disabled={loading}>
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}