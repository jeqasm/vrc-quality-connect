import { ReferenceDataBundle } from '../../reference-data/model/reference-data';

export type ActivityRecordZoneKey = 'qa' | 'licenses' | 'support' | 'management';

export type ActivityRecordZoneDefinition = {
  key: ActivityRecordZoneKey;
  title: string;
  subtitle: string;
  departmentCode: string;
  activityTypeCodes: string[];
  titlePlaceholder: string;
  optionalLabels: {
    description: string;
    comment: string;
    externalId: string;
    externalUrl: string;
  };
};

export const activityRecordZones: ActivityRecordZoneDefinition[] = [
  {
    key: 'qa',
    title: 'QA / Testing',
    subtitle: 'Testing runs, retests, bug verification and related QA work.',
    departmentCode: 'qa-testing',
    activityTypeCodes: ['testing', 'retest', 'bug-found', 'project-work'],
    titlePlaceholder: 'Regression test for portal release',
    optionalLabels: {
      description: 'Test scope',
      comment: 'Environment / notes',
      externalId: 'Bug or case ID',
      externalUrl: 'Bug or case URL',
    },
  },
  {
    key: 'licenses',
    title: 'Лицензии',
    subtitle: 'Выдача и учет лицензий за текущую неделю.',
    departmentCode: 'technical-support',
    activityTypeCodes: ['license-operation'],
    titlePlaceholder: 'Weekly license operations',
    optionalLabels: {
      description: 'License operation summary',
      comment: 'Notes',
      externalId: 'License request ID',
      externalUrl: 'License request URL',
    },
  },
  {
    key: 'support',
    title: 'Technical Support',
    subtitle: 'Support requests, consultations, troubleshooting and customer handling.',
    departmentCode: 'technical-support',
    activityTypeCodes: ['support-work', 'communication', 'license-operation'],
    titlePlaceholder: 'Customer issue triage for installation problem',
    optionalLabels: {
      description: 'Request summary',
      comment: 'Resolution / notes',
      externalId: 'Ticket ID',
      externalUrl: 'Ticket URL',
    },
  },
  {
    key: 'management',
    title: 'Management',
    subtitle: 'Planning, coordination, reviews, reporting and management decisions.',
    departmentCode: 'quality-management',
    activityTypeCodes: ['project-work', 'communication'],
    titlePlaceholder: 'Weekly quality sync and action plan',
    optionalLabels: {
      description: 'Decision summary',
      comment: 'Follow-up / notes',
      externalId: 'Report or item ID',
      externalUrl: 'Report or item URL',
    },
  },
];

export function getActivityRecordZone(zoneKey: ActivityRecordZoneKey): ActivityRecordZoneDefinition {
  return activityRecordZones.find((zone) => zone.key === zoneKey) ?? activityRecordZones[0];
}

export function buildZoneReferenceData(
  referenceData: ReferenceDataBundle,
  zone: ActivityRecordZoneDefinition,
): ReferenceDataBundle {
  return {
    users: referenceData.users.filter((user) => user.department.code === zone.departmentCode),
    departments: referenceData.departments.filter(
      (department) => department.code === zone.departmentCode,
    ),
    activityTypes: referenceData.activityTypes.filter((type) =>
      zone.activityTypeCodes.includes(type.code),
    ),
    activityResults: referenceData.activityResults,
  };
}
