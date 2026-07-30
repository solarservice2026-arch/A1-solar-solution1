alter table public.agreements
  alter column payment_amount set default 1;

update public.agreements
set payment_amount = 1
where payment_status <> 'Paid';

update public.agreement_payment_requests
set amount = 1
where status not in ('Verified');
