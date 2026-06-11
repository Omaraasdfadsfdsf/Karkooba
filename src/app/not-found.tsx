import Link from 'next/link';
import Icon from '@/components/Icon';
import { getDict } from '@/lib/i18n/server';

export default async function NotFound() {
  const { dict } = await getDict();
  return (
    <div className="panel-wrap">
      <div className="panel" style={{ textAlign: 'center' }}>
        <div className="empty" style={{ border: 'none', background: 'transparent', padding: '20px 0' }}>
          <div className="big">
            <Icon name="box" size={28} />
          </div>
          <h3>{dict.notFound.title}</h3>
          <p>{dict.notFound.sub}</p>
        </div>
        <Link href="/" className="btn-post">
          {dict.notFound.back}
        </Link>
      </div>
    </div>
  );
}
