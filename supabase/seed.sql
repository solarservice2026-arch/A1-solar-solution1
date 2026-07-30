do $seed$
begin
  insert into public.roles(name,description) values
  ('super_admin','Complete platform access'),('admin','Operational administration'),('manager','Branch or team management'),
  ('sales_executive','Assigned CRM work'),('installation_staff','Assigned installations'),('service_technician','Assigned service work'),
  ('accountant','Finance operations'),('customer','Own customer records') on conflict(name) do update set description=excluded.description;

  insert into public.branches(name,code) values ('Demo Branch','DEMO') on conflict(code) do nothing;
  insert into public.products(sku,name,category,brand,unit,selling_price,tax_rate,minimum_stock) values
  ('DEMO-PANEL-550','Demo 550 W Mono Panel','Solar panels','Fictional SunWorks','piece',14500,12,10),
  ('DEMO-INV-5K','Demo 5 kW Inverter','Inverters','Fictional GridFlow','piece',62000,18,2)
  on conflict(sku) do nothing;

  insert into public.role_permissions(role_id,permission_id)
  select r.id,p.id from public.roles r cross join public.permissions p where r.name='super_admin' on conflict do nothing;
  insert into public.role_permissions(role_id,permission_id)
  select r.id,p.id from public.roles r join public.permissions p on p.key not in
  ('users:assign_roles','roles:create','roles:update','roles:assign_permissions','audit_logs:view')
  where r.name='admin' on conflict do nothing;
  insert into public.role_permissions(role_id,permission_id)
  select r.id,p.id from public.roles r join public.permissions p on p.key in
  ('dashboard:view','leads:view','leads:create','leads:update','leads:assign','leads:convert','leads:export','customers:view','customers:create','customers:update','quotations:view','quotations:create','quotations:update','quotations:approve','projects:view','projects:update','projects:assign','reports:view')
  where r.name='manager' on conflict do nothing;
  insert into public.role_permissions(role_id,permission_id)
  select r.id,p.id from public.roles r join public.permissions p on p.key in
  ('dashboard:view','leads:view','leads:create','leads:update','customers:view','quotations:view','quotations:create','quotations:update')
  where r.name='sales_executive' on conflict do nothing;
  insert into public.role_permissions(role_id,permission_id)
  select r.id,p.id from public.roles r join public.permissions p on p.key in
  ('dashboard:view','projects:view','projects:update','projects:change_stage','documents:view','documents:upload')
  where r.name='installation_staff' on conflict do nothing;
  insert into public.role_permissions(role_id,permission_id)
  select r.id,p.id from public.roles r join public.permissions p on p.key in
  ('dashboard:view','tickets:view','tickets:update','tickets:close','documents:view','documents:upload')
  where r.name='service_technician' on conflict do nothing;
  insert into public.role_permissions(role_id,permission_id)
  select r.id,p.id from public.roles r join public.permissions p on p.key in
  ('dashboard:view','customers:view','invoices:view','invoices:create','invoices:issue','invoices:cancel','payments:view','payments:create','payments:reverse','expenses:view','expenses:create','reports:view','reports:export')
  where r.name='accountant' on conflict do nothing;
  insert into public.role_permissions(role_id,permission_id)
  select r.id,p.id from public.roles r join public.permissions p on p.key in
  ('dashboard:view','quotations:view','projects:view','invoices:view','payments:view','tickets:view','tickets:create','documents:view','documents:upload')
  where r.name='customer' on conflict do nothing;
end
$seed$;
