alter table public.invoices
  add column if not exists invoice_type text,
  add column if not exists title text;
