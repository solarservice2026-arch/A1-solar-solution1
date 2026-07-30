alter table public.quotations
  add column if not exists quotation_type text check(quotation_type is null or quotation_type in ('On-grid','Off-grid','Hybrid')),
  add column if not exists title text,
  add column if not exists installation_address text;

alter table public.quotation_items
  add column if not exists product_name text,
  add column if not exists brand text,
  add column if not exists line_amount numeric(14,2) not null default 0 check(line_amount >= 0);

create index if not exists quotation_items_quotation_idx on public.quotation_items(quotation_id);
