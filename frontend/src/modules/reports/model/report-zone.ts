export type ReportZoneKey = 'qa' | 'licenses' | 'support' | 'management';

type ReportZone = {
  key: ReportZoneKey;
  title: string;
  subtitle: string;
};

const reportZones: Record<ReportZoneKey, ReportZone> = {
  qa: {
    key: 'qa',
    title: 'QA / Testing',
    subtitle: 'Динамика тестирования, багов и связанных QA-показателей.',
  },
  licenses: {
    key: 'licenses',
    title: 'Лицензии',
    subtitle: 'Аналитика выдачи лицензий по реестру и выбранному периоду.',
  },
  support: {
    key: 'support',
    title: 'Technical Support',
    subtitle: 'Отчеты по обращениям, нагрузке и скорости обработки.',
  },
  management: {
    key: 'management',
    title: 'Management',
    subtitle: 'Управленческие срезы, контроль нагрузки и итоговые показатели.',
  },
};

export function getReportZone(zoneKey: ReportZoneKey): ReportZone {
  return reportZones[zoneKey];
}
