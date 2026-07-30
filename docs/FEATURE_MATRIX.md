# Feature matrix

| Reference feature | Reference route | New module | Tables | API | Role | Implementation | Testing |
|---|---|---|---|---|---|---|---|
| Login | Unverified | Auth | profiles, user_roles | /auth | All | Scaffolded | Unit |
| Dashboard | Unverified | Dashboard | domain tables | /dashboard | Staff/Customer | Scaffolded | Unit |
| Admin management | Unverified | Staff/RBAC | profiles, roles, permissions | /users, /roles | Super Admin | Schema | RLS planned |
| Customers | Unverified | CRM | customers, addresses | /customers | Permitted staff | Scaffolded | Unit |
| Products | Unverified | Inventory | products, inventory_transactions | /products, /inventory | Admin | Schema | Planned |
| Quotations/PDF | Unverified | Sales | quotations, quotation_items | /quotations | Admin/Customer owner | Schema | Calculation planned |
| Invoices/PDF | Unverified | Finance | invoices, invoice_items | /invoices | Admin/Customer owner | Schema | Planned |
| Profile | Unverified | Account | profiles | /auth/me | Authenticated | Scaffolded | Planned |

Status reflects repository implementation, not inaccessible legacy behavior.
