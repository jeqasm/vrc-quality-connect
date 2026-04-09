# Entities

Базовые сущности каркаса:

- `User`
- `Department`
- `ActivityType`
- `ActivityResult`
- `ActivityRecord`
- `LicenseType`
- `LicenseOperation`
- `SupportRequestType`
- `SupportRequest`

`ActivityRecord` хранит первичные операционные данные и допускает явные связи с `LicenseOperation` и `SupportRequest`.
