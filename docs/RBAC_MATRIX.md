# RBAC matrix

| Role | Module | View | Create | Update | Delete | Approve | Export | Restrictions |
|---|---|---:|---:|---:|---:|---:|---:|---|
| Super Admin | All | Yes | Yes | Yes | Policy based | Yes | Yes | Protected from ordinary Admin changes |
| Admin | Operations | Yes | Yes | Yes | Archive/cancel | Yes | Yes | Cannot grant protected roles by default |
| Manager | CRM/projects | Yes | Yes | Yes | No | Quotations | Limited | Branch/team scope required |
| Sales Executive | Assigned CRM | Yes | Yes | Yes | No | No | No | Assigned records |
| Installation Staff | Assigned projects | Yes | No | Stage/docs | No | No | No | No restricted finance |
| Service Technician | Assigned tickets | Yes | Ticket notes | Yes | No | No | No | Internal service scope |
| Accountant | Finance | Yes | Yes | Finance only | No | Expenses by grant | Yes | Cannot manage roles |
| Customer | Own records | Yes | Tickets/docs | Limited | No | Accept/decline only | Own docs | Strict own-customer isolation |

Granular permissions are seeded in migration `202607280002_auth_rbac.sql`.
