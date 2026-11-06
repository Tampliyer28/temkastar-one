import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AppLayout>
            <Head title="Авторизация — TemkaStar" />
            
            <div className="cont df" style={{ justifyContent: 'center', paddingTop: '50px' }}>
                <form className="form df" onSubmit={submit}>
                    <h2>Авторизация</h2>

                    <label className="df">
                        Логин
                        <input
                            className="inp-form"
                            type="text"
                            name="login"
                            value={data.login}
                            onChange={(e) => setData('login', e.target.value)}
                            placeholder="user"
                            autoFocus
                        />
                        {errors.login && <span style={{ color: '#FF4C4C', fontSize: '13px' }}>{errors.login}</span>}
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
                        {processing ? 'Вход...' : 'Войти'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px' }}>
                        <span style={{ color: 'var(--color-6)' }}>Нет аккаунта? </span>
                        <Link href="/register" style={{ color: 'var(--color-4)', textDecoration: 'none' }}>
                            Зарегистрироваться
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}