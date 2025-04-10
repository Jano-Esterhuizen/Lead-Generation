This file tracks MVP development progress for the LeadSleuth SaaS app. Each feature aligns with a sidebar section. Check off tasks once they're completed and reviewed. Follow the official tech stack: Next.js, TailwindCSS, shadcn/ui, Supabase, GPT-4, and Mailgun/SendGrid.

---

## 🔍 Discover Leads (Sidebar: /discover)

### Tasks:
- [x] Create `discover page`
- [x] Implement `LeadSearchForm.tsx` (location, radius, niche)
- [x] Use React Hook Form + Zod for validation
- [ ] Connect to Google Places API for results
- [ ] Display `LeadCard.tsx` with opportunity flags:
  - [ ] No website
  - [ ] Few reviews
  - [ ] No photos
- [ ] Add lead filters: has website, review rating, photos
- [ ] Save selected leads to Supabase `lead_lists` table

---

## 📋 My Lead Lists (Sidebar: /leads)

### Tasks:
- [ ] Create `leads page`
- [ ] Create `LeadListView.tsx` to display saved leads
- [ ] Display and manage tags (Hot, Warm, Lost)
- [ ] Add lead notes modal or expandable input
- [ ] CRUD support for lead lists in Supabase

---

## ✉️ Outreach (Sidebar: /outreach)

### Tasks:
- [ ] Create `aoutreach page`
- [ ] Build `EmailGeneratorForm.tsx` with fields: niche, offer, issue
- [ ] Call GPT-4 via `lib/openai.ts` for email generation
- [ ] Output editable result in a preview box
- [ ] Save favorite templates to Supabase
- [ ] Select leads from list
- [ ] Choose template and send via backend API (Mailgun/SendGrid)
- [ ] Schedule email sending
- [ ] Add Gmail SMTP OAuth option

---

## 📊 Dashboard (Sidebar: /dashboard)

### Tasks:
- [ ] Create `dashboard page`
- [ ] Query Supabase for campaign stats
- [ ] Show metrics: Sent, Opened, Replied, Conversion Rate
- [ ] Use Recharts or Chart.js for visualizations
- [ ] Add campaign filters (time range, list)
- [ ] Display AI suggestions using GPT-4

---

## ⚙️ Settings (Sidebar: /settings)

### Tasks:
- [ ] Create `settings page`
- [ ] Setup Supabase Auth for email/password login
- [ ] Profile management UI
- [ ] Email integration config page
- [ ] Stripe billing placeholder
- [ ] Logic for Free vs Pro subscription access

---

## 📁 Pages Overview

| Route              | Page Purpose                                  |
|--------------------|-----------------------------------------------|
| `/discover`        | Main lead search + opportunity flags          |
| `/leads`           | User's saved lead lists + notes/tags          |
| `/outreach`        | AI email generation and bulk sending          |
| `/dashboard`       | Campaign stats, open rates, conversion charts |
| `/settings`        | Auth, profile, integrations, billing          |

