import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="topbar">
      <div className="frame topbar-inner">
        <Link className="brand" to="/">
          <span className="brand-badge">H</span>
          <span>HRMS</span>
        </Link>

        <div className="cta-row">
          <Link className="btn-light" to="/login">Login</Link>
          <Link className="btn-main" to="/registration">Get Started</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;