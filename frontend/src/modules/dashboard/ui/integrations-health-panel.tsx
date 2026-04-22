import {
  getIntegrationHealthSnapshot,
  IntegrationHealthItem,
} from '../model/integration-health';

type IntegrationStatusBadgeProps = {
  item: IntegrationHealthItem;
};

function IntegrationStatusBadge(props: IntegrationStatusBadgeProps) {
  return (
    <span className={`integration-health-status integration-health-status-${props.item.status}`}>
      {props.item.statusLabel}
    </span>
  );
}

export function IntegrationsHealthPanel() {
  const integrations = getIntegrationHealthSnapshot();

  return (
    <section className="content-card integrations-health-panel">
      <div className="section-heading">
        <h2>Adapter readiness</h2>
        <span className="muted-text">{integrations.length} planned integrations</span>
      </div>

      <p className="table-secondary integrations-health-intro">
        This is an operational placeholder. Integration availability will be driven by adapter
        modules and environment configuration, not by UI-only flags.
      </p>

      <div className="integration-health-list">
        {integrations.map((item) => (
          <article className="integration-health-item" key={item.code}>
            <div className="integration-health-item-head">
              <div>
                <div className="integration-health-name">{item.name}</div>
                <div className="integration-health-code">{item.code}</div>
              </div>
              <IntegrationStatusBadge item={item} />
            </div>

            <p className="table-secondary">{item.description}</p>

            <div className="integration-health-meta">
              <div>
                <span className="field-label">Next step</span>
                <div>{item.nextStep}</div>
              </div>
              <div>
                <span className="field-label">Owner</span>
                <div>{item.owner}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
