import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const departmentIdsByCode = new Map<string, string>();

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
      role: 'qa-engineer',
      departmentCode: 'qa-testing',
    },
    {
      email: 'oleg.petrenko@vrc.local',
      fullName: 'Oleg Petrenko',
      role: 'support-engineer',
      departmentCode: 'technical-support',
    },
    {
      email: 'iryna.koval@vrc.local',
      fullName: 'Iryna Koval',
      role: 'quality-manager',
      departmentCode: 'quality-management',
    },
  ] as const) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        fullName: user.fullName,
        role: user.role,
        departmentId: departmentIdsByCode.get(user.departmentCode)!,
      },
      create: {
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        departmentId: departmentIdsByCode.get(user.departmentCode)!,
      },
    });
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
