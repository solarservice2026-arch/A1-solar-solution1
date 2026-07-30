# A1 Solar Solution Master Prompt — Video and PDF Addendum

Apply this addendum as a mandatory part of the existing **A1 Solar Solution –
Professional Solar CRM and Business Management Platform** master prompt. If a
previous requirement conflicts with this document, this addendum takes
precedence.

## 1. Mandatory account-management hierarchy

Use a strict, server-enforced hierarchy:

### Super Admin

- Can create, invite, view, edit, activate, suspend and remove **Admin**
  accounts.
- Can reset an Admin's access and resend an invitation.
- Can assign or revoke the Admin role.
- Can also manage lower roles when an emergency override is required.
- Cannot remove, suspend or demote the last active Super Admin.
- Must not be allowed to delete their own account accidentally.

### Admin

- Can create, invite, view, edit, activate, suspend and remove operational
  users: Manager, Sales Executive, Technician, Accountant and Customer.
- Can assign only roles below Admin.
- Cannot create, edit, suspend, remove or promote a Super Admin.
- Cannot create another Admin unless a separate permission is explicitly
  granted by a Super Admin. By default, only Super Admin manages Admins.
- Cannot promote themselves or any user to Admin or Super Admin.

### Lower roles

- Manager, Sales Executive, Technician, Accountant and Customer cannot create,
  remove or change privileged accounts unless a narrowly scoped custom
  permission has explicitly been assigned.

Account removal must normally be a recoverable **suspend/archive** operation.
Hard deletion is allowed only when the account has no protected business
history and an authorized Super Admin confirms it. Quotations, invoices,
agreements, payments and audit history must never be silently deleted with an
account.

All invitations, role changes, suspensions, restorations and removals must:

- Be authorized by the backend and database policies, not only by hidden UI.
- Be recorded in an immutable audit log with actor, target, action and time.
- Invalidate active sessions when access is suspended or a privileged role is
  revoked.
- Prevent privilege escalation through direct API calls.
- Return safe errors without leaking whether an unrelated account exists.

Add explicit permissions:

- `admins.view`
- `admins.create`
- `admins.update`
- `admins.suspend`
- `admins.remove`
- `users.view`
- `users.create`
- `users.update`
- `users.suspend`
- `users.remove`
- `users.assign_role`

Add automated tests proving every allowed and denied hierarchy transition.

## 2. Authentication decision

The old login system shown in the reference video must **not** be copied.
The video is a business-workflow reference only.

Implement modern Supabase Auth with:

- Email and password login
- Secure password hashing managed by Supabase Auth
- Forgot-password email
- Validated recovery redirect
- Set-new-password screen
- Session refresh and expiry handling
- Logout and server-side access revocation
- Disabled/suspended-user rejection
- Protected frontend routes
- Real JWT validation by the backend
- RLS-backed authorization
- Role and permission lookup from protected database records

Do not use the legacy username/password database pattern, plaintext passwords,
shared passwords, role selection on the login form or client-controlled role
claims. Never expose the Supabase service-role key through a `VITE_` variable.

After login:

- Staff users go to their role-specific operational dashboard.
- Customers go to their private customer dashboard.
- Unauthorized and suspended users do not enter the application.

## 3. Quotation PDF based on the supplied reference

Use `ARJUN CHAUDHARY-Quotation.pdf` as a functional and content-structure
reference, while generating every customer-specific value dynamically.
Do not hardcode or copy the sample customer's personal information.

Generate a professional A4 quotation with:

### Page 1 — Commercial quotation

- Company logo and identity
- Document title: Quotation
- Quotation number
- Quotation date and validity date
- Solar system heading containing capacity and type
- Vendor contact and GST details from protected business settings
- Customer name, mobile and installation address from the customer record
- Product table with:
  - Serial number
  - Product description
  - Brand/model
  - Quantity
  - Unit price
  - Amount
- Subtotal, discount, tax, round-off and grand total
- Total amount in Indian currency words
- Payment/bank section populated from protected business settings

### Page 2 — Terms and system description

- Payment terms with configurable advance and completion percentages
- Delivery and installation timeline
- Site-access and approval responsibilities
- Treatment of additional civil/electrical work
- Solar-panel performance warranty
- Inverter and component manufacturer warranties
- Service-support period
- Warranty exclusions
- System component descriptions:
  - Solar panels
  - Inverter
  - Mounting structure
  - Monitoring system
- Authorized signature/stamp
- Customer acceptance/signature area where required

The default template may reflect the reference's commercial structure, but all
percentages, timelines, warranty text, bank information, tax details and legal
clauses must be editable through versioned business settings/templates.

The generated PDF must support:

- Print and download
- Correct A4 margins
- Predictable page breaks
- Repeated headers for multi-page item tables
- Indian rupee formatting
- Amount-in-words calculation
- Immutable snapshot of finalized quotation values
- Authorization checks before viewing or downloading

## 4. Agreement/MOU PDF based on the supplied reference

Use `ARJUN CHAUDHARY - Aggrement.pdf` as the structural reference for a
three-page agreement. Correct the product/UI spelling to **Agreement** while
retaining compatibility with existing file names where necessary.

Provide a versioned agreement template titled:

**Agreement between Consumer and Vendor for installation of a grid-connected
rooftop solar project under PM Surya Ghar: Muft Bijli Yojana**

The agreement must dynamically merge:

- Execution day, month and year
- Consumer name and address
- Vendor legal name and registered address
- Related quotation
- Solar system capacity and type
- Project cost and agreed payment schedule
- Consumer signature
- Vendor signature/stamp
- Signature dates

Required agreement sections:

1. Identification of Consumer and Vendor
2. Project purpose and scheme reference
3. Consumer responsibilities
4. Vendor responsibilities
5. Site survey and feasibility
6. Design and engineering
7. Module and inverter standards
8. Procurement and supply
9. Installation, civil and electrical work
10. Technical and warranty documentation
11. Project completion report
12. System and component warranty
13. Net meter and grid-connectivity responsibilities
14. Applicable MNRE, DISCOM, BIS/IS/IEC and safety requirements
15. Operation and maintenance obligations
16. Subsidy/project documentation support
17. Plant performance requirements
18. Dispute-resolution clause
19. Mutually agreed payment terms
20. Consumer and Vendor signature blocks
21. Applicable disclaimer

Legal and scheme wording must be maintained as a versioned template and
reviewable by an authorized business/legal owner. Do not silently modify a
previously signed agreement when the master template changes.

Agreement workflow:

- Create draft from an existing customer and, preferably, an accepted
  quotation.
- Preview the fully merged document before finalization.
- Validate all mandatory fields.
- Upload signatures to private Storage with content-type and size validation.
- Finalize into an immutable PDF snapshot.
- Allow authorized print/download through a signed, expiring URL.
- Store template version, document hash, creator and finalization time.
- Do not overwrite a signed agreement; amendments must create a new version.

## 5. Required database and policy changes

Review and add migrations as required for:

- User lifecycle status and archive metadata
- Actor/target account-management audit events
- Agreement templates and template versions
- Agreement document versions
- Finalized quotation snapshots
- Private document/signature metadata
- Document hashes and finalization timestamps

RLS and backend authorization must prove:

- Only Super Admin can manage Admin accounts by default.
- Admin can manage only allowed lower-role accounts.
- Admin cannot modify Super Admin.
- Lower roles cannot elevate privileges.
- A customer can access only their own finalized documents.
- Private PDFs and signatures cannot be accessed using a guessed URL.

## 6. Additional test and acceptance gates

Add and execute:

- Super Admin creates, suspends, restores and removes an Admin.
- Admin creates, suspends, restores and removes each permitted user type.
- Admin is denied when attempting to manage a Super Admin.
- Admin is denied when attempting to self-promote or promote another user to
  Super Admin.
- Lower roles are denied account-management endpoints.
- Removing/suspending a user preserves protected business history.
- Suspended-user sessions lose access.
- Quotation PDF contains the correct dynamic customer, products, totals, terms
  and protected settings without sample-person leakage.
- Agreement PDF contains the correct parties, clauses, dates, linked quotation
  and signatures without sample-person leakage.
- Customer can download only their own quotation/agreement.
- Finalized PDFs remain unchanged after product prices or templates change.
- Old video-style authentication is absent.
- Password recovery and real JWT/RLS tests pass.

Do not report this work complete until the hierarchy rules, modern
authentication and both reference-based PDF workflows pass live integration
and authenticated end-to-end tests.
