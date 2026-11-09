import { useEffect } from 'react';

export function LevelUpModal({ open, level, onClose }) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div 
            className="modal" 
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} 
            style={{ 
                position: 'fixed', inset: 0, zIndex: 2000, 
                display: 'grid', placeItems: 'center', 
                backgroundColor: 'rgba(7, 11, 22, 0.85)', 
                padding: '20px'
            }}
        >
            <div 
                style={{ 
                    width: '100%', maxWidth: '400px', 
                    background: 'linear-gradient(180deg, #0F1021 0%, #070B16 100%)',
                    border: '2px solid #FFB020',
                    borderRadius: '10px',
                    boxShadow: '0 0 50px rgba(255, 176, 32, 0.3)',
                    padding: '25px 30px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    textAlign: 'center'
                }}
            >
                <div style={{ fontSize: '60px', marginBottom: '10px', lineHeight: 1 }}>🎉</div>
                
                <h2 style={{ 
                    color: '#FFB020', fontSize: '28px', fontWeight: 800, 
                    fontFamily: 'Montserrat, sans-serif', margin: '0 0 10px 0',
                    textShadow: '0 0 15px rgba(255, 176, 32, 0.5)', textAlign: 'center'
                }}>
                    НОВЫЙ УРОВЕНЬ!
                </h2>
                
                <p style={{ 
                    color: '#fff', fontSize: '20px', fontFamily: 'Montserrat, sans-serif', 
                    margin: '0 0 10px 0', textAlign: 'center'
                }}>
                    Вы достигли <strong style={{ color: '#FFB020', fontSize: '32px' }}>{level}</strong> уровня!
                </p>
                
                <p style={{ 
                    color: '#6475A7', fontSize: '14px', fontFamily: 'Montserrat, sans-serif', 
                    margin: '0 0 20px 0', textAlign: 'center'
                }}>
                    Награды за уровни уже начислены на ваш баланс.
                </p>
                
                {/* КНОПКА НА CSS GRID - АБСОЛЮТНО ЦЕНТРИРОВАНА */}
                <button
                type="button"
                onClick={onClose}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '15px',
                    lineHeight: 1,
                    background: '#FFB020',
                    color: '#000',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    fontSize: '16px',
                    textTransform: 'uppercase',
                    userSelect: 'none',
                }}
            >
                ЗАБРАТЬ
            </button>
            </div>
        </div>
    );
}