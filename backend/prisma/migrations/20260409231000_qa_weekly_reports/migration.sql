CREATE TABLE "qa_weekly_reports" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "week_start" DATE NOT NULL,
    "week_end" DATE NOT NULL,
    "status" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qa_weekly_reports_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "qa_weekly_bug_items" (
    "id" UUID NOT NULL,
    "report_id" UUID NOT NULL,
    "bucket_code" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "external_url" TEXT,
    "severity_code" TEXT,
    "result_code" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qa_weekly_bug_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "qa_weekly_other_task_items" (
    "id" UUID NOT NULL,
    "report_id" UUID NOT NULL,
    "task_name" TEXT NOT NULL,
    "description" TEXT,
    "duration_minutes" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qa_weekly_other_task_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "qa_weekly_reports_user_id_week_start_key" ON "qa_weekly_reports"("user_id", "week_start");
CREATE INDEX "qa_weekly_reports_department_id_week_start_idx" ON "qa_weekly_reports"("department_id", "week_start");
CREATE INDEX "qa_weekly_reports_status_week_start_idx" ON "qa_weekly_reports"("status", "week_start");
CREATE INDEX "qa_weekly_bug_items_report_id_bucket_code_sort_order_idx" ON "qa_weekly_bug_items"("report_id", "bucket_code", "sort_order");
CREATE INDEX "qa_weekly_other_task_items_report_id_sort_order_idx" ON "qa_weekly_other_task_items"("report_id", "sort_order");

ALTER TABLE "qa_weekly_reports" ADD CONSTRAINT "qa_weekly_reports_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "qa_weekly_reports" ADD CONSTRAINT "qa_weekly_reports_department_id_fkey"
    FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "qa_weekly_bug_items" ADD CONSTRAINT "qa_weekly_bug_items_report_id_fkey"
    FOREIGN KEY ("report_id") REFERENCES "qa_weekly_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "qa_weekly_other_task_items" ADD CONSTRAINT "qa_weekly_other_task_items_report_id_fkey"
    FOREIGN KEY ("report_id") REFERENCES "qa_weekly_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
