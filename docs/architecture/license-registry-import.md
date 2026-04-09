# License Registry Import

## Purpose

Подсистема нужна для импорта временного внешнего реестра лицензий из Google Sheets в управляемое внутреннее хранилище, чтобы отчеты и экран лицензий строились не напрямую из внешнего файла, а из данных приложения.

## Location

- Backend:
  - `src/modules/licenses/controllers/licenses-registry.controller.ts`
  - `src/modules/licenses/services/refresh-license-registry.service.ts`
  - `src/modules/licenses/repositories/license-registry.repository.ts`
  - `src/modules/licenses/infrastructure/*`
- Database:
  - `license_registry_import_batches`
  - `license_registry_entries`

## Integration Model

- Google Sheets остается внешним источником данных.
- Backend по кнопке `Обновить` загружает полный CSV-снэпшот реестра.
- Валидные строки сохраняются как атомарные записи в `license_registry_entries`.
- Активный импорт помечается через `license_registry_import_batches`.
- Экран лицензий и последующие отчеты читают уже сохраненные записи из БД.

## Why This Shape

- Отчеты не зависят от доступности Google Sheets в момент чтения.
- Сохраняются атомарные операционные данные, а не только агрегат UI.
- Агрегация по периоду и типу лицензии остается воспроизводимой и расширяемой.
