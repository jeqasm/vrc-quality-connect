# License Registry

## Purpose

Подсистема нужна для ведения операционного реестра выдачи лицензий внутри приложения, чтобы экран лицензий и отчетность читали первичные записи напрямую из БД, без runtime-зависимости от Excel или Google Sheets.

## Location

- Backend:
  - `src/modules/licenses/controllers/licenses-registry.controller.ts`
  - `src/modules/licenses/services/license-registry-records.service.ts`
  - `src/modules/licenses/repositories/license-registry-records.repository.ts`
- Database:
  - `license_registry_records`
- Frontend:
  - `src/pages/licenses/ui/licenses-page.tsx`
  - `src/modules/licenses/ui/license-registry-table.tsx`
  - `src/modules/licenses/ui/license-registry-record-modal.tsx`

## Data Model

- Каждая выдача лицензии хранится как атомарная запись в `license_registry_records`.
- Запись ссылается на справочник `license_types`.
- Для аудита сохраняется `created_by_user_id`, а также `created_at` / `updated_at`.
- Отчеты по лицензиям строятся на основе `license_registry_records`, а не на основе импортных таблиц.

## Why This Shape

- Реестр становится полноценным операционным модулем, а не временным import-flow.
- UI может создавать, редактировать и удалять записи без промежуточного файла.
- Отчеты и статистика строятся из одного источника истины.
- Старые импортные таблицы могут использоваться только как источник одноразовой миграции истории и не участвуют в runtime-сценарии.
