const Testimonials = () => {
  return (
    <section className="testimonials">
      <div className="frame">
        <div className="section-head">
          <span className="tag">Trusted by Teams</span>
          <h2>Hear from our community leaders</h2>
          <p>Discover why modern companies choose our HRMS to power their operations.</p>
        </div>

        <div className="testimonial-grid">
          <div className="testimonial-card">
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p className="testimonial-text">"This HRMS reduced our administrative burden by 70%. What used to take a full-time staff member now takes just hours. Our HR team is thrilled."</p>
            <div className="testimonial-author">
              <div className="author-name">Sarah Johnson</div>
              <div className="author-role">HR Director, Innovate Inc.</div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p className="testimonial-text">"The transparency this platform brings is incredible. Employees can track their own leave and attendance in real-time. Trust has improved dramatically."</p>
            <div className="testimonial-author">
              <div className="author-name">Michael Chen</div>
              <div className="author-role">CEO, Tech Solutions</div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p className="testimonial-text">"Migration was seamless. The onboarding was simple and clear. Within a week, we were fully operational with our entire team."</p>
            <div className="testimonial-author">
              <div className="author-name">David Lee</div>
              <div className="author-role">Operations Manager, Growth Co.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;