# Chizeon Technologies website and admin

All files sit at the root of this repo.

- `build.py` generates the public website from `site.json` into `dist/`.
- `admin/` pages (`App.tsx`, `Editor.tsx`, `Login.tsx`, etc.) make up the admin at `/admin`. The admin builds into `dist/admin`.
- `0001_init.sql` creates the database. `0002_seed.sql` loads the starter content. Replace nothing: the admin email is already set to trossachs.int@gmail.com.
- `fetch-content.mjs` runs before every build. It downloads the published copy from Supabase, so the site always matches the last publish.

## Vercel settings

- Framework: Other. Build command and output directory come from `vercel.json`.
- Environment variables (Production and Preview):
  - `SUPABASE_URL` and `VITE_SUPABASE_URL`: your project URL
  - `SUPABASE_ANON_KEY` and `VITE_SUPABASE_ANON_KEY`: the anon key
  Never put the service-role key in this repo.

## Publish automatically

In Vercel, create a Deploy Hook on `main`. In Supabase, add a webhook on `site_content` UPDATE that calls that URL. Each publish then rebuilds the site.

## Limits

- The 3D venture scenes are code, not content.
- Some button labels and layout labels remain in code.
