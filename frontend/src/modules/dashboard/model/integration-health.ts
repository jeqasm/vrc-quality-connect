export type IntegrationHealthStatus = 'planned' | 'not_connected' | 'connected' | 'degraded';

export type IntegrationHealthItem = {
  code: string;
  name: string;
  status: IntegrationHealthStatus;
  statusLabel: string;
  description: string;
  nextStep: string;
  owner: string;
};

export function getIntegrationHealthSnapshot(): IntegrationHealthItem[] {
  return [
    {
      code: 'crm',
      name: 'CRM',
      status: 'planned',
      statusLabel: 'Planned',
      description: 'No connector is enabled in runtime yet. Domain services stay decoupled from CRM API.',
      nextStep: 'Define provider-agnostic gateway contract and mapping DTOs.',
      owner: 'Integrations module',
    },
    {
      code: 'openproject',
      name: 'OpenProject',
      status: 'not_connected',
      statusLabel: 'Not connected',
      description: 'No active transport credentials or sync jobs are configured.',
      nextStep: 'Prepare secure config profile and connectivity smoke checks.',
      owner: 'Integrations module',
    },
    {
      code: 'testit',
      name: 'TestIT',
      status: 'not_connected',
      statusLabel: 'Not connected',
      description: 'Issue and test-result import/export routes are not wired.',
      nextStep: 'Add adapter skeleton and outbound event contracts.',
      owner: 'Integrations module',
    },
    {
      code: 'email',
      name: 'E-mail',
      status: 'planned',
      statusLabel: 'Planned',
      description: 'Template-driven notifications are not enabled in production flow.',
      nextStep: 'Introduce mail gateway interface and delivery policy rules.',
      owner: 'Integrations module',
    },
  ];
}
