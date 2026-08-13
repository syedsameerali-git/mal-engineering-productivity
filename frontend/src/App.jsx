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
    <div className="dashboard">
      <header>
        <div>
          <h1>Engineering Productivity</h1>
          <p>
            {role === "lead"
              ? "Squad delivery health and engineering flow"
              : "Organisation-level engineering health"}
          </p>
        </div>

        <div>
          <span className="badge">{dashboard.audience}</span>
          <button
            className="logout"
            onClick={() => {
              setDashboard(null);
              setRole(null);
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      {role === "lead" ? (
        <EngineeringView data={dashboard} />
      ) : (
        <ExecutiveView data={dashboard} />
      )}
    </div>
  );
}

function Login({ login, error, loading }) {
  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Engineering Productivity</h1>
        <p className="login-subtitle">
          Live engineering delivery metrics from GitHub. Select an audience to
          explore the demo.
        </p>
        <button
          disabled={loading}
          onClick={() => login("lead", "lead-demo", "lead")}
        >
          Engineering Lead
        </button>

        <button
          disabled={loading}
          onClick={() => login("executive", "executive-demo", "executive")}
        >
          CEO Office
        </button>

        {loading && (
          <div className="loading-state">
            <span className="spinner"></span>
            Loading live engineering metrics...
          </div>
        )}

        {error && <p className="error">{error}</p>}

        <small className="security-note">
          🔒 Each audience uses separate credentials and server-side role-based
          access control.
        </small>
      </div>
    </div>
  );
}

function EngineeringView({ data }) {
  const metrics = data.metrics;

  return (
    <>
      <div className="context">
        <strong>Squad source:</strong> {data.repository}
      </div>

      <MetricGrid metrics={metrics} />

      <div className="source">
        <strong>Live source data:</strong> GitHub Pull Requests + Deployments +
        GitHub Actions
      </div>
    </>
  );
}

function ExecutiveView({ data }) {
  return (
    <>
      <div className="executive-note">
        <strong>Organisation delivery overview:</strong> 2 engineering squads
        reporting from live GitHub data. Individual engineer activity is
        intentionally excluded.
      </div>

      {data.squads.map((squad) => (
        <section className="ceo-squad" key={squad.name}>
          <div className="ceo-squad-title">
            <div>
              <span className="squad-label">ENGINEERING SQUAD</span>
              <div className="repo-name">{squad.name}</div>
              <div className="repo-name">{squad.repository}</div>
            </div>

            <span className="live-badge">Live GitHub data</span>
          </div>

          <MetricGrid metrics={squad.metrics} />
        </section>
      ))}

      <div className="source">
        <strong>Executive scope:</strong> Squad-level delivery health only. No
        individual engineer activity is exposed.
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
      />

      <MetricCard
        title="Lead Time for Changes"
        value={metrics.averageLeadTimeHours}
        unit="hours"
        type="DORA"
      />

      <MetricCard
        title="CI Success Rate"
        value={metrics.ciSuccessRate}
        unit="% of completed runs"
        type="QUALITY"
      />

      <MetricCard
        title="PR Throughput"
        value={metrics.mergedPullRequestsLast7Days}
        unit="merged / 7 days"
        type="FLOW"
      />
    </section>
  );
}

function MetricCard({ title, value, unit, type }) {
  return (
    <article className="metric-card">
      <div className="metric-heading">
        <span>{title}</span>
        <small>{type}</small>
      </div>

      <div className="metric-value">{value}</div>
      <div className="metric-unit">{unit}</div>
    </article>
  );
}

export default App;
