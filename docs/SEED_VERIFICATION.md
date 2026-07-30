# Seed verification

Source inspection confirms the eight required role inserts and permission
inserts use conflict handling. Product seed rows use unique fictional SKUs and
also use conflict handling. No normal Auth trigger grants an elevated role.

Execution result: passed. The corrected single-transaction seed ran twice
successfully. The live result contains exactly 8 system roles, 66 unique
permissions, and 187 role-permission mappings.

Required live checks:

```sql
select name,count(*) from roles group by name having count(*) <> 1;
select key,count(*) from permissions group by key having count(*) <> 1;
select r.name,count(rp.permission_id) from roles r left join role_permissions rp
  on rp.role_id=r.id group by r.name order by r.name;
```
