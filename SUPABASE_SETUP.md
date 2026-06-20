# Supabase Setup

## Authentication (required for the deployed app)

The app uses **Supabase Auth** (username + password, with email password-reset).
In production the site is **fail-closed** — without the Supabase env vars it stays
locked. To set it up:

1. **Enable email auth:** Supabase → **Authentication → Providers → Email** → enable.
   For quick testing you can turn **"Confirm email" OFF** so signup logs in
   immediately; leave it on for stricter security (users confirm via email first).
2. **Run the auth schema:** paste [`supabase/schema/auth.sql`](supabase/schema/auth.sql)
   into the SQL editor and run it (creates the `profiles` table, signup trigger,
   and the `email_for_username` / `username_taken` functions).
3. **Set redirect URLs:** Supabase → **Authentication → URL Configuration** → set
   **Site URL** to your domain and add `<domain>/reset` and `<domain>/login` to
   **Redirect URLs** (so reset/confirm email links work). Add `http://localhost:3000/*`
   for local dev.
4. **Add the public env vars** (Settings → API → URL + anon/publishable key) to
   `.env.local` and Vercel:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...   # anon/publishable, NOT the secret
   ```
   These are public (browser-safe). The `SUPABASE_SERVICE_ROLE_KEY` stays server-only.
   You can remove the old `APP_PASSWORD` var — it's no longer used.
5. **Password-reset email:** Supabase's built-in email works for low-volume testing.
   For production, configure custom SMTP (Authentication → Emails) to avoid rate limits.

### Test checklist (after setup)
- Sign up (username + email + password) → confirm via email if enabled → log in.
- Log in by **username** + password.
- "Forgot password" → email link → `/reset` → set new password → log in.
- Brand profile / memory / history persist and are **separate per account**.
- "Use without an account" (guest) → works, but data clears when the tab closes;
  brand memory prompts you to log in.

---

PostPilot can also run with **no Supabase** in local dev — brand memory falls back
to a local JSON file (`data/memory.json`) and profile/history to browser storage.

Enabling Supabase moves **brand memory into Postgres + pgvector**, which is
required for the vector store to persist on serverless hosts like Vercel (their
filesystem is ephemeral). It's fully optional and the app auto-detects it: if the
env vars below are set, it uses Supabase; otherwise it falls back to local disk.

## 1. Create a project

1. Go to https://supabase.com and create a free project.
2. Wait for it to finish provisioning.

## 2. Run the schema

1. In the dashboard, open **SQL Editor → New query**.
2. Paste the contents of [`supabase/schema/schema.sql`](supabase/schema/schema.sql) and **Run**.

This enables the `vector` extension and creates the `memories` table (with a
768-dim embedding column + ivfflat index), the `match_memories` similarity-search
function, and the `brand_profiles`, `generation_history`, and `content_calendars`
tables.

> Already ran an earlier (384-dim) version of the schema? Run
> [`supabase/schema/migrate-384-to-768.sql`](supabase/schema/migrate-384-to-768.sql)
> once to move the `memories` table to 768 dims.
>
> Ran the schema before engagement metadata (hashtags/likes/impressions/image)?
> Run [`supabase/schema/migrate-add-engagement.sql`](supabase/schema/migrate-add-engagement.sql)
> once to add the columns and update the `match_memories` RPC.

## 3. Add credentials

In the dashboard: **Project Settings → API**. Copy:

- **Project URL** → `SUPABASE_URL`
- **service_role** secret (under "Project API keys") → `SUPABASE_SERVICE_ROLE_KEY`

Add them to `.env.local`:

```
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...   # service_role, NOT anon
```

> ⚠️ The `service_role` key bypasses row-level security. It's only ever used in
> server-side API routes here — never ship it to the browser.

## 4. Restart & verify

```bash
npm run dev
```

Add a past post on the **Brand Memory** page. It will now be stored in Supabase —
check **Table Editor → memories** to confirm the row (and its embedding). Generating
with "write in my voice" on will retrieve via the `match_memories` pgvector RPC.

## Architecture note

Embeddings come from the Gemini API (`gemini-embedding-001`, 768-dim) in both
modes — only storage and similarity search move to Postgres. The store
interface (`lib/memory/store.ts`) dispatches between the disk and Supabase
backends, so nothing else in the app changes.

**Brand memory**, **brand profile**, and **generation history** are all
Supabase-backed when configured (via `/api/memory`, `/api/profile`, `/api/history`),
falling back to the local disk/localStorage stores otherwise. The client stores
probe a `{ configured }` flag from the API and cache it, so no-Supabase mode pays
no extra round-trips. `content_calendars` is created and ready for the same pattern.
