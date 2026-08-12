import { useState } from "react";
import "./App.css";

const API = "http://localhost:8080";

function App() {
  const [dashboard, setDashboard] = useState(null);
  const [role, setRole] = useState(null);
  const [error, setError] = useState("");

  async function login(username, password, selectedRole) {
    setError("");

    const endpoint =
      selectedRole === "lead"
        ? "/api/dashboard/engineering"
        : "/api/dashboard/executive";

    try {
      const response = await fetch(
        `${API}${endpoint}?owner=spring-projects&repo=spring-petclinic`,
        {
          headers: {
            Authorization: "Basic " + btoa(`${username}:${password}`),
          },
        }
      );

      if (!response.ok) throw new Error();

      setDashboard(await response.json());
      setRole(selectedRole);
    } catch {
      setError("Invalid credentials or insufficient access.");
    }
  }

  if (!dashboard) {
    return <Login login={login} error={error} />;
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

function Login({ login, error }) {
  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Engineering Productivity</h1>
        <p>Choose a demo audience to access the platform.</p>

        <button
          onClick={() => login("lead", "lead-demo", "lead")}
        >
          Engineering Lead
        </button>

        <button
          onClick={() =>
            login("executive", "executive-demo", "executive")
          }
        >
          CEO Office
        </button>

        {error && <p className="error">{error}</p>}

        <small>Access is enforced by backend role-based security.</small>
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
        <strong>Ground truth:</strong> GitHub Pull Requests + GitHub Actions
      </div>
    </>
  );
}

function ExecutiveView({ data }) {
  const metrics = data.deliveryHealth;

  return (
    <>
      <div className="executive-note">
        Aggregated engineering health. Individual engineer activity is
        intentionally excluded.
      </div>

      <MetricGrid metrics={metrics} />
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