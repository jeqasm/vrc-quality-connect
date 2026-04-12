# Access Control Foundation

## Зачем

Подсистема нужна для перехода от single-user scaffold к многоаккаунтному режиму, где:

- аккаунт создается через invite-ссылку и email
- права выдаются не только через системную роль, но и через группы
- видимость страниц и вкладок определяется единой permission matrix
- backend и frontend используют один и тот же источник прав

## Где находится

Backend:

- `backend/src/modules/auth`
- `backend/src/modules/access-control`
- `backend/src/modules/groups`

Frontend:

- `frontend/src/modules/auth`
- `frontend/src/modules/access`

Модель данных:

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/20260410110000_access_control_foundation`

## Основные сущности

- `AuthAccount` — учетная запись входа по email/password
- `AuthSession` — серверная bearer-session
- `RegistrationInvite` — инвайт с зафиксированными ролью и отделом для регистрации нового аккаунта
- `AccessRole` — системная роль (`administrator`, `manager`, `employee`)
- `AccessPermission` — атомарное право
- `AccessRolePermission` — базовые права роли
- `Group` — организационная группа / отдел
- `GroupMembership` — членство сотрудника в группе
- `GroupPermissionAssignment` — дополнительные права группы

## Как считается доступ

Итоговые права пользователя:

`effective permissions = role permissions + permissions всех групп`

На первом этапе не вводятся пользовательские overrides и explicit deny rules.
Это оставляет модель прозрачной и расширяемой.

## Границы ответственности

- `auth` отвечает за invite-регистрацию, login, session lookup и `me`
- `access-control` отвечает за вычисление effective permissions
- `groups` отвечает за состав групп и назначение прав группам
- operational-модули не должны вычислять права самостоятельно
- frontend не хранит свою матрицу отдельно, а опирается на ответ `GET /auth/me`

## Текущее API-ядро

- `GET /api/auth/registration-invites/:inviteToken`
- `POST /api/auth/register-by-invite`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/auth/registration-invites`
- `POST /api/auth/registration-invites`
- `GET /api/groups`
- `POST /api/groups`
- `POST /api/groups/:groupId/members`
- `POST /api/groups/:groupId/permissions`

## Следующие шаги

- подтверждение email поверх invite-flow
- административный UI управления пользователями, группами и permission matrix
- аудит инвайтов, изменений прав и состава групп
