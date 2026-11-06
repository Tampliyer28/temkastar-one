import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Register() {
    // Хук Inertia для работы с формой
    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        telegram: '',
        password: '',
    });

    // Обработчик отправки
    const submit = (e) => {
        e.preventDefault();
        post('/register', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AppLayout>
            <Head title="Регистрация — TemkaStar" />
            
            <div className="cont df" style={{ justifyContent: 'center', paddingTop: '50px' }}>
                <form className="form df" onSubmit={submit}>
                    <h2>Регистрация</h2>

                    <label className="df">
                        Логин
                        <input
                            className="inp-form"
                            type="text"
                            name="login"
                            value={data.login}
                            onChange={(e) => setData('login', e.target.value)}
                            placeholder="user"
                        />
                        {/* Вывод ошибки валидации */}
                        {errors.login && <span style={{ color: '#FF4C4C', fontSize: '13px' }}>{errors.login}</span>}
                    </label>

                    <label className="df">
                        Telegram
                        <input
                            className="inp-form"
                            type="text"
                            name="telegram"
                            value={data.telegram}
                            onChange={(e) => setData('telegram', e.target.value)}
                            placeholder="@username"
                        />
                        {errors.telegram && <span style={{ color: '#FF4C4C', fontSize: '13px' }}>{errors.telegram}</span>}
                    </label>

                    <label className="df">
                        Пароль
                        <input
                            className="inp-form"
                            type="password"
                            name="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••"
                        />
                        {errors.password && <span style={{ color: '#FF4C4C', fontSize: '13px' }}>{errors.password}</span>}
                    </label>

                    <button type="submit" disabled={processing}>
                        {processing ? 'Загрузка...' : 'Зарегистрироваться'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px' }}>
                        <span style={{ color: 'var(--color-6)' }}>Уже есть аккаунт? </span>
                        <Link href="/login" style={{ color: 'var(--color-4)', textDecoration: 'none' }}>
                            Войти
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}