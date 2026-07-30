alter table public.projects
  add column if not exists assigned_to uuid references public.profiles(id);

create index if not exists projects_assigned_to_idx
  on public.projects(assigned_to);

drop policy if exists project_assigned_installer_read on public.projects;
create policy project_assigned_installer_read
on public.projects for select to authenticated
using (
  assigned_to = auth.uid()
  and public.has_permission('projects:view')
);

drop policy if exists project_assigned_installer_update on public.projects;
create policy project_assigned_installer_update
on public.projects for update to authenticated
using (
  assigned_to = auth.uid()
  and public.has_permission('projects:update')
)
with check (
  assigned_to = auth.uid()
  and public.has_permission('projects:update')
);
