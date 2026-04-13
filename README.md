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
- `auth`
- `access-control`
- `groups`
- `integrations`

На текущем этапе репозиторий зафиксирован как архитектурный scaffold. Полная бизнес-логика намеренно не реализуется до стабилизации структуры модулей и модели данных.

## Запуск

### Backend

1. Скопировать `backend/.env.example` в `backend/.env`
2. Поднять изолированную БД проекта: `npm run db:up`
3. Проверить подключение: `npm run db:check`
4. Установить зависимости: `npm install`
5. Сгенерировать Prisma client: `npm run prisma:generate`
6. Применить миграции: `npm run prisma:migrate:deploy`
7. Заполнить справочники: `npm run prisma:seed`
8. Запустить dev server: `npm run start:dev`

`backend/.env` по умолчанию использует `localhost:55432`, чтобы не конфликтовать с другими проектами на `5432`.

Полезные команды:
- `npm run db:up` - запустить PostgreSQL контейнер этого проекта
- `npm run db:down` - остановить PostgreSQL контейнер этого проекта
- `npm run db:logs` - смотреть логи PostgreSQL
- `npm run db:check` - проверить, к какому host/port/db подключается backend
- `npm run db:backup` - сделать backup в `backups/`

### Frontend

1. Скопировать `frontend/.env.example` в `frontend/.env`
2. Установить зависимости: `npm install`
3. Запустить dev server: `npm run dev`

## Документация

- `docs/architecture/overview.md`
- `docs/architecture/backend-structure.md`
- `docs/architecture/frontend-structure.md`
- `docs/architecture/access-control.md`
- `docs/architecture/modules.md`
- `docs/architecture/license-registry-import.md`
- `docs/product/*`

## Базовые сущности каркаса

- `User`
- `AuthAccount`
- `RegistrationInvite`
- `AccessRole`
- `AccessPermission`
- `Group`
- `Department`
- `ActivityType`
- `ActivityResult`
- `ActivityRecord`
- `LicenseType`
- `LicenseOperation`
- `SupportRequestType`
- `SupportRequest`

## Текущие интеграции MVP

- Модуль `licenses` теперь ведет внутренний реестр выдачи лицензий через CRUD API и UI-таблицу без обязательного Excel / Google Sheets runtime-источника
- Отчеты по лицензиям строятся напрямую из `license_registry_records`
- Подсистема доступа заложена через `auth`, `access-control` и `groups`: backend считает effective permissions, frontend скрывает страницы и вкладки по ответу `GET /auth/me`
- Регистрация новых аккаунтов выполняется только по invite-ссылке, которую создает администратор в `Настройки -> Администрирование -> Пользователи`
