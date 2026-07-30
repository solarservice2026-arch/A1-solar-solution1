# API reference

All endpoints use `/api/v1`. Protected requests require
`Authorization: Bearer <Supabase access token>`.

| Method | Route | Authorization | Purpose |
|---|---|---|---|
| GET | `/health` | Public | Service health |
| GET | `/public/settings` | Public | Safe website settings |
| POST | `/public/enquiries` | Public/rate limited | Submit enquiry |
| GET | `/auth/me` | Authenticated and active | Profile, roles, permissions |
| GET | `/users` | `users:view` | Paginated staff list |
| POST | `/users` | `users:create` | Invite staff and assign role |
| PATCH | `/users/:id/status` | `users:disable` | Activate/disable non-Super-Admin |

Responses follow the documented `success/message/data/meta` envelope. Permission
keys use `module:action`, matching the original database constraint.
