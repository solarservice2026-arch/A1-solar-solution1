# API plan

All routes are under `/api/v1`. JSON responses use `{success,message,data,meta}`
and errors use `{success:false,message,code,errors}`. Supabase bearer tokens are
verified server-side; permission middleware is mandatory for protected modules.
List endpoints use bounded pagination and allow-listed filters/sorts.

Modules: auth, dashboard, users, roles, leads, customers, surveys, products,
inventory, suppliers, purchases, quotations, projects, tasks, invoices,
payments, expenses, tickets, documents, reports, notifications, settings,
and public enquiries.
