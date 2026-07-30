insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('private-documents','private-documents',false,10485760,array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create policy private_document_owner_insert on storage.objects
for insert to authenticated
with check(bucket_id='private-documents' and (storage.foldername(name))[1]=auth.uid()::text and public.has_permission('documents:upload'));
create policy private_document_owner_read on storage.objects
for select to authenticated
using(bucket_id='private-documents' and ((storage.foldername(name))[1]=auth.uid()::text or public.has_permission('documents:view')));
create policy private_document_owner_delete on storage.objects
for delete to authenticated
using(bucket_id='private-documents' and (storage.foldername(name))[1]=auth.uid()::text and public.has_permission('documents:delete'));

alter table public.products enable row level security;
alter table public.inventory_transactions enable row level security;
alter table public.lead_activities enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.quotation_items enable row level security;

create policy products_permission_read on public.products for select to authenticated using(public.has_permission('products:view'));
create policy inventory_permission_read on public.inventory_transactions for select to authenticated using(public.has_permission('inventory:view'));
create policy leads_permission_read on public.leads for select to authenticated using(public.has_permission('leads:view') and (assigned_to=auth.uid() or public.has_role('admin') or public.has_role('super_admin') or public.has_role('manager')));
create policy lead_activities_permission_read on public.lead_activities for select to authenticated using(exists(select 1 from leads where leads.id=lead_id and public.has_permission('leads:view')));
create policy addresses_customer_read on public.customer_addresses for select to authenticated using(exists(select 1 from customers where customers.id=customer_id and (customers.profile_id=auth.uid() or public.has_permission('customers:view'))));
create policy quotation_items_read on public.quotation_items for select to authenticated using(exists(select 1 from quotations where quotations.id=quotation_id));
