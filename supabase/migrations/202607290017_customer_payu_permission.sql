insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in ('payments:view', 'payments:create')
where r.name = 'customer'
on conflict do nothing;
