# RLS policy matrix

| Table | Operation | Role | Policy | Access condition | Coverage |
|---|---|---|---|---|---|
| profiles | SELECT | User/Super Admin | profiles_self_read | Own ID or Super Admin | Source review; live test pending |
| roles | SELECT | Authenticated | roles_authorized_read | `roles:view` or own role | Source review |
| permissions | SELECT | Authenticated | permissions_authorized_read | `roles:view` or own permission | Source review |
| user_roles | SELECT | Authenticated | own_role_read | Own assignment or `users:view` | Source review |
| role_permissions | SELECT | Authenticated | role_permission_read | Own role or `roles:view` | Source review |
| customers | SELECT | Customer/Admin | customer_self_read | Own profile or authorized role | Existing policy; expansion pending |
| quotations/projects/invoices | SELECT | Customer/staff | customer owner or permitted finance role | Entity ownership | Existing policy; expansion pending |
| notifications | SELECT | Authenticated | notification_owner | `user_id = auth.uid()` | Source review |
| website_enquiries | INSERT | Anonymous | public_enquiry_insert | Valid name/mobile check | Source review |
| storage.objects | INSERT | Authenticated | private_document_owner_insert | Private bucket, own UUID prefix, upload permission | Live test blocked |
| storage.objects | SELECT | Authenticated | private_document_owner_read | Own UUID prefix or document-view permission | Live test blocked |
| storage.objects | DELETE | Authenticated | private_document_owner_delete | Own UUID prefix and delete permission | Live test blocked |

No protected policy uses unconditional `USING (true)`. Phase 2C executed six
live suites with tagged real users: all 9 positive/negative RLS and Storage
tests passed.
