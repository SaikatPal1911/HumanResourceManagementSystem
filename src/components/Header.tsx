import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="topbar">
      <div className="frame topbar-inner">
        <Link className="brand" to="/">
          <span className="brand-badge">H</span>
          <span>HRMS</span>
        </Link>

        <nav className="menu">
          <a href="#features">Features</a>
          <a href="#metrics">Outcomes</a>
          <a href="#workflow">Workflow</a>
          <Link to="/contact">Contact</Link>
        </nav>

        <div className="cta-row">
          <Link className="btn-light" to="/login">Login</Link>
          <Link className="btn-main" to="/registration">Get Started</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;