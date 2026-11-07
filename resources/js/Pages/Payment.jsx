import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Payment() {
    const { props } = usePage();
    const flash = props.flash || {};

    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        payment_method: 'qr',
        promo: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/deposit', {
            onSuccess: () => reset('amount', 'promo'),
        });
    };

    return (
        <AppLayout>
            <Head title="Пополнение — TemkaStar" />
            
            <div className="cont df" style={{ justifyContent: 'center', paddingTop: '50px' }}>
                <form className="form df" onSubmit={submit}>
                    <h2>Пополнение баланса</h2>

                    {flash.success && (
                        <div style={{fontFamily: 'Montserrat', padding: '15px', background: '#1e4620', color: '#4caf50', borderRadius: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                            {flash.success}
                        </div>
                    )}

                    <label className="df">
                        Выберите способ оплаты
                        <select
                            className="inp-form"
                            name="payment_method"
                            value={data.payment_method}
                            onChange={(e) => setData('payment_method', e.target.value)}
                        >
                            {/* <option value="qr">QR-код (СБП)</option> */}
                            <option value="card">Банковская карта РФ</option>
                        </select>
                    </label>

                    <label className="df">
                        Сумма (₽)
                        <input
                            className="inp-form"
                            type="number"
                            name="amount"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            placeholder="мин. 50"
                            min="50"
                            max="100000000"
                        />
                        {errors.amount && <span style={{ color: '#FF4C4C', fontSize: '13px' }}>{errors.amount}</span>}
                    </label>

                    <label className="df">
                        Промокод
                        <input
                            className="inp-form"
                            type="text"
                            name="promo"
                            value={data.promo}
                            onChange={(e) => setData('promo', e.target.value)}
                            placeholder="Введите промокод (если есть)"
                        />
                    </label>

                    <button type="submit" disabled={processing}>
                        {processing ? 'Обработка...' : 'Пополнить счет'}
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}