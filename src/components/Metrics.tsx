const Metrics = () => {
  return (
    <section className="metrics" id="metrics">
      <div className="frame metric-wrap">
        <div className="metric reveal">
          <span className="num" data-count="15">0</span>
          <span className="label">Minutes Onboarding</span>
        </div>
        <div className="metric reveal">
          <span className="num" data-count="80">0</span>
          <span className="label">Admin Time Saved (%)</span>
        </div>
        <div className="metric reveal">
          <span className="num" data-count="100">0</span>
          <span className="label">Reports Auto Generated</span>
        </div>
        <div className="metric reveal">
          <span className="num" data-count="24">0</span>
          <span className="label">Support Coverage (Hours)</span>
        </div>
      </div>
    </section>
  );
};

export default Metrics;