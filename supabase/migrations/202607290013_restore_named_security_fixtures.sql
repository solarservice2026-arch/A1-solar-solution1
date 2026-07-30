update public.profiles
set active = false,
    updated_at = now()
where lower(full_name) like '%disabled%';

delete from public.user_roles ur
using public.profiles p
where ur.user_id = p.id
  and (
    lower(p.full_name) like '%disabled%'
    or lower(p.full_name) like '%no role%'
  );
