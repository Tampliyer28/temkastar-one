import AppLayout from '@/Layouts/AppLayout';
import { Link, Head } from '@inertiajs/react';
import { CasesCategori } from '@/components/ui/casesCategori';
import { CaseCard } from '@/components/ui/CaseCard';

export default function Home({categories}) {
    return (
        <AppLayout>
            <Head title="TemkaStar" />
            <section className="cont banners-cont df mt">
                <div className="left-banner df">
                    <div className="text-banner df">
                        <h1>TemkaStar — твой звездный час.</h1>
                        <p className="big-banner">
                            Честные шансы, моментальный вывод, никакого скама. Крути спокойно.
                        </p>
                    </div>
                    <Link href="/deposit" className="link-banner df">
                        Пополнить баланс 
                        <img src="/images/ui/rulet.png" alt="" />
                    </Link>
                </div>

                <div className="right-banners df">
                    <div className="small-banner df">
                        <div className="text-btn-small df">
                            <div className="text-small df">
                                <h3>Бонус к пополнению</h3>
                                <p>Промокод на 11% при пополнении баланса</p>
                            </div>
                            <Link href="/promo" className="link-ban2">
                                TOPDROP11
                            </Link>
                        </div>
                        <img className="img-banner2" src="/images/ui/banner2.png" alt="" />
                    </div>

                    <div className="small-banner df">
                        <div className="text-btn-small df">
                            <div className="text-small df">
                                <h3>Заходи и забирай!</h3>
                                <p>Ежедневные промокоды уже ждут тебя в наших соц. сетях</p>
                            </div>
                            <Link href="/social" className="link-banner df">
                                Забрать
                                <img src="/images/ui/link.png" alt="" />
                            </Link>
                        </div>
                        <img className="img-banner3" src="/images/ui/banner3.png" alt="" />
                    </div>
                </div>
            </section>


            {categories.map((cat)=>(
                (cat.cases.length > 0 && (
                    <CasesCategori key={cat.id_casescat} title={cat.name_casescat}>
                        {cat.cases.map((item) => (
                            <CaseCard
                                key={item.id_case}
                                caseId={item.id_case}
                                nameCase={item.name_case}
                                cost={item.price}
                                imgUrl={item.icon_url}
                                moneyUrl={item.currency.url_cur}
                            />
                        ))}
                    </CasesCategori>
                ))
            ))}

            {/* Бонусные кейсы */}
            {/* <CasesCategori title = 'Бонусные кейсы'>
                 <CaseCard
                    caseId = {1}
                    nameCase="Мини-стар"
                    cost={10}
                    imgUrl="/images/cases/free_case2.png"
                    moneyUrl="/images/ui/coin.png"
                    href="/case/mini-star"
                />
                <CaseCard
                    caseId = {2}
                    nameCase="Стар-пак"
                    cost={50}
                    imgUrl="/images/cases/free_case2.png"
                    moneyUrl="/images/ui/coin.png"
                    href="/case/star-pack"
                />
                <CaseCard
                    caseId = {3}
                    nameCase="Мега-стар"
                    cost={120}
                    imgUrl="/images/cases/free_case2.png"
                    moneyUrl="/images/ui/coin.png"
                    href="/case/mega-star"
                />
                <CaseCard
                    caseId = {4}
                    nameCase="Ультра-стар"
                    cost={250}
                    imgUrl="/images/cases/free_case2.png"
                    moneyUrl="/images/ui/coin.png"
                    href="/case/ultra-star"
                />
            </CasesCategori> */}

            {/* Времена года */}
            {/* <CasesCategori title = 'Времена года'>
                <CaseCard
                    caseId={5}
                    nameCase="Новогодние звёзды"
                    cost={950}
                    imgUrl="/images/cases/winter_cat_case1.png"
                    moneyUrl="/images/ui/rub.png"
                />
                <CaseCard
                    caseId={6}
                    nameCase="Защитник звёзд"
                    cost={500}
                    imgUrl="/images/cases/spring_cat_case1.png"
                    moneyUrl="/images/ui/rub.png"
                />
                <CaseCard
                    caseId={7}
                    nameCase="Тюльпаны звёздочкам"
                    cost={650}
                    imgUrl="/images/cases/summer_cat_case1.png"
                    moneyUrl="/images/ui/rub.png"
                />
                <CaseCard
                    caseId={8}
                    nameCase="Звёздная пасхалка"
                    cost={550}
                    imgUrl="/images/cases/autumn_cat_case1.png"
                    moneyUrl="/images/ui/rub.png"
                />
            </CasesCategori> */}

            {/* Праздничный дроп */}
            {/* <CasesCategori title = 'Праздничный дроп'>
                <CaseCard
                    caseId={5}
                    nameCase="Новогодние звёзды"
                    cost={950}
                    imgUrl="/images/cases/ng_cat_case1.png"
                    moneyUrl="/images/ui/rub.png"
                />
                <CaseCard
                    caseId={6}
                    nameCase="Защитник звёзд"
                    cost={500}
                    imgUrl="/images/cases/23febr_cat_case1.png"
                    moneyUrl="/images/ui/rub.png"
                />
                <CaseCard
                    caseId={7}
                    nameCase="Тюльпаны звёздочкам"
                    cost={650}
                    imgUrl="/images/cases/8mar_cat_case1.png"
                    moneyUrl="/images/ui/rub.png"
                />
                <CaseCard
                    caseId={8}
                    nameCase="Звёздная пасхалка"
                    cost={550}
                    imgUrl="/images/cases/pasha_cat_case1.png"
                    moneyUrl="/images/ui/rub.png"
                />
                <CaseCard
                    caseId={9}
                    nameCase="Дьявольская звезда"
                    cost={350}
                    imgUrl="/images/cases/helloy_cat_case1.png"
                    moneyUrl="/images/ui/rub.png"
                />
                <CaseCard
                    caseId={10}
                    nameCase="Мир, труд, звёзды"
                    cost={700}
                    imgUrl="/images/cases/1may_cat_case1.png"
                    moneyUrl="/images/ui/rub.png"
                />
            </CasesCategori> */}

            {/* Звёздные поводы */}
            {/* <CasesCategori title="Звёздные поводы">
                <CaseCard
                    caseId={11}
                    nameCase="Рождественские звёзды"
                    cost={350}
                    imgUrl="/images/cases/rojdes_case1.png"
                    moneyUrl="/images/ui/coin.png"
                />
                <CaseCard
                    caseId={12}
                    nameCase="Торт со звёздами"
                    cost={1000}
                    imgUrl="/images/cases/dr_case1.png"
                    moneyUrl="/images/ui/coin.png"
                />
                <CaseCard
                    caseId={13}
                    nameCase="Две звезды"
                    cost={2500}
                    imgUrl="/images/cases/family_case1.png"
                    moneyUrl="/images/ui/coin.png"
                />
                <CaseCard
                    caseId={14}
                    nameCase="Курортные звёзды"
                    cost={600}
                    imgUrl="/images/cases/hollyday_case1.png"
                    moneyUrl="/images/ui/coin.png"
                />
                <CaseCard
                    caseId={15}
                    nameCase="Звёздный звонок"
                    cost={250}
                    imgUrl="/images/cases/1sen_case1.png"
                    moneyUrl="/images/ui/coin.png"
                />
                <CaseCard
                    caseId={16}
                    nameCase="Чёрные звёзды"
                    cost={150}
                    imgUrl="/images/cases/blackfer_case1.png"
                    moneyUrl="/images/ui/coin.png"
                />
            </CasesCategori> */}

            {/* TemkaStar Exclusive */}
            {/* <CasesCategori title="TemkaStar Exclusive">
                <CaseCard
                    caseId={17}
                    nameCase="TemkaStar Prime"
                    cost={50000}
                    imgUrl="/images/cases/premium.png"
                    moneyUrl="/images/ui/coin.png"
                />
                <CaseCard
                    caseId={18}
                    nameCase="Царь-лягушка"
                    cost={35000}
                    imgUrl="/images/cases/kvakushka_case1.png"
                    moneyUrl="/images/ui/coin.png"
                />
                <CaseCard
                    caseId={19}
                    nameCase="Королевский медальон"
                    cost={25000}
                    imgUrl="/images/cases/medal_case1.png"
                    moneyUrl="/images/ui/coin.png"
                />
                <CaseCard
                    caseId={20}
                    nameCase="Stars"
                    cost={100}
                    imgUrl="/images/cases/stars.png"
                    moneyUrl="/images/ui/coin.png"
                />
                <CaseCard
                    caseId={21}
                    nameCase="Premium"
                    cost={250}
                    imgUrl="/images/cases/prem.png"
                    moneyUrl="/images/ui/coin.png"
                />
            </CasesCategori> */}
        </AppLayout>
    );
}