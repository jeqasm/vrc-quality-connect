import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const permissionDefinitions = [
    ['dashboard.view', 'View dashboard', 'dashboard'],
    ['activity-records.view', 'View activity records', 'activity-records'],
    ['activity-records.create', 'Create activity records', 'activity-records'],
    ['activity-records.qa.view', 'View QA activity tab', 'activity-records'],
    ['activity-records.support.view', 'View support activity tab', 'activity-records'],
    ['activity-records.management.view', 'View management activity tab', 'activity-records'],
    ['reports.view', 'View reports workspace', 'reports'],
    ['reports.qa.view', 'View QA reports tab', 'reports'],
    ['reports.licenses.view', 'View license reports tab', 'reports'],
    ['reports.support.view', 'View support reports tab', 'reports'],
    ['reports.management.view', 'View management reports tab', 'reports'],
    ['licenses.view', 'View licenses page', 'licenses'],
    ['support-requests.view', 'View support requests page', 'support-requests'],
    ['settings.view', 'View settings page', 'settings'],
    ['users.manage', 'Manage users', 'administration'],
    ['groups.manage', 'Manage groups', 'administration'],
    ['access-control.manage', 'Manage access control', 'administration'],
  ] as const;
  const roleDefinitions = [
    ['administrator', 'Administrator', 'Platform-wide administrator access'],
    ['manager', 'Manager', 'Manager access for reporting and team administration'],
    ['employee', 'Employee', 'Operational employee access'],
  ] as const;
  const rolePermissionMap: Record<string, string[]> = {
    administrator: permissionDefinitions.map(([code]) => code),
    manager: [
      'dashboard.view',
      'activity-records.view',
      'activity-records.create',
      'reports.view',
      'licenses.view',
      'support-requests.view',
      'settings.view',
      'groups.manage',
    ],
    employee: [
      'activity-records.view',
      'activity-records.create',
      'reports.view',
      'licenses.view',
    ],
  };

  const departmentIdsByCode = new Map<string, string>();
  const roleIdsByCode = new Map<string, string>();
  const permissionIdsByCode = new Map<string, string>();

  for (const [code, name] of [
    ['qa-testing', 'QA / Testing'],
    ['technical-support', 'Technical Support'],
    ['quality-management', 'Head of Quality / Management'],
  ] as const) {
    const department = await prisma.department.upsert({
      where: { code },
      update: { name, isActive: true },
      create: { code, name, isActive: true },
    });

    departmentIdsByCode.set(code, department.id);
  }

  for (const [code, name, description] of roleDefinitions) {
    const role = await prisma.accessRole.upsert({
      where: { code },
      update: { name, description, isSystem: true },
      create: { code, name, description, isSystem: true },
    });

    roleIdsByCode.set(code, role.id);
  }

  for (const [code, name, category] of permissionDefinitions) {
    const permission = await prisma.accessPermission.upsert({
      where: { code },
      update: { name, category },
      create: {
        code,
        name,
        category,
      },
    });

    permissionIdsByCode.set(code, permission.id);
  }

  for (const [roleCode, permissionCodes] of Object.entries(rolePermissionMap)) {
    const roleId = roleIdsByCode.get(roleCode)!;
    const desiredPermissionIds = permissionCodes.map((permissionCode) => permissionIdsByCode.get(permissionCode)!);

    await prisma.accessRolePermission.deleteMany({
      where: {
        roleId,
        permissionId: {
          notIn: desiredPermissionIds,
        },
      },
    });

    for (const permissionCode of permissionCodes) {
      await prisma.accessRolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId: permissionIdsByCode.get(permissionCode)!,
          },
        },
        update: {},
        create: {
          roleId,
          permissionId: permissionIdsByCode.get(permissionCode)!,
        },
      });
    }
  }

  for (const [code, name] of [
    ['testing', 'Testing'],
    ['retest', 'Retest'],
    ['bug-found', 'Bug Found'],
    ['project-work', 'Project Work'],
    ['communication', 'Communication'],
    ['license-operation', 'License Operation'],
    ['support-work', 'Support Work'],
  ] as const) {
    await prisma.activityType.upsert({
      where: { code },
      update: { name, isActive: true },
      create: { code, name, isActive: true },
    });
  }

  for (const [code, name] of [
    ['completed', 'Completed'],
    ['bug-found', 'Bug Found'],
    ['fixed-confirmed', 'Fixed Confirmed'],
    ['sent-to-rework', 'Sent to Rework'],
    ['consultation-provided', 'Consultation Provided'],
    ['blocked', 'Blocked'],
  ] as const) {
    await prisma.activityResult.upsert({
      where: { code },
      update: { name, isActive: true },
      create: { code, name, isActive: true },
    });
  }

  for (const user of [
    {
      email: 'anna.ivanova@vrc.local',
      fullName: 'Anna Ivanova',
      accessRoleCode: 'employee',
      departmentCode: 'qa-testing',
    },
    {
      email: 'oleg.petrenko@vrc.local',
      fullName: 'Oleg Petrenko',
      accessRoleCode: 'employee',
      departmentCode: 'technical-support',
    },
    {
      email: 'iryna.koval@vrc.local',
      fullName: 'Iryna Koval',
      accessRoleCode: 'manager',
      departmentCode: 'quality-management',
    },
  ] as const) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        fullName: user.fullName,
        departmentId: departmentIdsByCode.get(user.departmentCode)!,
        accessRoleId: roleIdsByCode.get(user.accessRoleCode)!,
      },
      create: {
        email: user.email,
        fullName: user.fullName,
        departmentId: departmentIdsByCode.get(user.departmentCode)!,
        accessRoleId: roleIdsByCode.get(user.accessRoleCode)!,
      },
    });
  }

  for (const groupDefinition of [
    {
      code: 'department-qa-testing',
      name: 'QA / Testing',
      description: 'Operational QA team group',
      type: 'department',
      departmentCode: 'qa-testing',
      memberEmails: ['anna.ivanova@vrc.local'],
      permissionCodes: ['activity-records.qa.view', 'reports.qa.view'],
    },
    {
      code: 'department-technical-support',
      name: 'Technical Support',
      description: 'Operational support team group',
      type: 'department',
      departmentCode: 'technical-support',
      memberEmails: ['oleg.petrenko@vrc.local'],
      permissionCodes: ['activity-records.support.view', 'reports.support.view'],
    },
    {
      code: 'department-quality-management',
      name: 'Management',
      description: 'Management and coordination group',
      type: 'department',
      departmentCode: 'quality-management',
      memberEmails: ['iryna.koval@vrc.local'],
      permissionCodes: ['activity-records.management.view', 'reports.management.view', 'groups.manage'],
    },
  ] as const) {
    const group = await prisma.group.upsert({
      where: { code: groupDefinition.code },
      update: {
        name: groupDefinition.name,
        description: groupDefinition.description,
        type: groupDefinition.type,
        isActive: true,
        departmentId: departmentIdsByCode.get(groupDefinition.departmentCode)!,
      },
      create: {
        code: groupDefinition.code,
        name: groupDefinition.name,
        description: groupDefinition.description,
        type: groupDefinition.type,
        isActive: true,
        departmentId: departmentIdsByCode.get(groupDefinition.departmentCode)!,
      },
    });

    for (const memberEmail of groupDefinition.memberEmails) {
      const user = await prisma.user.findUniqueOrThrow({
        where: { email: memberEmail },
        select: { id: true },
      });

      await prisma.groupMembership.upsert({
        where: {
          groupId_userId: {
            groupId: group.id,
            userId: user.id,
          },
        },
        update: {},
        create: {
          groupId: group.id,
          userId: user.id,
        },
      });
    }

    for (const permissionCode of groupDefinition.permissionCodes) {
      await prisma.groupPermissionAssignment.upsert({
        where: {
          groupId_permissionId: {
            groupId: group.id,
            permissionId: permissionIdsByCode.get(permissionCode)!,
          },
        },
        update: {},
        create: {
          groupId: group.id,
          permissionId: permissionIdsByCode.get(permissionCode)!,
        },
      });
    }
  }

  for (const [code, name] of [
    ['demo', 'Demo'],
    ['student', 'Student'],
    ['academic', 'Academic'],
    ['commercial', 'Commercial'],
    ['temporary', 'Temporary'],
  ] as const) {
    await prisma.licenseType.upsert({
      where: { code },
      update: { name },
      create: { code, name },
    });
  }

  for (const [code, name] of [
    ['issue', 'Issue'],
    ['consultation', 'Consultation'],
    ['installation', 'Installation'],
    ['license-request', 'License Request'],
    ['bug-report', 'Bug Report'],
    ['feature-request', 'Feature Request'],
  ] as const) {
    await prisma.supportRequestType.upsert({
      where: { code },
      update: { name },
      create: { code, name },
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    process.exit(1);
  });
