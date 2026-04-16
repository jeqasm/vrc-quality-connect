import { PrismaClient } from '@prisma/client';

type LicenseTypeMapping = {
  oldName: string;
  newName: string;
};

type MappingStats = {
  mapping: LicenseTypeMapping;
  sourceTypeName: string | null;
  targetTypeName: string | null;
  movedRegistryRecords: number;
  movedOperations: number;
  deletedSourceType: boolean;
  skippedReason: string | null;
};

const rawMappings: Array<[string, string]> = [
  ['Academic', 'Студенческая'],
  ['Commercial', 'Коммерческая'],
  ['Cтуденческая', 'Cтуденческая'],
  ['Demo', 'Демо'],
  ['IT-планета', 'Конкурс'],
  ['Student', 'Студенческая'],
  ['Temporary', 'Демо'],
  ['АШК', 'АШК'],
  ['Абилимпикс', 'Конкурс'],
  ['Абилимпикс по компетенции "Инженерный дизайн (CAD) САПР"', 'Конкурс'],
  ['Абилимпикс по компетенции "Инженерный дизайн (CAD) САПР"', 'Конкурс'],
  ['Акселератор', 'Конкурс'],
  ['Амбилимпикс', 'Конкурс'],
  ['Блокада конкурс', 'Конкурс'],
  ['Демо', 'Демо'],
  ['Конкурс', 'Конкурс'],
  ['Конкурс Braim', 'Конкурс'],
  ['Конкурс Блокада', 'Конкурс'],
  ['Конкурс Профессионалы', 'Конкурс'],
  ['Конкурс Хакатон', 'Конкурс'],
  ['Кубок пользователей 2026', 'Конкурс'],
  ['МК', 'Мероприятие'],
  ['Международном фестивале научно-технического творчества детей и молодёжи', 'Мероприятие'],
  ['Не определено', 'Не определено'],
  ['Образовательная программа', 'Образовательная программа'],
  ['От винта', 'Конкурс'],
  ['Партнер', 'Партнерская'],
  ['Партнер(студ)', 'Студенческая'],
  ['Партнерская', 'Партнерская'],
  ['Партнеры', 'Партнерская'],
  ['Партнеры (студ)', 'Студенческая'],
  ['Партнёрская', 'Партнерская'],
  ['Разработка', 'Сотрудник'],
  ['Разработчик VR Concept', 'Сотрудник'],
  ['Росатом Сертификат на 3 месяца ссылка еа сертификат', 'Мероприятие'],
  ['Сотрудник VR Concept', 'Сотрудник'],
  ['Стажировка', 'Демо'],
  ['Студенческая', 'Студенческая'],
  ['Студенческая(клиент)', 'Студенческая'],
  ['Суденческая', 'Студенческая'],
  ['Хакатон', 'Конкурс'],
  ['Хакатон "Цифровые миры: VR-созидатели" 2026', 'Конкурс'],
  ['Хакатон Цифоровые Миры VR-созидатели 2026', 'Конкурс'],
  ['Хакатон Цифровые Миры', 'Конкурс'],
  ['практика', 'Демо'],
  ['сотрудник', 'Сотрудник'],
  ['хакатон 2026', 'Конкурс'],
];

const prisma = new PrismaClient();

function normalizeName(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function uniqMappings(input: Array<[string, string]>): LicenseTypeMapping[] {
  const uniqueMap = new Map<string, LicenseTypeMapping>();

  for (const [rawOldName, rawNewName] of input) {
    const oldName = normalizeName(rawOldName);
    const newName = normalizeName(rawNewName);
    const key = `${oldName}=>${newName}`;

    if (!oldName || !newName || uniqueMap.has(key)) {
      continue;
    }

    uniqueMap.set(key, { oldName, newName });
  }

  return [...uniqueMap.values()];
}

function buildCode(name: string): string {
  const normalized = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const prefix = normalized || 'license-type';
  const suffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  return `${prefix}-${suffix}`;
}

async function findLicenseTypeByName(name: string): Promise<{ id: string; name: string } | null> {
  const exact = await prisma.licenseType.findFirst({
    where: {
      name,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (exact) {
    return exact;
  }

  const insensitiveMatches = await prisma.licenseType.findMany({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      name: true,
    },
    take: 2,
  });

  if (insensitiveMatches.length === 1) {
    return insensitiveMatches[0];
  }

  return null;
}

async function ensureTargetType(name: string): Promise<{ id: string; name: string }> {
  const existingType = await findLicenseTypeByName(name);

  if (existingType) {
    return existingType;
  }

  return prisma.licenseType.create({
    data: {
      name,
      code: buildCode(name),
    },
    select: {
      id: true,
      name: true,
    },
  });
}

async function moveRecordsAndAppendComment(
  sourceTypeId: string,
  targetTypeId: string,
  oldTypeName: string,
): Promise<{ movedRegistryRecords: number; movedOperations: number }> {
  const commentEntry = `Исходный тип лицензии: ${oldTypeName}`;

  const movedRegistryRecords = await prisma.$executeRawUnsafe(
    `
      UPDATE license_registry_records
      SET
        license_type_id = $1::uuid,
        comment = CASE
          WHEN comment IS NULL OR BTRIM(comment) = '' THEN $2
          WHEN POSITION($2 IN comment) > 0 THEN comment
          ELSE comment || E'\\n' || $2
        END,
        updated_at = NOW()
      WHERE license_type_id = $3::uuid
    `,
    targetTypeId,
    commentEntry,
    sourceTypeId,
  );

  const movedOperations = await prisma.$executeRawUnsafe(
    `
      UPDATE license_operations
      SET
        license_type_id = $1::uuid,
        comment = CASE
          WHEN comment IS NULL OR BTRIM(comment) = '' THEN $2
          WHEN POSITION($2 IN comment) > 0 THEN comment
          ELSE comment || E'\\n' || $2
        END,
        updated_at = NOW()
      WHERE license_type_id = $3::uuid
    `,
    targetTypeId,
    commentEntry,
    sourceTypeId,
  );

  return {
    movedRegistryRecords: Number(movedRegistryRecords),
    movedOperations: Number(movedOperations),
  };
}

async function run(): Promise<void> {
  const mappings = uniqMappings(rawMappings);
  const stats: MappingStats[] = [];

  for (const mapping of mappings) {
    const sourceType = await findLicenseTypeByName(mapping.oldName);
    const targetType = await ensureTargetType(mapping.newName);

    if (!sourceType) {
      stats.push({
        mapping,
        sourceTypeName: null,
        targetTypeName: targetType.name,
        movedRegistryRecords: 0,
        movedOperations: 0,
        deletedSourceType: false,
        skippedReason: 'source type was not found',
      });
      continue;
    }

    if (sourceType.id === targetType.id) {
      stats.push({
        mapping,
        sourceTypeName: sourceType.name,
        targetTypeName: targetType.name,
        movedRegistryRecords: 0,
        movedOperations: 0,
        deletedSourceType: false,
        skippedReason: 'source and target are the same type',
      });
      continue;
    }

    const moveStats = await moveRecordsAndAppendComment(sourceType.id, targetType.id, sourceType.name);

    await prisma.licenseType.delete({
      where: {
        id: sourceType.id,
      },
    });

    stats.push({
      mapping,
      sourceTypeName: sourceType.name,
      targetTypeName: targetType.name,
      movedRegistryRecords: moveStats.movedRegistryRecords,
      movedOperations: moveStats.movedOperations,
      deletedSourceType: true,
      skippedReason: null,
    });
  }

  const changedMappings = stats.filter((item) => item.deletedSourceType);
  const skippedMappings = stats.filter((item) => item.skippedReason !== null);
  const movedRegistryRecordsTotal = changedMappings.reduce(
    (sum, item) => sum + item.movedRegistryRecords,
    0,
  );
  const movedOperationsTotal = changedMappings.reduce((sum, item) => sum + item.movedOperations, 0);

  console.log('License type remap finished.');
  console.log(`Processed mappings: ${stats.length}`);
  console.log(`Changed mappings: ${changedMappings.length}`);
  console.log(`Skipped mappings: ${skippedMappings.length}`);
  console.log(`Moved license registry records: ${movedRegistryRecordsTotal}`);
  console.log(`Moved license operations: ${movedOperationsTotal}`);

  if (changedMappings.length > 0) {
    console.log('\nChanged:');
    for (const item of changedMappings) {
      console.log(
        `- ${item.sourceTypeName} -> ${item.targetTypeName} | registry: ${item.movedRegistryRecords}, operations: ${item.movedOperations}`,
      );
    }
  }

  if (skippedMappings.length > 0) {
    console.log('\nSkipped:');
    for (const item of skippedMappings) {
      console.log(`- ${item.mapping.oldName} -> ${item.mapping.newName} | ${item.skippedReason}`);
    }
  }
}

run()
  .catch((error) => {
    console.error('Failed to remap license types.');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
