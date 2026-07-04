const features = [
  {
    icon: '👤',
    title: 'Profile Management',
    description: 'Centralized employee profiles with role-based access for viewing and editing information.',
  },
  {
    icon: '📅',
    title: 'Attendance & Leave',
    description: 'Daily check-ins, attendance tracking, and a streamlined leave request/approval system.',
  },
  {
    icon: '🔐',
    title: 'Secure & Scalable',
    description: 'Built on a secure foundation with role-based access control to protect sensitive data.',
  },
  {
    icon: '💰',
    title: 'Payroll Visibility',
    description: 'Clear, read-only access to salary details for employees, and full control for administrators.',
  },
];

const Features = () => {
  return (
    <section className="overview" id="features">
      <div className="frame">
        <div className="section-head">
          <span className="tag">Core Modules</span>
          <h2>A refined command center for every role</h2>
          <p>
            Purpose-built workflows for Admins and Employees with clean interfaces that reduce admin load
            and improve efficiency.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((feature, index) => (
            <article key={index} className="feature reveal">
              <span className="icon">{feature.icon}</span>
              <h4>{feature.title}</h4>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;