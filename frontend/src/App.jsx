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
        },
      );

      if (!response.ok) throw new Error();

      setDashboard(await response.json());
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
  const metrics = data.deliveryHealth;

  return (
    <>
      <div className="executive-note">
        <strong>Executive delivery overview:</strong> Aggregated engineering
        health focused on delivery speed and reliability. Individual engineer
        activity and repository-level detail are intentionally excluded.
      </div>

      <section className="metric-grid executive-metrics">
        <MetricCard
          title="Delivery Pace"
          value={metrics.deploymentsLast7Days}
          unit="production deployments / 7 days"
          type="DELIVERY"
        />

        <MetricCard
          title="Change Lead Time"
          value={metrics.averageLeadTimeHours}
          unit="hours to deliver change"
          type="VELOCITY"
        />

        <MetricCard
          title="Build Health"
          value={`${metrics.ciSuccessRate}%`}
          unit="successful CI runs"
          type="RELIABILITY"
        />
      </section>

      <div className="source">
        <strong>Executive scope:</strong> Organisation-level delivery signals.
        No individual engineer activity is exposed.
      </div>
    </>
  );
}

function ExecutiveMetric({ label, value, unit, detail }) {
  return (
    <article className="executive-metric">
      <span className="executive-label">{label}</span>
      <div className="executive-value">{value}</div>
      <div className="executive-unit">{unit}</div>
      <p>{detail}</p>
    </article>
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
