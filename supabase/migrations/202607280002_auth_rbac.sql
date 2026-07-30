alter table public.profiles add column if not exists last_login_at timestamptz;
alter table public.profiles add column if not exists email_verified boolean not null default false;

insert into public.permissions(key,description) values
('dashboard:view','View dashboard'),('users:view','View staff'),('users:create','Create staff'),('users:update','Update staff'),('users:disable','Disable staff'),('users:assign_roles','Assign staff roles'),
('roles:view','View roles'),('roles:create','Create roles'),('roles:update','Update roles'),('roles:assign_permissions','Assign permissions'),
('leads:view','View leads'),('leads:create','Create leads'),('leads:update','Update leads'),('leads:delete','Archive leads'),('leads:assign','Assign leads'),('leads:convert','Convert leads'),('leads:export','Export leads'),
('customers:view','View customers'),('customers:create','Create customers'),('customers:update','Update customers'),('customers:disable','Disable customers'),('customers:export','Export customers'),
('products:view','View products'),('products:create','Create products'),('products:update','Update products'),('products:disable','Disable products'),
('inventory:view','View inventory'),('inventory:receive','Receive stock'),('inventory:issue','Issue stock'),('inventory:adjust','Adjust stock'),('inventory:return','Return stock'),
('quotations:view','View quotations'),('quotations:create','Create quotations'),('quotations:update','Update quotations'),('quotations:approve','Approve quotations'),('quotations:send','Send quotations'),('quotations:convert','Convert quotations'),
('projects:view','View projects'),('projects:create','Create projects'),('projects:update','Update projects'),('projects:assign','Assign projects'),('projects:change_stage','Change project stages'),
('invoices:view','View invoices'),('invoices:create','Create invoices'),('invoices:issue','Issue invoices'),('invoices:cancel','Cancel invoices'),
('payments:view','View payments'),('payments:create','Create payments'),('payments:reverse','Reverse payments'),
('expenses:view','View expenses'),('expenses:create','Create expenses'),('expenses:approve','Approve expenses'),('expenses:reject','Reject expenses'),
('tickets:view','View tickets'),('tickets:create','Create tickets'),('tickets:assign','Assign tickets'),('tickets:update','Update tickets'),('tickets:close','Close tickets'),
('documents:view','View documents'),('documents:upload','Upload documents'),('documents:delete','Delete documents'),
('reports:view','View reports'),('reports:export','Export reports'),('settings:view','View settings'),('settings:update','Update settings'),('audit_logs:view','View audit logs')
on conflict(key) do update set description=excluded.description;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p where r.name='super_admin' on conflict do nothing;
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on
 p.key not in ('users:assign_roles','roles:create','roles:update','roles:assign_permissions','audit_logs:view')
where r.name='admin' on conflict do nothing;
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.key in
 ('dashboard:view','leads:view','leads:create','leads:update','leads:assign','leads:convert','leads:export','customers:view','customers:create','customers:update','quotations:view','quotations:create','quotations:update','quotations:approve','projects:view','projects:update','projects:assign','reports:view')
where r.name='manager' on conflict do nothing;
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.key in
 ('dashboard:view','leads:view','leads:create','leads:update','customers:view','quotations:view','quotations:create','quotations:update')
where r.name='sales_executive' on conflict do nothing;
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.key in
 ('dashboard:view','projects:view','projects:update','projects:change_stage','documents:view','documents:upload')
where r.name='installation_staff' on conflict do nothing;
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.key in
 ('dashboard:view','tickets:view','tickets:update','tickets:close','documents:view','documents:upload')
where r.name='service_technician' on conflict do nothing;
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.key in
 ('dashboard:view','customers:view','invoices:view','invoices:create','invoices:issue','invoices:cancel','payments:view','payments:create','payments:reverse','expenses:view','expenses:create','reports:view','reports:export')
where r.name='accountant' on conflict do nothing;
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.key in
 ('dashboard:view','quotations:view','projects:view','invoices:view','payments:view','tickets:view','tickets:create','documents:view','documents:upload')
where r.name='customer' on conflict do nothing;

create or replace function public.has_permission(required text) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from user_roles ur join role_permissions rp on rp.role_id=ur.role_id join permissions p on p.id=rp.permission_id where ur.user_id=auth.uid() and p.key=required)
$$;
revoke all on function public.has_permission(text) from public;
grant execute on function public.has_permission(text) to authenticated;

alter table public.roles enable row level security; alter table public.permissions enable row level security;
alter table public.user_roles enable row level security; alter table public.role_permissions enable row level security;
alter table public.branches enable row level security;
create policy roles_authorized_read on public.roles for select to authenticated using(public.has_permission('roles:view') or exists(select 1 from user_roles ur join roles r on r.id=ur.role_id where ur.user_id=auth.uid() and r.id=roles.id));
create policy permissions_authorized_read on public.permissions for select to authenticated using(public.has_permission('roles:view') or exists(select 1 from user_roles ur join role_permissions rp on rp.role_id=ur.role_id where ur.user_id=auth.uid() and rp.permission_id=permissions.id));
create policy own_role_read on public.user_roles for select to authenticated using(user_id=auth.uid() or public.has_permission('users:view'));
create policy role_permission_read on public.role_permissions for select to authenticated using(public.has_permission('roles:view') or exists(select 1 from user_roles ur where ur.user_id=auth.uid() and ur.role_id=role_permissions.role_id));
create policy branches_authorized_read on public.branches for select to authenticated using(public.has_permission('settings:view') or id=(select branch_id from profiles where profiles.id=auth.uid()));

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into profiles(id,full_name,email_verified) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',split_part(coalesce(new.email,''),'@',1)),new.email_confirmed_at is not null) on conflict do nothing;
 return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.track_login() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if old.last_sign_in_at is distinct from new.last_sign_in_at then update profiles set last_login_at=new.last_sign_in_at,email_verified=new.email_confirmed_at is not null where id=new.id; end if;
 return new;
end $$;
drop trigger if exists on_auth_user_login on auth.users;
create trigger on_auth_user_login after update of last_sign_in_at on auth.users for each row execute function public.track_login();
