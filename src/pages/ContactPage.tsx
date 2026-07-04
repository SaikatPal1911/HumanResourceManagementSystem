import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ContactPage = () => {
  return (
    <>
      <Header />
      <div className="auth-page"> {/* Reusing auth-page styling for a centered card layout */}
        <div className="auth-card">
          <h1>Contact Us</h1>
          <p className="subtitle">We'd love to hear from you! Please reach out with any questions.</p>
          <p>Email: contact@hrms.io</p>
          <p>Phone: +1 (555) 123-4567</p>
          <Link to="/" className="btn-main auth-button" style={{ marginTop: '20px' }}>Back to Home</Link>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactPage;