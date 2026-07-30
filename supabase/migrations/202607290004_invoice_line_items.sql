alter table public.invoices
  add column if not exists quotation_id uuid references public.quotations(id),
  add column if not exists subtotal numeric(14,2) not null default 0,
  add column if not exists tax numeric(14,2) not null default 0,
  add column if not exists installation_address text,
  add column if not exists notes text;

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  description text not null,
  brand text,
  quantity numeric(14,3) not null check(quantity > 0),
  unit_price numeric(14,2) not null check(unit_price >= 0),
  tax_rate numeric(5,2) not null default 0 check(tax_rate >= 0),
  line_amount numeric(14,2) not null check(line_amount >= 0)
);
create index if not exists invoice_items_invoice_idx on public.invoice_items(invoice_id);
