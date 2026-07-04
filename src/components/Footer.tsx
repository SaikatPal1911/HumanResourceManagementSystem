import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer-v2">
      <div className="frame">
        <div className="footer-grid">
          <div className="footer-col">
            <Link className="brand" to="/" style={{ color: '#fff', marginBottom: '24px' }}>
              <span className="brand-badge">H</span>
              <span>HRMS</span>
            </Link>
            <p>
              A premium, design-first Human Resource Management System focused on improving workplace efficiency through technology and clarity.
            </p>
          </div>
          <div className="footer-col">
            <h5>Product</h5>
            <ul className="footer-nav">
              <li><Link to="#features">Key Features</Link></li>
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/registration">Sign Up</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Company</h5>
            <ul className="footer-nav">
              <li><Link to="#">About Us</Link></li>
              <li><Link to="#">Careers</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Connect with Us</h5>
            <p>
              123 Tech Avenue,<br />
              Silicon Valley 94043,<br />
              contact@hrms.io
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2024 HRMS Platform. All rights reserved.</span>
          <div className="footer-links">
            <Link to="#" style={{ color: 'rgba(255,255,255,0.5)' }}>Privacy</Link>
            <Link to="#" style={{ color: 'rgba(255,255,255,0.5)' }}>Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;