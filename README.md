# Engineering Productivity Platform --- MVP

A working engineering productivity platform that turns live
engineering-system data into objective delivery-health metrics for two
audiences: Engineering Leads and the CEO Office.

Built as part of the Mal Engineering Productivity Lead Design & Build
Assessment.

## Live Demo

Frontend: `https://mal-engineering-productivity.vercel.app/`{=html}

The application provides demo access for two roles:

-   Engineering Lead --- squad-level delivery metrics
-   CEO Office --- aggregated engineering health without individual
    engineer activity

Role access is enforced server-side using Spring Security RBAC.

> **Demo environment:** The backend is hosted on a free Render instance
> and may sleep after inactivity. The first dashboard request can therefore
> take up to a minute while the service wakes up.

## What This MVP Demonstrates

The platform ingests live engineering data, computes productivity and
delivery-health metrics, and exposes different levels of information
based on audience.

### Data Flow

```text
GitHub Pull Requests ─────┐
GitHub Deployments ───────┼──► Spring Boot Ingestion & Metrics Engine
GitHub Actions ───────────┘                  │
                                             ▼
                              Spring Security / RBAC APIs
                                             │
                                             ▼
                                    React Dashboard
                                      ┌──────┴──────┐
                                      ▼             ▼
                              Engineering Lead   CEO Office
```

The MVP deliberately measures teams and delivery systems rather than
ranking individual engineers.

## Data Sources

The application consumes live data from two source-system categories.

### GitHub Pull Requests and Deployments

Used to derive:

-   Lead Time for Changes
-   Deployment Frequency
-   PR Throughput

### GitHub Actions

Used to derive:

-   CI Success Rate

The public demo currently uses below repos:

Engineering Lead view:
→ `spring-projects/spring-petclinic`

CEO Office view:
→ `spring-projects/spring-petclinic`
→ `spring-projects/spring-security`

These repositories act as two example engineering squads. The executive
view presents squad-level delivery health while deliberately excluding
individual engineer activity.

All four displayed metrics are computed from source-system data. No
productivity metrics are manually entered.

## Metrics

Deployment Frequency - DORA
Source: GitHub Deployments
Calculation: Number of GitHub deployment events during the previous 7 days.

Lead Time for Changes - DORA
Source: GitHub Pull Requests
Calculation: Average elapsed time from PR creation to PR merge.

PR Throughput - Flow
Source: GitHub Pull Requests
Calculation: Number of pull requests merged during the previous 7 days.

CI Success Rate - Quality
Source: GitHub Actions
Calculation: Successful completed workflow runs divided by all completed workflow runs × 100.

### Metric Design Notes

A successful CI run is deliberately **not** treated as a deployment.
Deployment Frequency uses GitHub Deployment events instead.

The MVP Lead Time for Changes calculation uses PR creation-to-merge as a
practical approximation. A production implementation would correlate
commit SHAs with successful production deployments to measure
commit-to-production lead time.

Metrics are presented at team/repository level rather than as individual
engineer rankings. This reduces incentives to game activity metrics such
as commit counts or lines of code.

## Audience Views

### Engineering Lead

Provides operational squad-level context including:

-   repository/squad source
-   deployment frequency
-   lead time
-   PR throughput
-   CI success rate
-   underlying source-system context

### CEO Office

Provides an organization-level delivery-health view across multiple squads.

Individual engineer activity is intentionally excluded from the executive
view. Repository identity is shown only to establish squad/source context;
no engineer-level activity is exposed.

## Access Control

Access control is enforced in the Spring Boot backend using Spring
Security.

Two roles are defined for the assessment demo:

-   `ENGINEERING_LEAD`
-   `EXECUTIVE`

Each role is authorized for its own API endpoint. Cross-role access
returns HTTP `403 Forbidden`.

The frontend's audience-selection buttons provide frictionless reviewer
access, but authorization is still enforced server-side rather than
through frontend routing alone.

For production, the demo authentication mechanism would be replaced with
enterprise SSO using OIDC/OAuth 2.0, with identity-provider-managed
users and role/group mapping.

## Technology Stack

### Backend

-   Java 17
-   Spring Boot
-   Spring Security
-   Spring REST Client
-   Maven

### Frontend

-   React
-   Vite

### Infrastructure

-   Render --- backend
-   Vercel --- frontend
-   GitHub --- source control and live engineering data

## Security

-   Role-based authorization is enforced server-side.
-   GitHub API credentials are not stored in source control.
-   The deployed backend receives its GitHub token through an
    environment variable.
-   The GitHub integration is read-only.
-   CORS restricts browser access to approved development and Vercel
    origins.
-   Executive views deliberately exclude individual engineer data.

## Local Setup

### Prerequisites

-   Java 17+
-   Node.js 22+
-   Git

### Backend

From the repository root:

``` bash
./mvnw spring-boot:run
```

The backend runs on:

``` text
http://localhost:8080
```

A GitHub token can optionally be supplied to avoid unauthenticated API
rate limits:

``` bash
export GITHUB_TOKEN=<your-token>
```

Never commit the token to source control.

### Frontend

``` bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

``` text
http://localhost:5173
```

## Live vs Seeded Data

**Live data:**

-   GitHub pull requests
-   GitHub deployment events
-   GitHub Actions workflow runs
-   all four dashboard metric calculations

**Seeded data:**

-   None

Because the public demo repository may have little activity in the
current 7-day window, zero values are valid source-derived results
rather than synthetic values inserted to make the dashboard appear
active.

## Known Limitation

The MVP computes metrics synchronously from the GitHub API when the
dashboard is requested.

This is appropriate for demonstrating the complete
ingestion-to-dashboard flow, but it would not be the architecture used
across eight squads at production scale.

The next improvement would be asynchronous ingestion with persisted
metric snapshots and caching. Source-system events would be collected
incrementally, normalized into a common data model, and queried from the
platform's own datastore rather than repeatedly querying upstream APIs
during dashboard requests.

## Production Evolution

At organizational scale, I would evolve the MVP toward:

1.  asynchronous/event-driven source ingestion
2.  normalized engineering-event storage
3.  scheduled and incremental metric computation
4.  historical snapshots for 7/14/28-day trends
5.  SSO/OIDC-based authentication
6.  configurable squad and source-system mappings
7.  audit logging and fine-grained authorization
8.  extensible domain adapters for functions such as Risk, Operations,
    and Marketing

The central principle remains unchanged: measure delivery systems and
outcomes from ground-truth source data, while avoiding individual
productivity scoring.

## Architecture

The target production architecture evolves the MVP from synchronous
source-API reads toward event-driven ingestion, normalized event storage,
historical metric snapshots, and scoped RBAC.

![Target Platform Architecture](docs/architecture.png)

The editable draw.io source is available at
`docs/architecture.drawio`.
