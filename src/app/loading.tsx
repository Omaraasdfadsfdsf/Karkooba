export default function Loading() {
  return (
    <>
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          <span>Digging through the junk pile…</span>
          <span>Polishing the bargains…</span>
          <span>Digging through the junk pile…</span>
          <span>Polishing the bargains…</span>
        </div>
      </div>
      <section className="hero">
        <div>
          <h2>
            One man&apos;s junk.
            <br />
            Another man&apos;s <span className="stamp">jackpot.</span>
          </h2>
          <p>Hauling the latest treasures out of storage…</p>
        </div>
      </section>
      <main className="listing-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card skel" aria-hidden="true">
            <div className="card-img">📦</div>
            <div className="card-body">
              <h3>&nbsp;</h3>
              <div className="card-meta">
                <span>&nbsp;</span>
              </div>
            </div>
          </div>
        ))}
      </main>
    </>
  );
}
