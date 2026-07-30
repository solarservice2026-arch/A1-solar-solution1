update public.profiles p
set active = false,
    updated_at = now()
from auth.users u
where p.id = u.id
  and u.raw_user_meta_data ->> 'e2e_test_user' = 'true'
  and u.raw_user_meta_data ->> 'full_name' = 'E2E DISABLED';

delete from public.user_roles ur
using auth.users u
where ur.user_id = u.id
  and u.raw_user_meta_data ->> 'e2e_test_user' = 'true'
  and u.raw_user_meta_data ->> 'full_name' in ('E2E DISABLED', 'E2E NO_ROLE');
