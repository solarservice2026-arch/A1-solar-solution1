insert into public.agreement_templates(name,scheme_name,version,body,active)
select
  'PM Surya Ghar Consumer Vendor Agreement',
  'PM Surya Ghar: Muft Bijli Yojana',
  1,
  jsonb_build_object(
    'title','Agreement between Consumer and Vendor for installation of a grid-connected rooftop solar project',
    'sections',jsonb_build_array(
      'Consumer and vendor identification','Project purpose','Consumer responsibilities',
      'Vendor responsibilities','Site survey and feasibility','Design and engineering',
      'Procurement and supply','Installation and documentation','Warranty and maintenance',
      'Grid connectivity','Subsidy documentation','Plant performance','Payment and disputes',
      'Signatures and disclaimer'
    )
  ),
  true
where not exists (
  select 1 from public.agreement_templates
  where name='PM Surya Ghar Consumer Vendor Agreement' and version=1
);
