# Ansys Simulation Mastery — LMS

A closed/invite-based Learning Management System for the Ansys Simulation Mastery
tutorial programme (FEA, CFD, Advanced FEA / Computational Solid Mechanics).

This is a complete, working Next.js + TypeScript + Tailwind + Supabase codebase.
Follow the steps below in order — you do **not** need to know how to code to get
this live, but you (or someone helping you) will need to follow each step exactly.

---

## What you already have

Based on your work so far, you already have a Supabase project called
**"ANSYS SIMULATION MASTERY LMS"** with the schema (`profiles`, `modules`,
`recordings`, `enrollment_requests`, `activity_log`) already created, and an
admin profile row already inserted for `teesarmarvish24@gmail.com`. Great — we'll
use that exact project. You do NOT need to create a new one.

---

## Step 1 — Get your Supabase keys

1. Go to your Supabase project **"ANSYS SIMULATION MASTERY LMS"** (not `mzdotjlwwpzltpzhvewa`
   — that was Bolt's own internal database, which you no longer need since your
   Bolt tokens are finished).
2. Left sidebar → **Settings** → **API**.
3. Copy these three values, you'll need them in Step 3:
   - **Project URL**
   - **anon public** key
   - **service_role** key (click "Reveal" — keep this one secret, never share it publicly)

## Step 2 — Re-run the schema (safe, won't break anything)

Even though your tables already exist, run this once more to be certain every
policy and the seed module data is in place:

1. In that same project, left sidebar → **SQL Editor** → **New query**.
2. Open the file `supabase/schema.sql` from this project folder, copy its entire
   contents, and paste into the SQL editor.
3. Click **Run**. It's written to be safe to run multiple times — it won't
   duplicate your existing admin account or data.

## Step 3 — Set your environment variables

1. In this project folder, find the file `.env.local.example`.
2. Make a copy of it named exactly `.env.local` (same folder, just remove `.example`).
3. Open `.env.local` and paste in the 3 values from Step 1:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Never commit `.env.local` to GitHub or share the service_role key publicly** —
it has full admin access to your database.

---

## Step 4 — Run it locally (optional, needs Node.js installed)

If you or someone helping you has Node.js (v18+) installed:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

---

## Step 5 — Deploy it live (recommended path: Vercel, free, no local setup needed)

This is the easiest way to get a real, working website URL without needing
Node.js installed on your own computer.

1. Create a free account at **github.com** if you don't have one.
2. Create a new GitHub repository and upload this entire project folder to it
   (GitHub's website lets you drag-and-drop files to upload without using any
   command line, under "Add file" → "Upload files").
3. Go to **vercel.com**, sign up/log in (you can sign in directly with your
   GitHub account).
4. Click **"Add New" → "Project"**, then select the GitHub repository you just
   created.
5. Vercel will ask for **Environment Variables** during setup — enter the same
   3 values from Step 3 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`).
6. Click **Deploy**. Vercel will build and host the site for you, and give you a
   live URL like `ansys-simulation-mastery.vercel.app`.

---

## How the admin portal works

- There is **no public admin signup page** anywhere in this app — this is
  intentional, for security.
- Your admin account already exists (the one you created earlier with
  `role = admin`, `status = active` in the `profiles` table).
- To log in as admin: go to `/login` on your live site (same form everyone
  uses) and sign in with that email/password. Because your `profiles.role`
  is `admin`, you'll be redirected to `/admin` automatically.
- To create additional admins later, repeat the same manual process: create
  a user in Supabase Authentication, then insert/update a `profiles` row for
  them with `role = 'admin'`.

## How student enrollment works

1. A prospective student fills out the public **"Request Access"** form
   (`/request-access`) on your site. This does NOT create a login — it just
   logs their request.
2. You review requests at `/admin/requests` after confirming they've paid the
   commitment fee.
3. Clicking **Approve** automatically creates their login account and emails
   them an invite link to set their own password. Clicking **Reject** simply
   marks the request as rejected.

## How you upload class recordings

1. Upload your recorded class to YouTube as **Unlisted** (recommended — free,
   no storage costs) or Vimeo as **Private**.
2. Copy the video's URL.
3. Go to `/admin/recordings` → **Add Recording** → paste the URL, select the
   module (FEA / CFD / Advanced FEA), fill in the title/date/description →
   **Save**. It will now appear for all active students under that module.

---

## Project structure

```
/app
  page.tsx                        -> Landing page
  login/page.tsx                 -> Login (students + admin, same form)
  request-access/page.tsx        -> Public enrollment request form
  unauthorized/page.tsx           -> Shown when access is denied
  dashboard/page.tsx              -> Student dashboard (modules overview)
  dashboard/module/[slug]/        -> Recordings list for one module
  dashboard/recording/[id]/       -> Video player page
  admin/page.tsx                  -> Admin overview stats
  admin/recordings/page.tsx       -> Upload/edit/delete recordings
  admin/students/page.tsx         -> Activate/deactivate students
  admin/requests/page.tsx         -> Approve/reject enrollment requests
  api/admin/approve-request/      -> Server route: creates student account
  api/admin/reject-request/       -> Server route: marks request rejected
/components                       -> Navbar, dashboard shell, admin managers
/lib/supabase                     -> Supabase client/server/middleware/admin helpers
/lib/types.ts                     -> Shared TypeScript types
/supabase/schema.sql               -> Full database schema + RLS policies
middleware.ts                     -> Protects /dashboard/* and /admin/* routes
```

---

## Security notes

- Every table has Row Level Security enabled — students can only ever read
  their own profile and active-status content; only admins can write.
- The `service_role` key is only ever used inside `app/api/*` server routes,
  never sent to the browser.
- Route protection happens in `middleware.ts` at the server/edge level, not
  just in the UI — so it can't be bypassed by disabling JavaScript.
- Passwords are never stored in your own tables — Supabase Auth handles all
  of that.

---

## If something doesn't work

The most common cause of login/data issues is the app pointing at the wrong
Supabase project. Double-check that the `NEXT_PUBLIC_SUPABASE_URL` in your
`.env.local` (or Vercel environment variables) exactly matches the Project URL
shown in Settings → API for your **"ANSYS SIMULATION MASTERY LMS"** project —
not any other project you may have created while testing.
