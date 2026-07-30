delete from public.role_permissions rp
using public.roles r, public.permissions p
where rp.role_id = r.id
  and rp.permission_id = p.id
  and r.name = 'customer'
  and p.key = 'agreements:create';

insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key = 'agreements:view'
where r.name = 'customer'
on conflict do nothing;
