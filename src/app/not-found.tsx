import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="panel-wrap">
      <div className="panel" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>🕳️</div>
        <h1>This one got away</h1>
        <p className="sub">
          Either it was snapped up, the seller pulled it, or it never existed. Junk moves fast
          around here.
        </p>
        <Link href="/" className="btn-post">
          Back to the pile
        </Link>
      </div>
    </div>
  );
}
