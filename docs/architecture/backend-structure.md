# Backend Structure

Верхний уровень `backend/src`:

- `core/`
- `config/`
- `prisma/`
- `common/`
- `modules/`

Все перечисленные доменные области созданы как модульный каркас:

- `users`
- `departments`
- `activity-types`
- `activity-results`
- `activity-records`
- `auth`
- `access-control`
- `groups`
- `reports`
- `licenses`
- `license-types`
- `support-requests`
- `support-request-types`
- `integrations`

Для `reports` допустим query-oriented service layer без искусственного repository.
Для `integrations` базовая структура строится через `adapters/`, `contracts/`, `providers/`.
