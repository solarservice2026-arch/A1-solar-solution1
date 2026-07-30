alter table public.profiles
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references public.profiles(id);

insert into public.permissions(key,description) values
  ('admins:view','View administrator accounts'),
  ('admins:create','Create administrator accounts'),
  ('admins:update','Update administrator accounts'),
  ('admins:suspend','Suspend administrator accounts'),
  ('admins:remove','Archive administrator accounts'),
  ('users:suspend','Suspend operational user accounts'),
  ('users:remove','Archive operational user accounts'),
  ('users:assign_role','Assign an allowed operational role'),
  ('agreements:view','View agreements'),
  ('agreements:create','Create agreement drafts'),
  ('agreements:finalize','Finalize immutable agreements'),
  ('agreements:delete','Delete agreement drafts')
on conflict(key) do update set description=excluded.description;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p
where r.name='super_admin' on conflict do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.key in
  ('users:view','users:create','users:update','users:disable','users:suspend',
   'users:remove','users:assign_roles','users:assign_role',
   'agreements:view','agreements:create','agreements:finalize','agreements:delete')
where r.name='admin' on conflict do nothing;

create table if not exists public.agreement_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  scheme_name text,
  version integer not null check(version > 0),
  body jsonb not null,
  active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(name,version)
);

create table if not exists public.agreements (
  id uuid primary key default gen_random_uuid(),
  agreement_number text unique not null,
  customer_id uuid not null references public.customers(id),
  quotation_id uuid references public.quotations(id),
  template_id uuid not null references public.agreement_templates(id),
  status text not null default 'Draft' check(status in ('Draft','Finalized','Superseded','Cancelled')),
  merged_data jsonb not null default '{}'::jsonb,
  document_storage_path text,
  document_sha256 text,
  customer_signature_path text,
  vendor_signature_path text,
  finalized_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (status='Draft' and finalized_at is null) or
    (status<>'Draft' and finalized_at is not null)
  )
);

alter table public.quotations
  add column if not exists finalized_snapshot jsonb,
  add column if not exists finalized_at timestamptz,
  add column if not exists document_storage_path text,
  add column if not exists document_sha256 text;

create index if not exists agreements_customer_idx on public.agreements(customer_id);
create index if not exists agreements_quotation_idx on public.agreements(quotation_id);
create index if not exists profiles_archived_idx on public.profiles(archived_at) where archived_at is not null;

alter table public.agreement_templates enable row level security;
alter table public.agreements enable row level security;

create policy agreement_template_staff_read on public.agreement_templates
for select to authenticated using(public.has_permission('agreements:view'));

create policy agreement_authorized_read on public.agreements
for select to authenticated using(
  public.has_permission('agreements:view')
  or exists(
    select 1 from public.customers c
    where c.id=agreements.customer_id and c.profile_id=auth.uid()
  )
);

create policy agreement_authorized_create on public.agreements
for insert to authenticated with check(
  public.has_permission('agreements:create') and created_by=auth.uid()
);

create policy agreement_draft_update on public.agreements
for update to authenticated using(
  status='Draft' and public.has_permission('agreements:create')
) with check(public.has_permission('agreements:create'));

create trigger agreements_touch before update on public.agreements
for each row execute function public.touch_updated_at();
