# VRC Quality Connect

Модульный монолит для учета активности, отчетности, лицензий, обращений и будущих интеграций.

## Стек

- Backend: NestJS, TypeScript, Prisma, PostgreSQL
- Frontend: React, TypeScript, Vite, React Query
- API: REST / JSON

## Структура репозитория

- `backend/`
- `frontend/`
- `docs/`

## Каркас модулей

- `users`
- `departments`
- `activity-types`
- `activity-results`
- `activity-records`
- `reports`
- `licenses`
- `license-types`
- `support-requests`
- `support-request-types`
- `integrations`

На текущем этапе репозиторий зафиксирован как архитектурный scaffold. Полная бизнес-логика намеренно не реализуется до стабилизации структуры модулей и модели данных.

## Запуск

### Backend

1. Скопировать `backend/.env.example` в `backend/.env`
2. Установить зависимости: `npm install`
3. Сгенерировать Prisma client: `npm run prisma:generate`
4. Применить миграции: `npm run prisma:migrate:deploy`
5. Заполнить справочники: `npm run prisma:seed`
6. Запустить dev server: `npm run start:dev`

### Frontend

1. Скопировать `frontend/.env.example` в `frontend/.env`
2. Установить зависимости: `npm install`
3. Запустить dev server: `npm run dev`

## Документация

- `docs/architecture/overview.md`
- `docs/architecture/backend-structure.md`
- `docs/architecture/frontend-structure.md`
- `docs/architecture/modules.md`
- `docs/product/*`

## Базовые сущности каркаса

- `User`
- `Department`
- `ActivityType`
- `ActivityResult`
- `ActivityRecord`
- `LicenseType`
- `LicenseOperation`
- `SupportRequestType`
- `SupportRequest`
