export default function Loading() {
  return (
    <div className="panel-wrap">
      <div className="panel wide skel" aria-hidden="true">
        <div className="detail-layout">
          <div className="detail-gallery-main" />
          <div>
            <h1>&nbsp;</h1>
            <div style={{ margin: '14px 0' }}>
              <span className="detail-price">&nbsp;&nbsp;&nbsp;&nbsp;</span>
            </div>
            <div className="detail-meta">&nbsp;</div>
          </div>
        </div>
      </div>
    </div>
  );
}
