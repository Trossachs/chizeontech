import { useEffect, useState } from 'react';
import { supabase, MEDIA_BUCKET } from './supabase';
import type { Site, Venture, Capability, Principle, Step, Feature, Layer } from './content';
import { Text, Check, Section, ListEditor, StringList } from './fields';
import starter from './site.json';

type Tab = 'global' | 'home' | 'ventures' | 'capabilities' | 'leadership' | 'contact' | 'submissions' | 'publish';
const TABS: [Tab, string][] = [
  ['global', 'Global'], ['home', 'Home'], ['ventures', 'Ventures'], ['capabilities', 'Capabilities'],
  ['leadership', 'Leadership'], ['contact', 'Contact'], ['submissions', 'Messages'], ['publish', 'Publish'],
];

type Status = { kind: 'ok' | 'error' | 'info'; text: string } | null;

export default function Editor({ email }: { email: string }) {
  const [tab, setTab] = useState<Tab>('home');
  const [site, setSite] = useState<Site | null>(null);
  const [saved, setSaved] = useState<string>('');
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  async function load() {
    const { data, error } = await supabase.from('site_content').select('draft,live,published_at').eq('id', 'site').single();
    if (error) return setStatus({ kind: 'error', text: error.message });
    const draft = data.draft as Site;
    const empty = !draft || Object.keys(draft).length === 0;
    setSite(empty ? (structuredClone(starter) as unknown as Site) : draft);
    setSaved(empty ? '' : JSON.stringify(draft));
    setDirty(empty);
    if (!empty) setDirty(false);
  }
  useEffect(() => { load(); }, []);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (!site) return <div className="center muted">{status?.text ?? 'Loading content…'}</div>;

  const update = (fn: (s: Site) => Site) => {
    setSite((prev) => {
      const next = fn(structuredClone(prev!));
      setDirty(JSON.stringify(next) !== saved);
      return next;
    });
  };

  async function saveDraft(): Promise<boolean> {
    setBusy(true);
    const { error } = await supabase.from('site_content').update({ draft: site, updated_at: new Date().toISOString(), updated_by: email }).eq('id', 'site');
    setBusy(false);
    if (error) { setStatus({ kind: 'error', text: 'Save failed: ' + error.message }); return false; }
    setSaved(JSON.stringify(site));
    setDirty(false);
    setStatus({ kind: 'ok', text: 'Draft saved.' });
    return true;
  }

  async function publish() {
    if (dirty && !(await saveDraft())) return;
    if (!confirm('Publish these changes to the live website?')) return;
    setBusy(true);
    const now = new Date().toISOString();
    const { error } = await supabase.from('site_content').update({ live: site, published_at: now, updated_by: email }).eq('id', 'site');
    if (!error) await supabase.from('audit_log').insert({ actor: email, action: 'publish' });
    setBusy(false);
    setStatus(error ? { kind: 'error', text: 'Publish failed: ' + error.message } : { kind: 'ok', text: 'Published. The live site rebuilds in about a minute.' });
  }

  async function discard() {
    if (!confirm('Discard unsaved changes?')) return;
    await load();
    setStatus({ kind: 'info', text: 'Changes discarded.' });
  }

  async function upload(file: File, onUrl: (url: string) => void) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return setStatus({ kind: 'error', text: 'Use JPG, PNG or WebP.' });
    if (file.size > 3 * 1024 * 1024) return setStatus({ kind: 'error', text: 'Image must be 3 MB or smaller.' });
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
    if (error) return setStatus({ kind: 'error', text: 'Upload failed: ' + error.message });
    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
    onUrl(data.publicUrl);
    setStatus({ kind: 'ok', text: 'Image uploaded. Save the draft to keep it.' });
  }

  return (
    <div className="shell">
      <header className="top">
        <div className="brand">Chizeon <span>admin</span></div>
        <div className="top-right">
          <span className="muted">{email}</span>
          <button onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </header>
      <nav className="tabs">
        {TABS.map(([id, label]) => (
          <button key={id} className={tab === id ? 'tab on' : 'tab'} onClick={() => setTab(id)}>{label}</button>
        ))}
      </nav>
      <div className="bar">
        <span className={dirty ? 'dirty' : 'muted'}>{dirty ? 'Unsaved changes' : 'All changes saved in draft'}</span>
        {!saved && <button className="primary" onClick={() => { setDirty(true); setStatus({ kind: 'info', text: 'Starter content loaded. Save the draft, then publish when ready.' }); }}>Load starter content</button>}
        <div className="grow" />
        <button onClick={discard} disabled={!dirty || busy}>Discard</button>
        <button onClick={saveDraft} disabled={!dirty || busy}>Save draft</button>
        <button className="primary" onClick={publish} disabled={busy}>Publish live</button>
      </div>
      {status && <div className={'status ' + status.kind}>{status.text}</div>}

      <main>
        {tab === 'global' && (
          <Section title="Global">
            <Text label="Announcement bar" value={site.global.announcement} onChange={(v) => update((s) => ({ ...s, global: { ...s.global, announcement: v } }))} />
            <Text label="Contact email" value={site.global.email} onChange={(v) => update((s) => ({ ...s, global: { ...s.global, email: v } }))} />
            <Text label="Footer line" value={site.global.footerLine} onChange={(v) => update((s) => ({ ...s, global: { ...s.global, footerLine: v } }))} />
          </Section>
        )}

        {tab === 'home' && (
          <>
            <Section title="Hero" help="The first text visitors read.">
              <Text label="Eyebrow" value={site.home.hero.eyebrow} onChange={(v) => update((s) => ({ ...s, home: { ...s.home, hero: { ...s.home.hero, eyebrow: v } } }))} />
              <Text label="Headline, line 1" value={site.home.hero.headline1} onChange={(v) => update((s) => ({ ...s, home: { ...s.home, hero: { ...s.home.hero, headline1: v } } }))} />
              <Text label="Headline, line 2" hint="(you can use <em>…</em> for the gold word)" value={site.home.hero.headline2} onChange={(v) => update((s) => ({ ...s, home: { ...s.home, hero: { ...s.home.hero, headline2: v } } }))} />
              <Text label="Lead" multiline value={site.home.hero.lead} onChange={(v) => update((s) => ({ ...s, home: { ...s.home, hero: { ...s.home.hero, lead: v } } }))} />
            </Section>

            <Section title="Slideshow" help="Shown under the hero. Upload an image to replace a slide. Images are 16:9 or similar.">
              <ListEditor
                items={site.home.slides}
                onChange={(slides) => update((s) => ({ ...s, home: { ...s.home, slides } }))}
                make={() => ({ venture: '', image: 'rezovex', alt: '' })}
                addLabel="Add slide"
                render={(sl, set) => (
                  <>
                    <Text label="Alt text" value={sl.alt} onChange={(v) => set({ ...sl, alt: v })} />
                    <Text label="Venture page (slug, e.g. rezovex)" value={sl.venture} onChange={(v) => set({ ...sl, venture: v })} />
                    <Text label="Built-in image key (rezovex, propverify, mobility, fuel)" value={sl.image} onChange={(v) => set({ ...sl, image: v })} />
                    {sl.imageUrl && <img className="thumb" src={sl.imageUrl} alt="" />}
                    <label className="field"><span>Replace image</span>
                      <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, (url) => set({ ...sl, imageUrl: url })); }} />
                    </label>
                  </>
                )}
              />
            </Section>

            <Section title="Our story">
              {(['kicker', 'heading1', 'heading2', 'sub', 'statement', 'body1', 'body2', 'tagline'] as const).map((k) => (
                <Text key={k} label={k} multiline={k.startsWith('body') || k === 'statement'} value={site.home.about[k] ?? ''}
                  onChange={(v) => update((s) => ({ ...s, home: { ...s.home, about: { ...s.home.about, [k]: v } } }))} />
              ))}
            </Section>

            <Section title="Product portfolio heading">
              {(['kicker', 'heading', 'intro', 'note'] as const).map((k) => (
                <Text key={k} label={k} multiline={k !== 'kicker' && k !== 'heading'} value={site.home.ventures[k] ?? ''}
                  onChange={(v) => update((s) => ({ ...s, home: { ...s.home, ventures: { ...s.home.ventures, [k]: v } } }))} />
              ))}
            </Section>

            <Section title="Capabilities heading">
              {(['kicker', 'heading', 'intro'] as const).map((k) => (
                <Text key={k} label={k} multiline={k === 'intro'} value={site.home.capabilities[k] ?? ''}
                  onChange={(v) => update((s) => ({ ...s, home: { ...s.home, capabilities: { ...s.home.capabilities, [k]: v } } }))} />
              ))}
            </Section>

            <Section title="Founder note (home)">
              {(['kicker', 'quote', 'name', 'role', 'initials', 'bio'] as const).map((k) => (
                <Text key={k} label={k} multiline={k === 'bio'} value={site.home.founder[k] ?? ''}
                  onChange={(v) => update((s) => ({ ...s, home: { ...s.home, founder: { ...s.home.founder, [k]: v } } }))} />
              ))}
            </Section>

            <Section title="Contact box (bottom of home)">
              <Text label="Heading" value={site.home.contactBox.heading} onChange={(v) => update((s) => ({ ...s, home: { ...s.home, contactBox: { ...s.home.contactBox, heading: v } } }))} />
              <Text label="Text" multiline value={site.home.contactBox.text} onChange={(v) => update((s) => ({ ...s, home: { ...s.home, contactBox: { ...s.home.contactBox, text: v } } }))} />
            </Section>
          </>
        )}

        {tab === 'ventures' && (
          <Section title="Ventures" help="Each venture has its own page. Store links appear on the page once a valid https:// link is entered.">
            <ListEditor<Venture>
              items={site.ventures}
              onChange={(ventures) => update((s) => ({ ...s, ventures }))}
              addLabel="Add venture"
              make={() => ({
                slug: 'new-venture', name: 'New venture', icon: 'spark', status: 'In concept', scene: 'rezovex', sub: '', tagline: '', summary: '', hud: [],
                problem: { lead: '', body: '' }, approach: { lead: '', body: '' }, features: [], arch: [], journey: [], note: '',
                store: { play: '', apple: '', website: '' }, seo: { title: '', description: '' },
              })}
              render={(v, set) => (
                <VentureForm v={v} set={set} />
              )}
            />
          </Section>
        )}

        {tab === 'capabilities' && (
          <>
            <Section title="Capabilities" help="The cards on the home and capabilities pages.">
              <ListEditor<Capability>
                items={site.capabilities}
                onChange={(capabilities) => update((s) => ({ ...s, capabilities }))}
                addLabel="Add capability"
                make={() => ({ icon: 'code', highlight: false, title: '', description: '', bullets: [] })}
                render={(c, set) => (
                  <>
                    <Text label="Title" value={c.title} onChange={(v) => set({ ...c, title: v })} />
                    <Text label="Description" multiline value={c.description} onChange={(v) => set({ ...c, description: v })} />
                    <Text label="Icon (code, layers, flow, coin, verify, spark)" value={c.icon} onChange={(v) => set({ ...c, icon: v })} />
                    <Check label="Gold highlight" value={c.highlight} onChange={(v) => set({ ...c, highlight: v })} />
                    <span className="field"><span>Bullets</span></span>
                    <StringList items={c.bullets} addLabel="Add bullet" onChange={(bullets) => set({ ...c, bullets })} />
                  </>
                )}
              />
            </Section>
            <Section title="How we work" help="The five steps on the capabilities page.">
              <ListEditor<Step>
                items={site.process}
                onChange={(process) => update((s) => ({ ...s, process }))}
                addLabel="Add step"
                make={() => ({ title: '', description: '' })}
                render={(p, set) => (
                  <>
                    <Text label="Title" value={p.title} onChange={(v) => set({ ...p, title: v })} />
                    <Text label="Description" value={p.description} onChange={(v) => set({ ...p, description: v })} />
                  </>
                )}
              />
            </Section>
          </>
        )}

        {tab === 'leadership' && (
          <>
            <Section title="Leadership page heading">
              <Text label="Heading" value={site.leadership.hero.heading} onChange={(v) => update((s) => ({ ...s, leadership: { ...s.leadership, hero: { ...s.leadership.hero, heading: v } } }))} />
              <Text label="Lead" value={site.leadership.hero.lead} onChange={(v) => update((s) => ({ ...s, leadership: { ...s.leadership, hero: { ...s.leadership.hero, lead: v } } }))} />
            </Section>
            <Section title="Founder">
              {(['name', 'role', 'initials', 'bio'] as const).map((k) => (
                <Text key={k} label={k} multiline={k === 'bio'} value={site.leadership.founder[k]}
                  onChange={(v) => update((s) => ({ ...s, leadership: { ...s.leadership, founder: { ...s.leadership.founder, [k]: v } } }))} />
              ))}
            </Section>
            <Section title="Principles">
              <ListEditor<Principle>
                items={site.leadership.principles}
                onChange={(principles) => update((s) => ({ ...s, leadership: { ...s.leadership, principles } }))}
                addLabel="Add principle"
                make={() => ({ icon: 'spark', title: '', description: '' })}
                render={(p, set) => (
                  <>
                    <Text label="Title" value={p.title} onChange={(v) => set({ ...p, title: v })} />
                    <Text label="Description" value={p.description} onChange={(v) => set({ ...p, description: v })} />
                  </>
                )}
              />
            </Section>
            <Section title="Belief statement">
              <Text label="Heading" value={site.leadership.belief.heading} onChange={(v) => update((s) => ({ ...s, leadership: { ...s.leadership, belief: { ...s.leadership.belief, heading: v } } }))} />
              <Text label="Statement" multiline value={site.leadership.belief.statement} onChange={(v) => update((s) => ({ ...s, leadership: { ...s.leadership, belief: { ...s.leadership.belief, statement: v } } }))} />
            </Section>
          </>
        )}

        {tab === 'contact' && (
          <Section title="Contact page">
            <Text label="Heading" value={site.contact.heading} onChange={(v) => update((s) => ({ ...s, contact: { ...s.contact, heading: v } }))} />
            <Text label="Intro" multiline value={site.contact.intro} onChange={(v) => update((s) => ({ ...s, contact: { ...s.contact, intro: v } }))} />
          </Section>
        )}

        {tab === 'submissions' && <Submissions />}
        {tab === 'publish' && <PublishPanel />}
      </main>
    </div>
  );
}

function VentureForm({ v, set }: { v: Venture; set: (v: Venture) => void }) {
  const f = (k: keyof Venture) => (val: string) => set({ ...v, [k]: val } as Venture);
  return (
    <>
      <Text label="Name" value={v.name} onChange={f('name')} />
      <Text label="URL slug (lowercase, no spaces)" value={v.slug} onChange={f('slug')} />
      <Text label="Sub-heading" value={v.sub} onChange={f('sub')} />
      <Text label="Tagline" value={v.tagline} onChange={f('tagline')} />
      <Text label="Summary" multiline value={v.summary} onChange={f('summary')} />
      <Text label="Status (In concept, In development, Launching soon, Live)" value={v.status} onChange={f('status')} />
      <Text label="Status note" multiline value={v.note} onChange={f('note')} />
      <Text label="Icon (chart, shield-home, car, fuel)" value={v.icon} onChange={f('icon')} />
      <Text label="3D scene (rezovex, propverify, mobility, fuel)" hint="(controls which 3D animation loads)" value={v.scene} onChange={f('scene')} />
      <StringList items={v.hud} addLabel="Add highlight chip" onChange={(hud) => set({ ...v, hud })} />

      <h3>Overview</h3>
      <Text label="Problem, heading" value={v.problem.lead} onChange={(x) => set({ ...v, problem: { ...v.problem, lead: x } })} />
      <Text label="Problem, text" multiline value={v.problem.body} onChange={(x) => set({ ...v, problem: { ...v.problem, body: x } })} />
      <Text label="Approach, heading" value={v.approach.lead} onChange={(x) => set({ ...v, approach: { ...v.approach, lead: x } })} />
      <Text label="Approach, text" multiline value={v.approach.body} onChange={(x) => set({ ...v, approach: { ...v.approach, body: x } })} />

      <h3>Planned features</h3>
      <ListEditor<Feature>
        items={v.features}
        onChange={(features) => set({ ...v, features })}
        addLabel="Add feature"
        make={() => ({ icon: 'spark', title: '', description: '' })}
        render={(x, s) => (<>
          <Text label="Title" value={x.title} onChange={(t) => s({ ...x, title: t })} />
          <Text label="Description" value={x.description} onChange={(t) => s({ ...x, description: t })} />
          <Text label="Icon" value={x.icon} onChange={(t) => s({ ...x, icon: t })} />
        </>)}
      />

      <h3>Architecture layers</h3>
      <ListEditor<Layer>
        items={v.arch}
        onChange={(arch) => set({ ...v, arch })}
        addLabel="Add layer"
        make={() => ({ label: '', sub: '', items: [] })}
        render={(x, s) => (<>
          <Text label="Label" value={x.label} onChange={(t) => s({ ...x, label: t })} />
          <Text label="Sub-label" value={x.sub} onChange={(t) => s({ ...x, sub: t })} />
          <StringList items={x.items} addLabel="Add item" onChange={(items) => s({ ...x, items })} />
        </>)}
      />

      <h3>Journey steps</h3>
      <ListEditor<Step>
        items={v.journey}
        onChange={(journey) => set({ ...v, journey })}
        addLabel="Add step"
        make={() => ({ title: '', description: '' })}
        render={(x, s) => (<>
          <Text label="Title" value={x.title} onChange={(t) => s({ ...x, title: t })} />
          <Text label="Description" value={x.description} onChange={(t) => s({ ...x, description: t })} />
        </>)}
      />

      <h3>About section (optional)</h3>
      <StringList
        items={v.about?.paragraphs ?? []}
        addLabel="Add paragraph"
        onChange={(paragraphs) => set({ ...v, about: { statement: v.about?.statement ?? '', closing: v.about?.closing ?? [], paragraphs } })}
      />
      <Text label="Statement" multiline value={v.about?.statement ?? ''} onChange={(t) => set({ ...v, about: { paragraphs: v.about?.paragraphs ?? [], closing: v.about?.closing ?? [], statement: t } })} />

      <h3>App store and links</h3>
      <Text label="Google Play URL" hint="(https:// only; leave blank to hide)" value={v.store.play} onChange={(t) => set({ ...v, store: { ...v.store, play: t } })} />
      <Text label="App Store URL" hint="(https:// only; leave blank to hide)" value={v.store.apple} onChange={(t) => set({ ...v, store: { ...v.store, apple: t } })} />
      <Text label="Website URL (optional)" value={v.store.website} onChange={(t) => set({ ...v, store: { ...v.store, website: t } })} />

      <h3>Search and share</h3>
      <Text label="Page title" value={v.seo.title} onChange={(t) => set({ ...v, seo: { ...v.seo, title: t } })} />
      <Text label="Page description" multiline value={v.seo.description} onChange={(t) => set({ ...v, seo: { ...v.seo, description: t } })} />
    </>
  );
}

function Submissions() {
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState('');
  useEffect(() => {
    supabase.from('form_submissions').select('*').order('created_at', { ascending: false }).limit(100)
      .then(({ data, error }) => (error ? setErr(error.message) : setRows(data ?? [])));
  }, []);
  async function toggle(id: string, handled: boolean) {
    await supabase.from('form_submissions').update({ handled }).eq('id', id);
    setRows((r) => r.map((x) => (x.id === id ? { ...x, handled } : x)));
  }
  return (
    <Section title="Contact messages" help="The 100 most recent messages from the website contact form.">
      {err && <p className="error">{err}</p>}
      {rows.length === 0 && !err && <p className="muted">No messages yet.</p>}
      {rows.map((r) => (
        <div className="list-item" key={r.id}>
          <div className="list-bar">
            <strong>{r.name}</strong> <span className="muted">{r.email}{r.company ? ' · ' + r.company : ''}</span>
            <span className="grow" />
            <span className="muted">{new Date(r.created_at).toLocaleString()}</span>
            <button onClick={() => toggle(r.id, !r.handled)}>{r.handled ? 'Mark unhandled' : 'Mark handled'}</button>
          </div>
          <p><em>{r.topic}</em></p>
          <p style={{ whiteSpace: 'pre-wrap' }}>{r.message}</p>
        </div>
      ))}
    </Section>
  );
}

function PublishPanel() {
  const [rows, setRows] = useState<{ published_at: string | null; updated_by: string | null }>({ published_at: null, updated_by: null });
  useEffect(() => {
    supabase.from('site_content').select('published_at,updated_by').eq('id', 'site').single().then(({ data }) => data && setRows(data));
  }, []);
  return (
    <Section title="Publishing">
      <p>Last published: {rows.published_at ? new Date(rows.published_at).toLocaleString() : 'never'}</p>
      <p className="muted">Save the draft as you go. Only Publish changes the live website. The public site rebuilds automatically when a publish happens.</p>
    </Section>
  );
}
