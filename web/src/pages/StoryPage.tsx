export function StoryPage() {
  return (
    <div className="stack">
      <div className="section-head">
        <div>
          <h2>Resume story</h2>
          <p className="muted" style={{ margin: '0.35rem 0 0' }}>
            Talking points for interviews — map UI actions to distributed systems patterns.
          </p>
        </div>
      </div>

      <section className="card-soft">
        <h3>One-liner</h3>
        <p>
          Built <strong>FinFlow</strong>, a full-stack distributed payment platform with Java 21 /
          Spring Boot microservices, Kafka choreography saga, transactional outbox, and a React
          dashboard that visualizes async fraud review in real time.
        </p>
      </section>

      <div className="grid-2">
        <section className="card-soft">
          <h3>What I owned (backend)</h3>
          <ul className="muted">
            <li>API Gateway: JWT validation, Redis rate limiting, path routing</li>
            <li>Auth: bcrypt passwords, access + hashed refresh tokens</li>
            <li>Payments: idempotency keys, saga with wallet + fraud + notify</li>
            <li>Outbox relay for atomic DB write + Kafka publish</li>
            <li>Wallet: pessimistic locking, reserve / settle / release</li>
            <li>Observability: Micrometer, Prometheus, Grafana, Zipkin</li>
          </ul>
        </section>
        <section className="card-soft">
          <h3>What I owned (frontend)</h3>
          <ul className="muted">
            <li>React + Vite + TypeScript SPA behind the gateway</li>
            <li>JWT session with silent refresh on 401</li>
            <li>TanStack Query polling for eventual consistency UX</li>
            <li>Live saga timeline for PENDING → APPROVED / REJECTED</li>
            <li>Dockerized nginx static hosting in compose stack</li>
          </ul>
        </section>
      </div>

      <section className="card-soft">
        <h3>Demo script (2 minutes)</h3>
        <ol className="muted">
          <li>Register user A → create wallet with 5,000 BRL</li>
          <li>Register user B in another browser / incognito → copy user id</li>
          <li>As A, send 100 BRL → show PENDING_FRAUD_REVIEW then APPROVED</li>
          <li>Send 50,001 BRL → show fraud REJECTED and reserved funds released</li>
          <li>Open Grafana / Zipkin / Kafka UI to prove the production-style stack</li>
        </ol>
      </section>

      <section className="card-soft">
        <h3>Impact bullets (copy for LinkedIn / resume)</h3>
        <ul className="muted">
          <li>
            Designed an event-driven payment pipeline with choreography saga and transactional
            outbox, eliminating dual-write risk between PostgreSQL and Kafka.
          </li>
          <li>
            Implemented idempotent payment creation and wallet operations to safely handle
            at-least-once delivery and client retries.
          </li>
          <li>
            Delivered a React operator UI that surfaces eventual consistency via polling and a
            saga timeline, improving demo clarity for async fraud decisions.
          </li>
          <li>
            Packaged the full stack with Docker Compose (services, Kafka, observability, web)
            for one-command local reproduction.
          </li>
        </ul>
      </section>
    </div>
  )
}
