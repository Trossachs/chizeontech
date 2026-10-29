// Shape of content/site.json. The admin edits this object as a whole and
// publishes it; the static build reads the published copy.
export type Feature = { icon: string; title: string; description: string };
export type Layer = { label: string; sub: string; items: string[] };
export type Step = { title: string; description: string };
export type Venture = {
  slug: string; name: string; icon: string; status: string; scene: string; sub: string;
  tagline: string; summary: string; hud: string[];
  problem: { lead: string; body: string }; approach: { lead: string; body: string };
  features: Feature[]; arch: Layer[]; journey: Step[]; note: string;
  about?: { paragraphs: string[]; statement: string; closing: string[] };
  store: { play: string; apple: string; website: string };
  seo: { title: string; description: string };
};
export type Capability = { icon: string; highlight: boolean; title: string; description: string; bullets: string[] };
export type Principle = { icon: string; title: string; description: string };
export type Site = {
  version: number;
  global: { announcement: string; email: string; footerLine: string };
  home: {
    hero: { eyebrow: string; headline1: string; headline2: string; lead: string };
    slides: { venture: string; image: string; alt: string; imageUrl?: string }[];
    about: Record<string, string>;
    ventures: Record<string, string>;
    capabilities: Record<string, string>;
    founder: Record<string, string>;
    contactBox: { heading: string; text: string };
  };
  capabilities: Capability[];
  process: Step[];
  leadership: {
    hero: { heading: string; lead: string };
    founder: { name: string; role: string; initials: string; bio: string };
    principles: Principle[];
    belief: { heading: string; statement: string };
  };
  contact: { heading: string; intro: string };
  ventures: Venture[];
};
