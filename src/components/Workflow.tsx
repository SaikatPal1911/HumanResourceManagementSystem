const steps = [
  { num: 1, title: 'Register Company', desc: 'Define organizational structure and create admin account' },
  { num: 2, title: 'Add Employees', desc: 'Onboard your team with auto-generated credentials' },
  { num: 3, title: 'Track Attendance', desc: 'Monitor daily check-ins and manage leave requests' },
  { num: 4, title: 'Run Payroll', desc: 'View and process payroll with automated calculations' },
];

const Workflow = () => {
  return (
    <section className="showcase" id="workflow">
      <div className="frame">
        <div className="showcase-panel reveal">
          <div className="showcase-grid">
            <div>
              <h3>From onboarding to offboarding, every step is connected</h3>
              <p>
                Stop juggling spreadsheets and disconnected tools. HRMS creates one elegant operational
                flow from first employee onboarding to final offboarding.
              </p>
            </div>
            <div className="timeline">
              {steps.map((step) => (
                <div key={step.num} className="timeline-item">
                  <strong>Step {step.num}:</strong> {step.desc}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Workflow;