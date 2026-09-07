# Ansys Simulation Mastery — LMS

A full learning-management platform for the Ansys Simulation Mastery programme:
a public course catalogue, online payment with Paystack, a student dashboard
(recordings, assignments, group projects, announcements, analytics), and an
admin dashboard for running the whole thing.

Built with Next.js + TypeScript + Tailwind + Supabase (database, auth, file
storage). Follow the steps below in order.

---

## What's included

- **Public site**: navy/white branded landing page, full course catalogue,
  per-course pages with a curriculum outline and price.
- **Accounts**: email/password sign up, and "Continue with Google".
- **Payments**: students pay per course with Paystack (cards, bank transfer,
  USSD); access is granted automatically the moment payment is confirmed.
- **Student dashboard**: enrolled courses, video recordings, assignments
  (with file upload and grading feedback), group projects (with group
  membership and shared submissions), announcements, watch-time analytics,
  and payment history.
- **Admin dashboard**: create/publish courses and modules, upload recordings,
  create and grade assignments and group projects, manage groups, post
  announcements, admit/deactivate/remove students, grant free access, and
  view revenue.

---

## Step 1 — Create your Supabase project and run the schema

1. Go to [supabase.com](https://supabase.com), create a project (or use an
   existing empty one).
2. Left sidebar → **SQL Editor** → **New query**.
3. Open `supabase/schema.sql` from this project, copy the whole file, paste
   it into the SQL editor, and click **Run**. This creates every table,
   security rule, and storage bucket the app needs. It's safe to re-run.
4. Left sidebar → **Settings → API**. Copy these three values — you'll need
   them in Step 4:
   - **Project URL**
   - **anon public** key
   - **service_role** key (click "Reveal" — keep this secret, never share it)

### Create your admin account

1. Left sidebar → **Authentication → Users → Add user**. Enter your email and
   a password, and tick **Auto Confirm User**.
2. Back in **SQL Editor**, run (with your real email):
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
   That's it — your profile row was already created automatically the moment
   the account was created.

---

## Step 2 — Turn on "Continue with Google"

1. In [Google Cloud Console](https://console.cloud.google.com/), create a
   project (or use an existing one) → **APIs & Services → Credentials →
   Create Credentials → OAuth client ID**.
2. Application type: **Web application**.
3. Under **Authorized redirect URIs**, add your Supabase callback URL. Find
   the exact URL in your Supabase dashboard under **Authentication →
   Providers → Google** (it looks like
   `https://<your-project-ref>.supabase.co/auth/v1/callback`) — copy it from
   there and paste it into Google Cloud.
4. Save, then copy the **Client ID** and **Client Secret** Google gives you.
5. In Supabase: **Authentication → Providers → Google** → toggle it on →
   paste the Client ID and Client Secret → **Save**.
6. In Supabase: **Authentication → URL Configuration** → set **Site URL** to
   your live domain (see Step 6), and add it to **Redirect URLs** too (as
   `https://your-domain/**`). Do this once you know your real deployed URL —
   you can come back to this after Step 6.

If you skip this step, email/password sign-in still works fine — the Google
button just won't.

---

## Step 3 — Set up Paystack

1. Create an account at [paystack.com](https://paystack.com) and complete
   business verification (needed before you can receive live payouts — test
   mode works immediately without it).
2. **Settings → API Keys & Webhooks**. Copy your **Secret Key** (starts with
   `sk_test_` or `sk_live_`) — you'll need it in Step 4.
3. On the same page, set the **Webhook URL** to:
   `https://your-domain/api/payments/webhook`
   (use your real deployed domain from Step 6 — you can come back and set
   this once you have it).
4. Start in **Test Mode** (toggle at the top of the Paystack dashboard) so
   you can pay with Paystack's test cards before going live. Switch to Live
   Mode (and a live secret key) once you're ready to accept real payments.

---

## Step 4 — Set your environment variables

1. In this project folder, copy `.env.local.example` to a new file named
   `.env.local`.
2. Fill in the real values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
PAYSTACK_SECRET_KEY=sk_test_your-secret-key
NEXT_PUBLIC_WHATSAPP_GROUP_URL=https://chat.whatsapp.com/your-group-invite-code
```

**Never commit `.env.local` to GitHub or share the service_role / Paystack
secret keys publicly.**

---

## Step 5 — Run it locally (optional, needs Node.js 18+)

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

---

## Step 6 — Deploy it live (Vercel)

1. Push this project to a GitHub repository.
2. Go to [vercel.com](https://vercel.com), sign in with GitHub, **Add New →
   Project**, select this repository.
3. Under **Environment Variables**, add **all six** variables listed in Step
   4 (don't skip `NEXT_PUBLIC_SITE_URL` or `PAYSTACK_SECRET_KEY` — invite,
   password-reset, and payment redirect links all depend on them).
4. Click **Deploy**. Vercel gives you a live URL like
   `your-project.vercel.app`.
5. Go back to Vercel's Environment Variables and set `NEXT_PUBLIC_SITE_URL`
   to that exact URL (e.g. `https://your-project.vercel.app`, no trailing
   slash), then redeploy.
6. In **Supabase → Authentication → URL Configuration**: set **Site URL** to
   that same URL, and add `https://your-project.vercel.app/**` to
   **Redirect URLs**.
7. In **Paystack → Settings → API Keys & Webhooks**: set the webhook URL to
   `https://your-project.vercel.app/api/payments/webhook`.

If invite emails, password resets, or "Continue with Google" ever redirect
to a broken link, it's almost always because one of these three places
(Vercel env var, Supabase redirect URLs, or the domain itself) is out of
sync with your real live URL.

---

## How the platform works

### Courses & payment
Admin creates courses in **Admin → Courses** (title, description, level,
price, thumbnail) and publishes them. Published courses appear in the public
catalogue at `/courses`. A visitor creates an account, opens a course, and
clicks **Enroll & pay with Paystack** — they're redirected to Paystack's
secure checkout, and the moment payment succeeds (confirmed both by a
webhook and a return-page check, so it's reliable even if one is delayed)
they're enrolled and can access the course immediately. Free courses (price
₦0) skip payment entirely.

### Admitting students without payment
**Admin → Students → Admit a student** creates an account for someone who
paid another way (bank transfer, cash) and emails them an invite to set
their password. You can grant them free access to a course from the same
screen, or later from a student's expanded row.

### Content
Inside **Admin → Courses → (a course)** you can add modules (to group
content), recordings (paste a YouTube-unlisted or Vimeo-private link — free,
no storage cost), assignments (with instructions, a due date, and an
optional downloadable brief), and group projects. Assignment and group
project submissions from students appear for grading with a score and
written feedback, visible to the student once graded.

### Removing a student
**Deactivate** (the toggle icon) is reversible and immediately blocks
dashboard access without deleting anything. **Delete** (trash icon) is
permanent — it removes the account and everything tied to it.

---

## Project structure

```
/app
  page.tsx                      -> Public landing page
  courses/                      -> Public course catalogue + course detail
  login/, signup/                -> Auth pages (email/password + Google)
  auth/callback/                -> OAuth / invite / password-reset code exchange
  forgot-password/, set-password/ -> Password reset flow
  payments/callback/            -> Return page after Paystack checkout
  dashboard/                     -> Student dashboard (courses, assignments, etc.)
  admin/                         -> Admin dashboard
  api/payments/                  -> Paystack initialize / verify / webhook
  api/admin/                     -> Admin-only server actions (invite/delete student)
  api/enrollments/free/          -> Free-course self-enroll
/components                      -> Shared UI + admin/ and auth/ subfolders
/lib
  supabase/                      -> Browser / server / middleware / admin clients
  paystack.ts, payments.ts       -> Paystack API + payment confirmation logic
  types.ts, format.ts, video.ts  -> Shared types and helpers
/supabase/schema.sql             -> Full database schema, RLS policies, storage buckets
middleware.ts                    -> Protects /dashboard/* and /admin/* routes
```

---

## Security notes

- Every table has Row Level Security enabled — students can only ever read
  their own data and content for courses they're enrolled in; only admins
  can write course content.
- The Supabase `service_role` key and the Paystack secret key are only ever
  used inside `app/api/*` server routes, never sent to the browser.
- Paystack payments are verified server-side against Paystack's API (both by
  webhook and by a signed return-page check) before any enrollment is
  granted — the amount is checked too, so a tampered client request can't
  grant free access.
- Route protection happens in `middleware.ts` at the server/edge level, not
  just in the UI.
- Passwords are never stored in your own tables — Supabase Auth handles all
  of that.

---

## If something doesn't work

- **Login says "Invalid email or password"**: double-check
  `NEXT_PUBLIC_SUPABASE_URL` in Vercel matches this exact Supabase project.
- **Invite / reset-password / Google sign-in link is broken**: check that
  `NEXT_PUBLIC_SITE_URL` in Vercel exactly matches your live domain, and
  that domain is in Supabase's **Redirect URLs** (Step 6).
- **Payment succeeds on Paystack but the course doesn't unlock**: check the
  webhook URL in Paystack Settings matches your live domain, and that
  `PAYSTACK_SECRET_KEY` in Vercel is the same key shown in your Paystack
  dashboard.
