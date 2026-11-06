import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import '../../css/admin.css';

const fmt = (n) => Number(n || 0).toLocaleString('ru-RU');

export default function Admin({ stats, promocodes }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        bonus: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/promocodes', {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout>
            <Head title="Админ-панель — TemkaStar" />

            <div className="admin-page cont df">
                <section className="admin-section">
                    <h1 className="admin-section-title">Ключевые показатели</h1>
                    <div className="admin-stats-grid">
                        <div className="stat-card"><h2>{fmt(stats?.revenue)} ₽</h2><p>Общая выручка</p></div>
                        <div className="stat-card"><h2>{fmt(stats?.cases_opened)} шт</h2><p>Открыто кейсов</p></div>
                        <div className="stat-card"><h2>{fmt(stats?.upgrades)} шт</h2><p>Кол-во апгрейдов</p></div>
                        <div className="stat-card"><h2>{fmt(stats?.users)} чел.</h2><p>Пользователей</p></div>
                        <div className="stat-card"><h2>{fmt(stats?.withdrawals)}</h2><p>Выводов</p></div>
                    </div>
                </section>

                <section className="admin-section">
                    <h1 className="admin-section-title">Промокоды</h1>

                    {flash?.success && <div className="admin-flash">{flash.success}</div>}

                    <div className="admin-promo-layout">
                        <div className="promo-table-wrapper">
                            <table className="promo-table">
                                <thead>
                                    <tr>
                                        <th className="col-id">ID</th>
                                        <th>Название</th>
                                        <th className="col-bonus">Размер бонуса</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {promocodes && promocodes.length > 0 ? (
                                        promocodes.map((promo) => (
                                            <tr key={promo.id}>
                                                <td>{promo.id}</td>
                                                <td>{promo.name}</td>
                                                <td>{promo.bonus}%</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="3" style={{ textAlign: 'center' }}>Промокодов пока нет</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="promo-form-wrapper">
                            <h3>Создать промокод</h3>
                            <form onSubmit={submit} className="promo-form">
                                <label>
                                    Название
                                    <input
                                        type="text"
                                        className="promo-input"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Например: TEMKA2026"
                                    />
                                    {errors.name && <span style={{ color: '#FF4C4C', fontSize: '12px' }}>{errors.name}</span>}
                                </label>

                                <label>
                                    Размер бонуса
                                    <input
                                        type="number"
                                        className="promo-input"
                                        value={data.bonus}
                                        onChange={(e) => setData('bonus', e.target.value)}
                                        placeholder="Например: 20"
                                        min="1"
                                        max="100"
                                    />
                                    {errors.bonus && <span style={{ color: '#FF4C4C', fontSize: '12px' }}>{errors.bonus}</span>}
                                </label>

                                <button type="submit" className="btn-add-promo" disabled={processing}>
                                    {processing ? 'Добавление...' : 'Добавить'}
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}