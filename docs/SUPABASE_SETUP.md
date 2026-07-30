# Supabase setup
Create a Supabase project, copy `.env.example` to `.env`, and populate URL/keys.
Only `VITE_SUPABASE_ANON_KEY` may reach the browser. Run `npm run db:migrate`.
Create the first Auth user in a protected setup operation, insert its profile,
then attach the `super_admin` role. Never seed a password in SQL.
