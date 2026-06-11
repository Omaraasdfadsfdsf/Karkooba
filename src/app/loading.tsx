export default function Loading() {
  return (
    <main className="listing-grid" style={{ paddingTop: 60 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card skel" aria-hidden="true">
          <div className="card-img" />
          <div className="card-body">
            <h3>&nbsp;</h3>
            <div className="card-meta">
              <span>&nbsp;</span>
            </div>
          </div>
        </div>
      ))}
    </main>
  );
}
