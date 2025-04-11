This file tracks MVP development progress for the LeadSleuth SaaS app. Each feature aligns with a sidebar section. Check off tasks once they're completed and reviewed. Follow the official tech stack: Next.js, TailwindCSS, shadcn/ui, Supabase, GPT-4, and Mailgun/SendGrid.

1. Setup Pages
- [x] Basic page structure and routing created
- [x] Authentication with Supabase implemented
  - [x] Login/Signup forms
  - [x] Protected routes
  - [x] Auth middleware
  - [x] Session handling

| Route              | Page Purpose                                  |
|--------------------|-----------------------------------------------|
| `/login`/`/signup` | Authentication with Supabase                  |
| `/`                | Landing Page                                  |
| `/tool/discover`   | Main lead search + opportunity flags          |
| `/tool/leads`      | User's saved lead lists + notes/tags          |
| `/tool/outreach`   | AI email generation and bulk sending          |
| `/tool/dashboard`  | Campaign stats, open rates, conversion charts |
| `/tool/settings`   | Auth, profile, integrations, billing          |



2. Discover Leads (Sidebar: /tool/discover)

Tasks:
- [x] Implement `LeadSearchForm.tsx` (location, radius, niche)
- [x] Use React Hook Form + Zod for validation
- [x] Connect to Google Places API for results
- [x] Display `LeadCard.tsx` with opportunity flags:
  - [x] No website
  - [x] Few reviews
  - [x] No photos
- [x] Add lead filters: has website, review rating, photos
- [ ] Save selected leads to Supabase `lead_lists` table

---

3. My Lead Lists (Sidebar: /tool/leads)

Tasks:
- [x] Create `LeadListView.tsx` to display saved leads
- [x] Display and manage tags (Hot, Warm, Lost)
- [x] Add lead notes modal or expandable input
- [ ] Create and manage multiple lead lists
  - [ ] Create new list with name and description
  - [ ] Move leads between lists
  - [ ] Archive/delete lists
  - [ ] List sharing settings (future)
- [ ] Lead Management Features
  - [ ] Add notes to leads
  - [ ] Set lead status (New, Contacted, Responded, etc.)
  - [ ] Add custom tags
  - [ ] Bulk actions (move, tag, delete)
- [ ] Lead List Database Schema
  ```sql
  -- Lists table
  create table lead_lists (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id),
    name text not null,
    description text,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    is_archived boolean default false
  );

  -- List items table (leads in lists)
  create table list_items (
    id uuid default uuid_generate_v4() primary key,
    list_id uuid references lead_lists(id),
    lead_id uuid references leads(id),
    notes text,
    status text default 'new',
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(list_id, lead_id)
  );

  -- Lead tags table
  create table lead_tags (
    id uuid default uuid_generate_v4() primary key,
    lead_id uuid references leads(id),
    tag text not null,
    created_at timestamptz default now()
  );
  ```


4. Outreach (Sidebar: /tool/outreach)

Tasks:
- [ ] Build `EmailGeneratorForm.tsx` with fields: niche, offer, issue
- [ ] Call GPT-4 via `lib/openai.ts` for email generation
- [ ] Output editable result in a preview box
- [ ] Save favorite templates to Supabase
- [ ] Select leads from list
- [ ] Choose template and send via backend API (Mailgun/SendGrid)
- [ ] Schedule email sending
- [ ] Add Gmail SMTP OAuth option


5. Dashboard (Sidebar: /tool/dashboard)

Tasks:
- [ ] Query Supabase for campaign stats
- [ ] Show metrics: Sent, Opened, Replied, Conversion Rate
- [ ] Use Recharts or Chart.js for visualizations
- [ ] Add campaign filters (time range, list)
- [ ] Display AI suggestions using GPT-4


6. Settings (Sidebar: /tool/settings)

Tasks:
- [ ] Setup Supabase Auth for email/password login
- [ ] Profile management UI
- [ ] Email integration config page
- [ ] Stripe billing placeholder
- [ ] Logic for Free vs Pro subscription access


