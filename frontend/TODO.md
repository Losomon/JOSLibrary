# JOS Library Frontend TODO


- Librarian dashboard/dashboard/librarian - [x] app/dashboard/librarian/page.tsx

## Implementation Steps
1. ✅ Refine and complete frontend/app/dashboard/admin/page.tsx (fix imports, add deliveries table if exists, test queries)
2. ✅ Create frontend/app/dashboard/librarian/page.tsx (client component, tabs: Books/Active borrows/Overdue, Add Book modal w/ auto-tag)
3. ✅ Create frontend/app/register/page.tsx (split-panel, full_name/phone metadata)
4. ✅ Update this TODO.md with ✅ marks
5. - [ ] Test all pages: npm run dev, login as admin/librarian/member, check redirects/stats/tables/modals
6. - [ ] Ensure Navbar active states for /admin /librarian

## Notes
- Use existing UI patterns (stat-card, badge-*, card tables)
- Queries assume tables: books, profiles, orders (status: paid/pending), borrows (status: active/overdue), deliveries?
- Add Book modal POST /api/books/tag (backend exists)
- Register uses supabase.auth.signUp w/ metadata for trigger.

