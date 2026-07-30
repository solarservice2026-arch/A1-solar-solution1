# Page inventory

| Area | Pages | Access | Audit status |
|---|---|---|---|
| Reference | Login, dashboards, admins, customers, products, quotations, invoices, profile, settings | Super Admin/Admin/Customer | Screenshot verified; routes/fields unverified |
| Public | Home, About, Solutions, Products, Services, Process, Subsidy, Finance, Projects, Gallery, Testimonials, FAQ, Calculator, Survey, Quote, Contact, Legal, Login | Public | Specification |
| Operations | Dashboard, leads, customers, surveys, inventory, suppliers, purchases, quotations, projects, tasks, invoices, payments, expenses, tickets, documents, reports | Permission based | Specification |
| Administration | Staff, roles, branches, settings, audit log | Admin/Super Admin | Specification |
| Customer | Overview, quotations, projects, invoices, documents, tickets, profile | Own records only | Specification |

All protected pages require both frontend route guards and server authorization.
