insert into public.permissions(key,description) values
  ('customers:delete','Delete customers'),
  ('quotations:delete','Delete quotations')
on conflict(key) do update set description=excluded.description;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p
where r.name in ('super_admin','admin')
  and p.key in ('customers:delete','quotations:delete')
on conflict do nothing;
