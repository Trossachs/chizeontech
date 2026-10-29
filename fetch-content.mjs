// Runs before the static build on Vercel. If Supabase is configured, pull the
// published copy (`live`) into site/content/site.json so the build uses it.
// Without credentials the committed site/content/site.json is used.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const target = join(here, 'site.json');
const url = (process.env.SUPABASE_URL || '').trim();
const key = (process.env.SUPABASE_ANON_KEY || '').trim();

if (!url || !key) {
  console.log('fetch-content: no Supabase config, using committed content.');
  process.exit(0);
}

const res = await fetch(`${url}/rest/v1/site_content?id=eq.site&select=live`, {
  headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' },
});
if (!res.ok) {
  console.error(`fetch-content: Supabase returned ${res.status}. Build aborted so the live site is not replaced by stale content.`);
  process.exit(1);
}
const rows = await res.json();
const live = rows?.[0]?.live;
if (!live || typeof live !== 'object' || !Array.isArray(live.ventures)) {
  console.log('fetch-content: nothing published yet, using committed content.');
  process.exit(0);
}
writeFileSync(target, JSON.stringify(live, null, 2));
console.log(`fetch-content: wrote ${live.ventures.length} ventures from Supabase.`);
