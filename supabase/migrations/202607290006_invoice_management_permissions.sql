insert into public.permissions(key,description) values
  ('invoices:update','Update invoices'),
  ('invoices:delete','Delete invoices')
on conflict(key) do update set description=excluded.description;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p
where r.name='super_admin' and p.key in ('invoices:update','invoices:delete')
on conflict do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p
where r.name='admin' and p.key in ('invoices:update','invoices:delete')
on conflict do nothing;
