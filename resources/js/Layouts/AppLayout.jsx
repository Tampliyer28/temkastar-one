import { Link, usePage } from '@inertiajs/react';

export default function AppLayout({ children }) {
    const { url, props } = usePage();
    const { auth, balance } = props;

    const isActive = (path) => url === path ? 'active-link link df' : 'link df';
    const fmt = (n) => Number(n || 0).toLocaleString('ru-RU');

    return (
        <div className='app-wrapper df'>
            <header className="df">
                <div className="logo df">
                    <img src="/images/ui/logo.png" alt="Logo" />
                    <Link href="/" className='logo-text'>Temka<span className="blue">Star</span></Link>
                </div>

                <nav className="nav-header df">
                    <Link href="/" className={isActive('/')}><img src="/images/ui/Layer_1.svg" alt="" />кейсы</Link>
                    <Link href="/upgrade" className={isActive('/upgrade')}><img src="/images/ui/bust.svg" alt="" />АПГРЕЙД</Link>
                    <Link href="" className={isActive('')}><img src="/images/ui/record.svg" alt="" />ЛИДЕРЫ</Link>
                    <Link href="/about" className={isActive('/about')}><img src="/images/ui/fqa.png" alt="" />FAQ</Link>

                    {auth?.user?.is_admin && (
                        <Link href="/admin" className={isActive('/admin')}>
                            <img src="/images/ui/record.svg" alt="" />АДМИНКА
                        </Link>
                    )}
                </nav>

                {auth?.user ? (
                    <div className="inf-lk-cont df">
                        <div className="many-cont df">
                            <div className="df">
                                <p className="many">{fmt(balance?.coins)}</p>
                                <img className="coin-img" src="/images/ui/coin.png" alt="COIN" />
                            </div>
                            <div className="df">
                                <p className="many">{fmt(balance?.rubles)}</p>
                                <span className="rub">₽</span>
                            </div>
                            <Link href="/deposit" className="link-donate">+</Link>
                        </div>
                        <Link href="/cabinet" className="lk-link df">
                            <img src="/images/ui/input.png" alt="" />
                            {auth.user.login}
                        </Link>
                    </div>
                ) : (
                    <Link href="/login" className="lk-link df">
                        <img src="/images/ui/input.png" alt="" />Авторизация
                    </Link>
                )}
            </header>

            <main className="app-main">
                {children}
            </main>

            <footer className="df">
                <div className="footer-col footer-col--about">
                    <a href="#" className="footer-logo">
                        <img src="/images/ui/logo.png" alt="TemkaStar" className="footer-logo__img" />
                        <span className="footer-logo__text">TemkaStar</span>
                    </a>
                    <p className="footer-text">
                        ООО «ТемкаСтар», ИНН 1234567890,<br />
                        ОГРН 1234567890123 Юридический<br />
                        адрес: 656067, г. Барнаул, ул.<br />
                        Балтийская, д. 1, офис 1
                    </p>
                </div>

                <div className="footer-col">
                    <h4 className="footer-title">Документы</h4>
                    <ul className="footer-list">
                        <li><a href="#" className="footer-link">Пользовательское соглашение</a></li>
                        <li><a href="#" className="footer-link">Политика конфиденциальности</a></li>
                        <li><a href="#" className="footer-link">Правила кейсов</a></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h4 className="footer-title">Контакты</h4>
                    <a href="mailto:temkastore@mail.ru" className="footer-link">
                        Email: temkastore@mail.ru
                    </a>
                </div>

                <div className="footer-col footer-col--mascot">
                    <img src="/images/cases/talisman_cat.png" alt="" className="footer-mascot" />
                </div>
            </footer>
        </div>
    );
}