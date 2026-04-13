import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

type DurationAggregate = {
  _sum: {
    durationMinutes: number | null;
  };
  _count: {
    _all: number;
  };
};

@Injectable()
export class ReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async aggregateLicenseTotals(dateFrom: string, dateTo: string): Promise<{
    totalIssuedLicenses: number;
    totalRegistryEntries: number;
  }> {
    const rows = await this.prisma.$queryRaw<
      Array<{ totalIssuedLicenses: bigint | number | null; totalRegistryEntries: bigint | number }>
    >(Prisma.sql`
      SELECT
        COALESCE(SUM(quantity), 0) AS "totalIssuedLicenses",
        COUNT(*) AS "totalRegistryEntries"
      FROM license_registry_records
      WHERE issue_date >= ${dateFrom}::date
        AND issue_date <= ${dateTo}::date
    `);

    const aggregate = rows[0] ?? { totalIssuedLicenses: 0, totalRegistryEntries: 0 };

    return {
      totalIssuedLicenses: Number(aggregate.totalIssuedLicenses ?? 0),
      totalRegistryEntries: Number(aggregate.totalRegistryEntries ?? 0),
    };
  }

  async groupLicenseQuantityByType(
    dateFrom: string,
    dateTo: string,
  ): Promise<Array<{ licenseType: string; quantity: number }>> {
    const groups = await this.prisma.$queryRaw<Array<{ licenseType: string; quantity: bigint | number }>>(
      Prisma.sql`
        SELECT
          license_type.name AS "licenseType",
          SUM(registry.quantity) AS "quantity"
        FROM license_registry_records registry
        INNER JOIN license_types license_type ON license_type.id = registry.license_type_id
        WHERE issue_date >= ${dateFrom}::date
          AND issue_date <= ${dateTo}::date
        GROUP BY license_type.name
        ORDER BY SUM(registry.quantity) DESC, license_type.name ASC
      `,
    );

    return groups.map((group) => ({
      licenseType: group.licenseType,
      quantity: Number(group.quantity),
    }));
  }

  async groupLicenseQuantityByDate(
    dateFrom: string,
    dateTo: string,
  ): Promise<Array<{ issueDate: string; quantity: number }>> {
    const rows = await this.prisma.$queryRaw<Array<{ issueDate: string; quantity: bigint | number }>>(
      Prisma.sql`
        SELECT
          TO_CHAR(issue_date, 'YYYY-MM-DD') AS "issueDate",
          SUM(quantity) AS "quantity"
        FROM license_registry_records
        WHERE issue_date >= ${dateFrom}::date
          AND issue_date <= ${dateTo}::date
        GROUP BY issue_date
        ORDER BY issue_date ASC
      `,
    );

    return rows.map((row) => ({
      issueDate: row.issueDate,
      quantity: Number(row.quantity),
    }));
  }

  async aggregateQaWeeklyTotals(dateFrom: string, dateTo: string): Promise<{
    closedRetestBugs: number;
    sentToReworkRetestBugs: number;
    totalNewBugs: number;
    totalTestedTasks: number;
    totalNewTasks: number;
    totalOtherTaskMinutes: number;
  }> {
    const rows = await this.prisma.$queryRaw<
      Array<{
        closedRetestBugs: bigint | number | null;
        sentToReworkRetestBugs: bigint | number | null;
        totalNewBugs: bigint | number | null;
        totalTestedTasks: bigint | number | null;
        totalNewTasks: bigint | number | null;
        totalOtherTaskMinutes: bigint | number | null;
      }>
    >(Prisma.sql`
      WITH scoped_reports AS (
        SELECT id
        FROM qa_weekly_reports
        WHERE week_start >= ${dateFrom}::date
          AND week_start <= ${dateTo}::date
      ),
      bug_totals AS (
        SELECT
          COUNT(CASE
            WHEN bug.bucket_code = 'retest'
             AND bug.result_code IN ('resolved', 'fixed_confirmed', 'fixed-confirmed')
            THEN 1
          END) AS "closedRetestBugs",
          COUNT(CASE
            WHEN bug.bucket_code = 'retest'
             AND bug.result_code IN ('rework', 'sent_to_rework', 'sent-to-rework')
            THEN 1
          END) AS "sentToReworkRetestBugs",
          COUNT(CASE WHEN bug.bucket_code = 'new_bug' THEN 1 END) AS "totalNewBugs",
          COUNT(CASE WHEN bug.bucket_code = 'tested_task' THEN 1 END) AS "totalTestedTasks",
          COUNT(CASE WHEN bug.bucket_code = 'new_task' THEN 1 END) AS "totalNewTasks"
        FROM qa_weekly_bug_items bug
        INNER JOIN scoped_reports report ON report.id = bug.report_id
      ),
      other_task_totals AS (
        SELECT COALESCE(SUM(other_task.duration_minutes), 0) AS "totalOtherTaskMinutes"
        FROM qa_weekly_other_task_items other_task
        INNER JOIN scoped_reports report ON report.id = other_task.report_id
      )
      SELECT
        COALESCE((SELECT "closedRetestBugs" FROM bug_totals), 0) AS "closedRetestBugs",
        COALESCE((SELECT "sentToReworkRetestBugs" FROM bug_totals), 0) AS "sentToReworkRetestBugs",
        COALESCE((SELECT "totalNewBugs" FROM bug_totals), 0) AS "totalNewBugs",
        COALESCE((SELECT "totalTestedTasks" FROM bug_totals), 0) AS "totalTestedTasks",
        COALESCE((SELECT "totalNewTasks" FROM bug_totals), 0) AS "totalNewTasks",
        COALESCE((SELECT "totalOtherTaskMinutes" FROM other_task_totals), 0) AS "totalOtherTaskMinutes"
    `);

    const row = rows[0] ?? {
      closedRetestBugs: 0,
      sentToReworkRetestBugs: 0,
      totalNewBugs: 0,
      totalTestedTasks: 0,
      totalNewTasks: 0,
      totalOtherTaskMinutes: 0,
    };

    return {
      closedRetestBugs: Number(row.closedRetestBugs ?? 0),
      sentToReworkRetestBugs: Number(row.sentToReworkRetestBugs ?? 0),
      totalNewBugs: Number(row.totalNewBugs ?? 0),
      totalTestedTasks: Number(row.totalTestedTasks ?? 0),
      totalNewTasks: Number(row.totalNewTasks ?? 0),
      totalOtherTaskMinutes: Number(row.totalOtherTaskMinutes ?? 0),
    };
  }

  async listQaWeeklyBugItemsByBucket(
    dateFrom: string,
    dateTo: string,
    bucketCode: 'retest' | 'new_bug' | 'tested_task' | 'new_task',
  ): Promise<
    Array<{
      weekStart: string;
      userId: string;
      userFullName: string;
      projectName: string;
      title: string;
      externalUrl: string | null;
      severityCode: string | null;
      resultCode: string | null;
    }>
  > {
    const rows = await this.prisma.$queryRaw<
      Array<{
        weekStart: string;
        userId: string;
        userFullName: string;
        projectName: string;
        title: string;
        externalUrl: string | null;
        severityCode: string | null;
        resultCode: string | null;
      }>
    >(Prisma.sql`
      SELECT
        TO_CHAR(report.week_start, 'YYYY-MM-DD') AS "weekStart",
        report.user_id AS "userId",
        user_account.full_name AS "userFullName",
        bug.project_name AS "projectName",
        bug.title AS "title",
        bug.external_url AS "externalUrl",
        bug.severity_code AS "severityCode",
        bug.result_code AS "resultCode"
      FROM qa_weekly_reports report
      INNER JOIN users user_account ON user_account.id = report.user_id
      INNER JOIN qa_weekly_bug_items bug ON bug.report_id = report.id
      WHERE report.week_start >= ${dateFrom}::date
        AND report.week_start <= ${dateTo}::date
        AND bug.bucket_code = ${bucketCode}
      ORDER BY report.week_start DESC, user_account.full_name ASC, bug.sort_order ASC, bug.created_at ASC
    `);

    return rows;
  }

  async listQaWeeklyOtherTaskItems(
    dateFrom: string,
    dateTo: string,
  ): Promise<
    Array<{
      weekStart: string;
      userId: string;
      userFullName: string;
      taskName: string;
      description: string | null;
      durationMinutes: number;
    }>
  > {
    const rows = await this.prisma.$queryRaw<
      Array<{
        weekStart: string;
        userId: string;
        userFullName: string;
        taskName: string;
        description: string | null;
        durationMinutes: bigint | number;
      }>
    >(Prisma.sql`
      SELECT
        TO_CHAR(report.week_start, 'YYYY-MM-DD') AS "weekStart",
        report.user_id AS "userId",
        user_account.full_name AS "userFullName",
        other_task.task_name AS "taskName",
        other_task.description AS "description",
        other_task.duration_minutes AS "durationMinutes"
      FROM qa_weekly_reports report
      INNER JOIN users user_account ON user_account.id = report.user_id
      INNER JOIN qa_weekly_other_task_items other_task ON other_task.report_id = report.id
      WHERE report.week_start >= ${dateFrom}::date
        AND report.week_start <= ${dateTo}::date
      ORDER BY report.week_start DESC, user_account.full_name ASC, other_task.sort_order ASC, other_task.created_at ASC
    `);

    return rows.map((row) => ({
      ...row,
      durationMinutes: Number(row.durationMinutes),
    }));
  }

  async aggregateSupportWeeklyTotals(dateFrom: string, dateTo: string): Promise<{
    totalProjects: number;
    inProgressProjects: number;
    inReviewProjects: number;
    completedProjects: number;
    cancelledProjects: number;
    totalOtherTasks: number;
  }> {
    const rows = await this.prisma.$queryRaw<
      Array<{
        totalProjects: bigint | number | null;
        inProgressProjects: bigint | number | null;
        inReviewProjects: bigint | number | null;
        completedProjects: bigint | number | null;
        cancelledProjects: bigint | number | null;
        totalOtherTasks: bigint | number | null;
      }>
    >(Prisma.sql`
      WITH scoped_reports AS (
        SELECT id
        FROM support_weekly_reports
        WHERE week_start >= ${dateFrom}::date
          AND week_start <= ${dateTo}::date
      ),
      project_totals AS (
        SELECT
          COUNT(*) AS "totalProjects",
          COUNT(CASE WHEN project.status_code = 'in_progress' THEN 1 END) AS "inProgressProjects",
          COUNT(CASE WHEN project.status_code = 'in_review' THEN 1 END) AS "inReviewProjects",
          COUNT(CASE WHEN project.status_code = 'completed' THEN 1 END) AS "completedProjects",
          COUNT(CASE WHEN project.status_code = 'cancelled' THEN 1 END) AS "cancelledProjects"
        FROM support_weekly_project_items project
        INNER JOIN scoped_reports report ON report.id = project.report_id
      ),
      other_task_totals AS (
        SELECT COUNT(*) AS "totalOtherTasks"
        FROM support_weekly_other_task_items other_task
        INNER JOIN scoped_reports report ON report.id = other_task.report_id
      )
      SELECT
        COALESCE((SELECT "totalProjects" FROM project_totals), 0) AS "totalProjects",
        COALESCE((SELECT "inProgressProjects" FROM project_totals), 0) AS "inProgressProjects",
        COALESCE((SELECT "inReviewProjects" FROM project_totals), 0) AS "inReviewProjects",
        COALESCE((SELECT "completedProjects" FROM project_totals), 0) AS "completedProjects",
        COALESCE((SELECT "cancelledProjects" FROM project_totals), 0) AS "cancelledProjects",
        COALESCE((SELECT "totalOtherTasks" FROM other_task_totals), 0) AS "totalOtherTasks"
    `);

    const row = rows[0] ?? {
      totalProjects: 0,
      inProgressProjects: 0,
      inReviewProjects: 0,
      completedProjects: 0,
      cancelledProjects: 0,
      totalOtherTasks: 0,
    };

    return {
      totalProjects: Number(row.totalProjects ?? 0),
      inProgressProjects: Number(row.inProgressProjects ?? 0),
      inReviewProjects: Number(row.inReviewProjects ?? 0),
      completedProjects: Number(row.completedProjects ?? 0),
      cancelledProjects: Number(row.cancelledProjects ?? 0),
      totalOtherTasks: Number(row.totalOtherTasks ?? 0),
    };
  }

  async listSupportWeeklyProjectItems(
    dateFrom: string,
    dateTo: string,
  ): Promise<
    Array<{
      weekStart: string;
      userId: string;
      userFullName: string;
      projectName: string;
      customerName: string;
      description: string | null;
      statusCode: string;
    }>
  > {
    return this.prisma.$queryRaw<
      Array<{
        weekStart: string;
        userId: string;
        userFullName: string;
        projectName: string;
        customerName: string;
        description: string | null;
        statusCode: string;
      }>
    >(Prisma.sql`
      SELECT
        TO_CHAR(report.week_start, 'YYYY-MM-DD') AS "weekStart",
        report.user_id AS "userId",
        user_account.full_name AS "userFullName",
        project.project_name AS "projectName",
        project.customer_name AS "customerName",
        project.description AS "description",
        project.status_code AS "statusCode"
      FROM support_weekly_reports report
      INNER JOIN users user_account ON user_account.id = report.user_id
      INNER JOIN support_weekly_project_items project ON project.report_id = report.id
      WHERE report.week_start >= ${dateFrom}::date
        AND report.week_start <= ${dateTo}::date
      ORDER BY report.week_start DESC, user_account.full_name ASC, project.sort_order ASC, project.created_at ASC
    `);
  }

  async listSupportWeeklyOtherTaskItems(
    dateFrom: string,
    dateTo: string,
  ): Promise<
    Array<{
      weekStart: string;
      userId: string;
      userFullName: string;
      taskName: string;
      description: string | null;
    }>
  > {
    return this.prisma.$queryRaw<
      Array<{
        weekStart: string;
        userId: string;
        userFullName: string;
        taskName: string;
        description: string | null;
      }>
    >(Prisma.sql`
      SELECT
        TO_CHAR(report.week_start, 'YYYY-MM-DD') AS "weekStart",
        report.user_id AS "userId",
        user_account.full_name AS "userFullName",
        other_task.task_name AS "taskName",
        other_task.description AS "description"
      FROM support_weekly_reports report
      INNER JOIN users user_account ON user_account.id = report.user_id
      INNER JOIN support_weekly_other_task_items other_task ON other_task.report_id = report.id
      WHERE report.week_start >= ${dateFrom}::date
        AND report.week_start <= ${dateTo}::date
      ORDER BY report.week_start DESC, user_account.full_name ASC, other_task.sort_order ASC, other_task.created_at ASC
    `);
  }

  async listSupportWeeklyCategoryItems(
    dateFrom: string,
    dateTo: string,
  ): Promise<
    Array<{
      weekStart: string;
      userId: string;
      userFullName: string;
      categoryName: string;
      comment: string | null;
      durationMinutes: number;
    }>
  > {
    const rows = await this.prisma.$queryRaw<
      Array<{
        weekStart: string;
        userId: string;
        userFullName: string;
        categoryName: string;
        comment: string | null;
        durationMinutes: bigint | number;
      }>
    >(Prisma.sql`
      SELECT
        TO_CHAR(report.week_start, 'YYYY-MM-DD') AS "weekStart",
        report.user_id AS "userId",
        user_account.full_name AS "userFullName",
        category_item.category_name AS "categoryName",
        category_item.comment AS "comment",
        category_item.duration_minutes AS "durationMinutes"
      FROM support_weekly_reports report
      INNER JOIN users user_account ON user_account.id = report.user_id
      INNER JOIN support_weekly_category_items category_item ON category_item.report_id = report.id
      WHERE report.week_start >= ${dateFrom}::date
        AND report.week_start <= ${dateTo}::date
      ORDER BY report.week_start DESC, user_account.full_name ASC, category_item.sort_order ASC, category_item.created_at ASC
    `);

    return rows.map((row) => ({
      ...row,
      durationMinutes: Number(row.durationMinutes),
    }));
  }

  async groupSupportWeeklyCategoryMinutes(
    dateFrom: string,
    dateTo: string,
  ): Promise<Array<{ categoryName: string; durationMinutes: number }>> {
    const rows = await this.prisma.$queryRaw<
      Array<{
        categoryName: string;
        durationMinutes: bigint | number;
      }>
    >(Prisma.sql`
      SELECT
        category_item.category_name AS "categoryName",
        SUM(category_item.duration_minutes) AS "durationMinutes"
      FROM support_weekly_reports report
      INNER JOIN support_weekly_category_items category_item ON category_item.report_id = report.id
      WHERE report.week_start >= ${dateFrom}::date
        AND report.week_start <= ${dateTo}::date
      GROUP BY category_item.category_name
      ORDER BY SUM(category_item.duration_minutes) DESC, category_item.category_name ASC
    `);

    return rows.map((row) => ({
      categoryName: row.categoryName,
      durationMinutes: Number(row.durationMinutes),
    }));
  }

  aggregateTotals(): Promise<DurationAggregate> {
    return this.prisma.activityRecord.aggregate({
      _sum: {
        durationMinutes: true,
      },
      _count: {
        _all: true,
      },
    });
  }

  async groupHoursByUser(): Promise<
    Array<{
      userId: string;
      _sum: { durationMinutes: number | null };
      user: { email: string; fullName: string };
    }>
  > {
    const groups = await this.prisma.activityRecord.groupBy({
      by: ['userId'],
      _sum: {
        durationMinutes: true,
      },
      orderBy: {
        _sum: {
          durationMinutes: 'desc',
        },
      },
    });

    const users = await this.prisma.user.findMany({
      where: {
        id: { in: groups.map((group) => group.userId) },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    const usersById = new Map(users.map((user) => [user.id, user]));

    return groups
      .map((group) => {
        const user = usersById.get(group.userId);

        if (!user) {
          return null;
        }

        return {
          userId: group.userId,
          _sum: group._sum,
          user,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  async groupHoursByActivityType(): Promise<
    Array<{
      activityTypeId: string;
      _sum: { durationMinutes: number | null };
      activityType: { code: string; name: string };
    }>
  > {
    const groups = await this.prisma.activityRecord.groupBy({
      by: ['activityTypeId'],
      _sum: {
        durationMinutes: true,
      },
      orderBy: {
        _sum: {
          durationMinutes: 'desc',
        },
      },
    });

    const activityTypes = await this.prisma.activityType.findMany({
      where: {
        id: { in: groups.map((group) => group.activityTypeId) },
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });

    const activityTypesById = new Map(activityTypes.map((item) => [item.id, item]));

    return groups
      .map((group) => {
        const activityType = activityTypesById.get(group.activityTypeId);

        if (!activityType) {
          return null;
        }

        return {
          activityTypeId: group.activityTypeId,
          _sum: group._sum,
          activityType,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }
}
