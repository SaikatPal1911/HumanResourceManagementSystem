import { Link } from "react-router-dom";

const FinalCTA = () => {
  return (
    <section className="cta-final">
      <div className="frame">
        <div className="cta-content">
          <h2>Ready to transform your workplace?</h2>
          <p>Join hundreds of companies already using our HRMS. Start your free trial today—no credit card required.</p>
          <div className="cta-actions">
            <Link to="/registration" className="btn-cta-primary">Get Started Free</Link>
            <Link to="/contact" className="btn-cta-secondary">Schedule a Demo</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;