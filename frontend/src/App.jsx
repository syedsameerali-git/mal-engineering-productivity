import { useState } from "react";
import "./App.css";

const API = "https://mal-engineering-productivity-api.onrender.com";

function App() {
  const [dashboard, setDashboard] = useState(null);
  const [role, setRole] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(username, password, selectedRole) {
    setError("");
    setLoading(true);

    const headers = {
      Authorization: "Basic " + btoa(`${username}:${password}`),
    };

    try {
      if (selectedRole === "lead") {
        const response = await fetch(
          `${API}/api/dashboard/engineering?owner=spring-projects&repo=spring-petclinic`,
          { headers },
        );

        if (!response.ok) throw new Error();

        setDashboard(await response.json());
      } else {
        // CEO view: load two squads concurrently
        const [petClinicResponse, securityResponse] = await Promise.all([
          fetch(
            `${API}/api/dashboard/executive?owner=spring-projects&repo=spring-petclinic`,
            { headers },
          ),
          fetch(
            `${API}/api/dashboard/executive?owner=spring-projects&repo=spring-security`,
            { headers },
          ),
        ]);

        if (!petClinicResponse.ok || !securityResponse.ok) {
          throw new Error();
        }

        const [petClinic, springSecurity] = await Promise.all([
          petClinicResponse.json(),
          securityResponse.json(),
        ]);

        setDashboard({
          audience: "CEO Office",
          squads: [
            {
              name: "Squad A",
              repository: "spring-projects/spring-petclinic",
              metrics: petClinic.deliveryHealth,
            },
            {
              name: "Squad B",
              repository: "spring-projects/spring-security",
              metrics: springSecurity.deliveryHealth,
            },
          ],
        });
      }

      setRole(selectedRole);
    } catch {
      setError("Unable to load the dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!dashboard) {
    return <Login login={login} error={error} loading={loading} />;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <div className="brand-row">
            <span className="brand-mark">M</span>
            <div>
              <h1>Engineering Productivity</h1>
              <p>Delivery intelligence from live engineering signals</p>
            </div>
          </div>

          <div className="header-actions">
            <span className="audience-badge">{dashboard.audience}</span>
            <button
              className="logout"
              onClick={() => {
                setDashboard(null);
                setRole(null);
                setError("");
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard">
        {role === "lead" ? (
          <EngineeringView data={dashboard} />
        ) : (
          <ExecutiveView data={dashboard} />
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-inner">
          <span>Engineering Productivity MVP</span>
          <span className="footer-live">
            <span className="live-dot" />
            Live GitHub data
          </span>
        </div>
      </footer>
    </div>
  );
}

function Login({ login, error, loading }) {
  return (
    <div className="login-page">
      <div className="login-layout">
        <section className="login-intro">
          <span className="eyebrow">ENGINEERING INTELLIGENCE</span>
          <h1>Turn delivery signals into clearer decisions.</h1>
          <p>Live GitHub metrics tailored to the people using them:</p>
          <p>1. Operational detail for engineering leads</p>
          <p>2. Multi-squad visibility for executives.</p>

          <div className="login-features">
            <span>Live GitHub signals</span>
            <span>Role-based views</span>
            <span>DORA + flow metrics</span>
          </div>
        </section>

        <section className="login-card">
          <div className="login-card-heading">
            <span className="brand-mark">M</span>
            <div>
              <h2>Explore the dashboard</h2>
              <p>Choose an audience to enter the live demo.</p>
            </div>
          </div>

          <button
            className="role-button"
            disabled={loading}
            onClick={() => login("lead", "lead-demo", "lead")}
          >
            <span className="role-icon">EL</span>
            <span className="role-copy">
              <strong>Engineering Lead</strong>
              <small>Squad-level delivery and flow metrics</small>
            </span>
            <span className="role-arrow">→</span>
          </button>

          <button
            className="role-button"
            disabled={loading}
            onClick={() => login("executive", "executive-demo", "executive")}
          >
            <span className="role-icon">CEO</span>
            <span className="role-copy">
              <strong>CEO Office</strong>
              <small>Organisation-level multi-squad health</small>
            </span>
            <span className="role-arrow">→</span>
          </button>

          <div className="demo-notice">
            <strong>Demo environment</strong>
            <span>
              The backend may sleep after inactivity. The first request can take
              up to a minute while the service wakes up.
            </span>
          </div>

          {loading && (
            <div className="loading-state">
              <span className="spinner" />
              <div>
                <strong>Loading live metrics</strong>
                <small>The hosted API may take a moment to wake up.</small>
              </div>
            </div>
          )}

          {error && <p className="error">{error}</p>}

          <div className="security-note">
            <span className="security-dot" />
            Separate credentials and server-side role-based access control.
          </div>
        </section>
      </div>
    </div>
  );
}

function EngineeringView({ data }) {
  return (
    <>
      <section className="page-heading">
        <div>
          <span className="eyebrow">ENGINEERING LEAD VIEW</span>
          <h2>Squad delivery health</h2>
          <p>
            Operational signals for delivery speed, reliability and engineering
            flow.
          </p>
        </div>
        <span className="live-pill">
          <span className="live-dot" />
          Live
        </span>
      </section>

      <section className="repository-strip">
        <span>Repository</span>
        <strong>{data.repository}</strong>
      </section>

      <MetricGrid metrics={data.metrics} />

      <div className="data-note">
        <strong>Source signals</strong>
        <span>GitHub Pull Requests</span>
        <span>Deployments</span>
        <span>GitHub Actions</span>
      </div>
    </>
  );
}

function ExecutiveView({ data }) {
  return (
    <>
      <section className="page-heading">
        <div>
          <span className="eyebrow">CEO OFFICE VIEW</span>
          <h2>Organisation delivery health</h2>
          <p>
            Two engineering squads, one concise view of delivery performance.
          </p>
        </div>

        <div className="reporting-pill">
          <strong>{data.squads.length}</strong>
          <span>squads reporting</span>
        </div>
      </section>

      <section className="executive-panel">
        {data.squads.map((squad, index) => (
          <div className="squad-row" key={squad.name}>
            <div className="squad-identity">
              <div className="squad-name-line">
                <h3>{squad.name}</h3>
                <span className="live-pill compact">
                  <span className="live-dot" />
                  Live
                </span>
              </div>
              <code>{squad.repository}</code>
            </div>

            <div className="squad-metrics">
              <CompactMetric
                label="Deployment Frequency"
                value={squad.metrics.deploymentsLast7Days}
                unit="/ 7 days"
                tone="blue"
              />
              <CompactMetric
                label="Lead Time"
                value={squad.metrics.averageLeadTimeHours}
                unit="hours"
                tone="purple"
              />
              <CompactMetric
                label="CI Success"
                value={`${squad.metrics.ciSuccessRate}%`}
                unit="completed runs"
                tone="green"
              />
              <CompactMetric
                label="PR Throughput"
                value={squad.metrics.mergedPullRequestsLast7Days}
                unit="merged / 7 days"
                tone="amber"
              />
            </div>

            {index < data.squads.length - 1 && (
              <div className="squad-divider" />
            )}
          </div>
        ))}
      </section>

      <div className="privacy-note">
        <span className="privacy-icon">✓</span>
        <div>
          <strong>Privacy by design</strong>
          <p>
            Executive reporting stays at squad level. Individual engineer
            activity is intentionally excluded.
          </p>
        </div>
      </div>
    </>
  );
}

function MetricGrid({ metrics }) {
  return (
    <section className="metric-grid">
      <MetricCard
        title="Deployment Frequency"
        value={metrics.deploymentsLast7Days}
        unit="successful deployments / 7 days"
        type="DORA"
        tone="blue"
      />
      <MetricCard
        title="Lead Time for Changes"
        value={metrics.averageLeadTimeHours}
        unit="hours"
        type="DORA"
        tone="purple"
      />
      <MetricCard
        title="CI Success Rate"
        value={`${metrics.ciSuccessRate}%`}
        unit="of completed runs"
        type="QUALITY"
        tone="green"
      />
      <MetricCard
        title="PR Throughput"
        value={metrics.mergedPullRequestsLast7Days}
        unit="merged / 7 days"
        type="FLOW"
        tone="amber"
      />
    </section>
  );
}

function MetricCard({ title, value, unit, type, tone }) {
  return (
    <article className={`metric-card tone-${tone}`}>
      <div className="metric-heading">
        <span>{title}</span>
        <small>{type}</small>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-unit">{unit}</div>
    </article>
  );
}

function CompactMetric({ label, value, unit, tone }) {
  return (
    <div className={`compact-metric tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{unit}</small>
    </div>
  );
}

export default App;
