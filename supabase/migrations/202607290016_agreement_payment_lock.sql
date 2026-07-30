alter table public.agreements
  add column if not exists payment_status text not null default 'Unpaid',
  add column if not exists payment_amount numeric(14,2) not null default 100,
  add column if not exists paid_at timestamptz;

create table if not exists public.agreement_payment_requests (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null unique references public.agreements(id) on delete cascade,
  customer_id uuid not null references public.customers(id),
  amount numeric(14,2) not null check(amount > 0),
  method text not null,
  transaction_reference text not null,
  status text not null default 'Pending',
  submitted_at timestamptz not null default now(),
  verified_by uuid references public.profiles(id),
  verified_at timestamptz
);

alter table public.agreement_payment_requests enable row level security;

create policy agreement_payment_customer_read
on public.agreement_payment_requests for select to authenticated
using (
  exists (
    select 1 from public.customers c
    where c.id = customer_id and c.profile_id = auth.uid()
  )
  or public.has_permission('payments:view')
);

create policy agreement_payment_customer_submit
on public.agreement_payment_requests for insert to authenticated
with check (
  exists (
    select 1 from public.customers c
    where c.id = customer_id and c.profile_id = auth.uid()
  )
  and public.has_permission('payments:create')
);
