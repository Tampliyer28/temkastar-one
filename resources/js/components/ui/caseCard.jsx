import { Link } from '@inertiajs/react';

const fmt = (n) => Number(n).toLocaleString('ru-RU');

export function CaseCard({ caseId, nameCase, cost, imgUrl, moneyUrl, href }) {
  return (
    <Link href={href || `/case/${caseId}`} className="case-box df">
      <img className="img-case" src={imgUrl} alt={nameCase} />
      <p className="name-case">{nameCase}</p>
      <div className="cost-case df">
        {fmt(cost)}
        <img className="coin-img" src={moneyUrl} alt="" />
      </div>
    </Link>
  );
}
