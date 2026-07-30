update public.profiles p
set active = true,
    updated_at = now()
from auth.users u
where p.id = u.id
  and u.raw_user_meta_data ->> 'e2e_test_user' = 'true'
  and u.raw_user_meta_data ->> 'full_name' = 'E2E MANAGER';
