import os
import json
import re, os, html, json
D=os.path.dirname(os.path.abspath(__file__))
rd=lambda n:open(os.path.join(D,n)).read()
CSS=rd('base.css'); BJS=rd('base.js'); SJS=rd('scenes.js'); HJS=rd('hero.js')
LOGO=open(os.path.join(D,'logo.txt')).read().strip()
IMGS=json.load(open(os.path.join(D,'imgs.json')))
THREE='<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
FONTS='''<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">'''
STYLE='<style>\n:root{--logo:url("'+LOGO+'")}\n'+CSS+'\n</style>'
SB_URL=os.environ.get('SUPABASE_URL','').strip()
SB_KEY=os.environ.get('SUPABASE_ANON_KEY','').strip()
CFG_JS='<script>window.CHIZEON_SUPABASE='+json.dumps({'url':SB_URL,'key':SB_KEY})+';</script>' if SB_URL and SB_KEY else ''

ICONS='''<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<symbol id="i-chart" viewBox="0 0 24 24"><rect x="3" y="14" width="4" height="7" rx="1"/><rect x="10" y="11" width="4" height="10" rx="1"/><rect x="17" y="8" width="4" height="13" rx="1"/><path d="M3 8.5l5-3.5 4 2.5 8-5"/></symbol>
<symbol id="i-shield-home" viewBox="0 0 24 24"><path d="M12 3l7.5 2.8v5.6c0 4.6-3.1 8.2-7.5 9.6-4.4-1.4-7.5-5-7.5-9.6V5.8z"/><path d="M8.6 12.4L12 9.4l3.4 3v3.4H8.6z"/></symbol>
<symbol id="i-car" viewBox="0 0 24 24"><path d="M3 15v-3l2-5h14l2 5v3z"/><path d="M3 12h18"/><circle cx="7.5" cy="17.5" r="1.6"/><circle cx="16.5" cy="17.5" r="1.6"/></symbol>
<symbol id="i-fuel" viewBox="0 0 24 24"><path d="M5 21V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16"/><path d="M3.5 21h12M14 9h2a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V8l-3-3"/><path d="M7.5 7h4v3h-4z"/></symbol>
<symbol id="i-code" viewBox="0 0 24 24"><path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/></symbol>
<symbol id="i-layers" viewBox="0 0 24 24"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 12.5l9 5 9-5M3 17l9 5 9-5"/></symbol>
<symbol id="i-flow" viewBox="0 0 24 24"><path d="M4 7h10a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h12"/><path d="M17 16l3 3-3 3"/><path d="M7 4L4 7l3 3"/></symbol>
<symbol id="i-coin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M14.8 9.2c-.5-1-1.5-1.5-2.8-1.5-1.6 0-2.7.8-2.7 2 0 3 5.6 1.4 5.6 4.3 0 1.2-1.2 2-2.9 2-1.4 0-2.5-.6-3-1.7M12 6v1.7M12 16.3V18"/></symbol>
<symbol id="i-verify" viewBox="0 0 24 24"><path d="M12 3l7.5 2.8v5.6c0 4.6-3.1 8.2-7.5 9.6-4.4-1.4-7.5-5-7.5-9.6V5.8z"/><path d="M8.6 12l2.5 2.5 4.4-4.9"/></symbol>
<symbol id="i-spark" viewBox="0 0 24 24"><path d="M12 3l2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4z"/></symbol>
<symbol id="i-play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/></symbol>
<symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
<symbol id="i-chev" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></symbol>
<symbol id="i-copy" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></symbol>
<symbol id="i-dot" viewBox="0 0 24 24"><path d="M12 4l8 8-8 8-8-8z"/></symbol>
<symbol id="i-wallet" viewBox="0 0 24 24"><path d="M4 7a2 2 0 0 1 2-2h11v3"/><path d="M4 7v10a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1H6a2 2 0 0 1-2-2z"/><circle cx="16" cy="14" r="1.2"/></symbol>
<symbol id="i-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></symbol>
<symbol id="i-lock" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></symbol>
<symbol id="i-doc" viewBox="0 0 24 24"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M9.5 12h6M9.5 15.5h6"/></symbol>
<symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></symbol>
<symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>
<symbol id="i-users" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 5.2a3 3 0 0 1 0 5.6M18 14.3c1.8.8 3 2.5 3 5.7"/></symbol>
<symbol id="i-route" viewBox="0 0 24 24"><circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8 18h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7"/></symbol>
<symbol id="i-bell" viewBox="0 0 24 24"><path d="M6 17v-6a6 6 0 0 1 12 0v6l1.5 2h-15z"/><path d="M10 21a2 2 0 0 0 4 0"/></symbol>
<symbol id="i-drop" viewBox="0 0 24 24"><path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z"/></symbol>
<symbol id="i-card" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 10h18M7 15h4"/></symbol>
<symbol id="i-map" viewBox="0 0 24 24"><path d="M9 4L3 6.5v13L9 17l6 3 6-2.5v-13L15 7z"/><path d="M9 4v13M15 7v13"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></symbol>
<symbol id="i-mail" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/></symbol>
<symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></symbol>
<symbol id="i-truck" viewBox="0 0 24 24"><path d="M2 16V7h11v9M13 10h4l3 3v3h-7"/><circle cx="7" cy="17" r="1.8"/><circle cx="17" cy="17" r="1.8"/></symbol>
<symbol id="i-swap" viewBox="0 0 24 24"><path d="M4 8h14l-3-3M20 16H6l3 3"/></symbol>
<symbol id="i-trend" viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></symbol>
<symbol id="i-chat" viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></symbol>
<symbol id="i-up" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></symbol>
</svg>'''

LOADER='''<div class="loader" id="loader" role="status" aria-live="polite" aria-label="Loading Chizeon"><div class="cc"><svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="ccg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1e4bd"/><stop offset=".5" stop-color="#c4a263"/><stop offset="1" stop-color="#7a6130"/></linearGradient></defs><g class="o"><circle cx="60" cy="60" r="50" fill="none" stroke="url(#ccg)" stroke-width="9" stroke-linecap="round" stroke-dasharray="244.3 69.8" transform="rotate(40 60 60)"/></g><g class="i"><circle cx="60" cy="60" r="32" fill="none" stroke="#b8975a" stroke-width="16" stroke-linecap="round" stroke-dasharray="156.4 44.7" transform="rotate(40 60 60)"/><circle cx="60" cy="60" r="32" fill="none" stroke="#0a0a0b" stroke-width="12.5" stroke-linecap="round" stroke-dasharray="156.4 44.7" transform="rotate(40 60 60)"/></g></svg></div><p>Chizeon</p></div>'''

def ic(n): return f'<svg class="ic"><use href="#i-{n}"/></svg>'

def store_badges(v):
  s=v.get("store",{}); slug=v["slug"]
  def one(k,small,big,icon):
    u=s.get(k,'')
    on=u.startswith('https://')
    return f'<a class="store{"" if on else " off"}" data-v="{slug}" data-k="{k}" href="{u if on else "#"}"{" target=\"_blank\" rel=\"noopener\"" if on else " aria-disabled=\"true\""}>{icon}<span><small>{small}</small><b>{big}</b></span></a>'
  play='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2.5v19l10-9.5z" fill="#35d07f"/><path d="M4 2.5l12.5 7.3-2.5 2.2z" fill="#3b9cff"/><path d="M4 21.5l12.5-7.3-2.5-2.2z" fill="#ff4d4d"/><path d="M16.5 9.8l3.6 2.2-3.6 2.2-2.5-2.2z" fill="#ffc83d"/></svg>'
  app='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" fill="#2f8cff"/><path d="M8 17l5.5-10M16 17l-5.5-10M7.5 14h9" stroke="#fff" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>'
  return '<div class="stores" role="group" aria-label="Download the app">'+one('play','GET IT ON','Google Play',play)+one('apple','Download on the','App Store',app)+'</div>'

import json as _json
S=_json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'site.json')))
def build_ventures(S):
  out=[]
  for d in S['ventures']:
    v=dict(d)
    v['features']=[(f['icon'],f['title'],f['description']) for f in d['features']]
    v['arch']=[(a['label'],a['sub'],a['items']) for a in d['arch']]
    v['journey']=[(j['title'],j['description']) for j in d['journey']]
    v['problem']=(d['problem']['lead'],d['problem']['body'])
    v['approach']=(d['approach']['lead'],d['approach']['body'])
    ab=d.get('about')
    if ab and ab.get('paragraphs'):
      v['about']=ab['paragraphs']; v['closing']=tuple(ab.get('closing',[]))
    else:
      v.pop('about',None); v['closing']=('','')
    v['pill']={'In concept':'concept','In development':'dev','Launching soon':'gold','Live':'live'}.get(d['status'],'concept')
    v['store']=d.get('store',{})
    out.append(v)
  return out
VENTURES=build_ventures(S)
for _s in S['home']['slides']:
  if _s.get('imageUrl') and _s['image'] in IMGS: IMGS[_s['image']]=dict(IMGS[_s['image']],uri=_s['imageUrl'])
STAGES=['In concept','In development','Launching soon','Live']

def nav(active,root):
  idx='' if root else 'index.html'
  h='#home' if root else 'index.html'
  ab='#about' if root else 'index.html#about'
  vn='#ventures' if root else 'index.html#ventures'
  def a(href,label,key,sec=None):
    cls=' class="active"' if active==key else ''
    sd=f' data-sec="{sec}"' if sec else ''
    return f'<a href="{href}"{sd}{cls}>{label}</a>'
  items=''.join(f'<a href="{v["slug"]}.html" role="menuitem">{v["name"]}<small>{v["status"]}</small></a>' for v in VENTURES)
  vact=' active' if active=='ventures' else ''
  return f'''<nav class="nav-links" id="navLinks" aria-label="Main">
      {a(h,'Home','home','home' if root else None)}
      {a(ab,'About','about','about' if root else None)}
      <div class="dd" id="dd">
        <button class="dd-btn{vact}" id="ddBtn" type="button" data-sec="ventures" aria-expanded="false" aria-haspopup="true">Ventures {ic('chev')}</button>
        <div class="dd-menu" role="menu"><a href="{vn}" role="menuitem">All ventures</a>{items}</div>
      </div>
      {a('capabilities.html','Capabilities','capabilities')}
      {a('leadership.html','Leadership','leadership')}
      {a('contact.html','Contact','contact')}
      <a class="cta cta-mobile" href="contact.html">Partner With Us {ic('arrow')}</a>
    </nav>'''

def header(active,root):
  home='#home' if root else 'index.html'
  return f'''<header class="site-head">
  <div class="wrap bar">
    <a class="brand" href="{home}" aria-label="Chizeon Technologies Ltd, home"><span class="logo" role="img" aria-label="Chizeon Technologies Ltd"></span></a>
    {nav(active,root)}
    <div class="head-right">
      <a class="cta cta-desktop" href="contact.html">Partner With Us {ic('arrow')}</a>
      <button class="nav-toggle" id="navToggle" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="navLinks"><span></span></button>
    </div>
  </div>
  <div class="prog" id="prog"></div>
</header>'''

def footer(root):
  p='' if root else 'index.html'
  return f'''<footer>
  <div class="wrap foot-row">
    <span class="logo logo-sm" role="img" aria-label="Chizeon Technologies Ltd"></span>
    <div class="foot-mid"><div>&copy; <span id="year">2026</span> Chizeon Technologies Ltd. All rights reserved.</div><div>Technology that moves life forward.</div></div>
    <div class="foot-links"><a href="{'#about' if root else 'index.html#about'}">About</a><a href="rezovex.html">Rezovex</a><a href="propverify.html">PropVerify</a><a href="capabilities.html">Capabilities</a><a href="leadership.html">Leadership</a><a href="contact.html">Contact</a></div>
  </div>
</footer>
<button class="to-top" id="toTop" type="button" aria-label="Back to top">{ic('up')}</button>'''

_origin=os.environ.get('SITE_URL','').strip().rstrip('/')
if not _origin and os.environ.get('VERCEL_PROJECT_PRODUCTION_URL','').strip():
  _origin='https://'+os.environ['VERCEL_PROJECT_PRODUCTION_URL'].strip().rstrip('/')
SHARE_IMG=(_origin+'/share-card.png') if _origin else 'share-card.png'

def page(title,desc,body,scripts,index=False):
  d=html.escape(desc,quote=True); t=html.escape(title,quote=True)
  social=(f'<meta name="theme-color" content="#0a0a0b">\n<meta property="og:site_name" content="Chizeon Technologies Ltd">\n'
          f'<meta property="og:type" content="website">\n<meta property="og:title" content="{t}">\n<meta property="og:description" content="{d}">\n'
          f'<meta property="og:image" content="'+SHARE_IMG+'">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta property="og:image:alt" content="Chizeon Technologies Ltd. Innovate. Develop. Deliver.">\n'
          f'<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="{t}">\n<meta name="twitter:description" content="{d}">\n<meta name="twitter:image" content="'+SHARE_IMG+'">\n'
          )
  head=CFG_JS+f'<title>{title}</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n<meta name="description" content="{d}">\n{social}{FONTS}\n{STYLE}\n'
  if index:
    return head+LOADER+'\n'+ICONS+'\n'+body+'\n'+scripts
  return ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'+head+
          '<style>:root{padding-block:env(safe-area-inset-top,0px) env(safe-area-inset-bottom,0px)}</style>\n</head>\n<body>\n'+LOADER+'\n'+ICONS+'\n'+body+'\n'+scripts+'\n</body>\n</html>\n')

def ctabox(h2=None,p=None):
  h2=h2 or S['home']['contactBox']['heading']; p=p or S['home']['contactBox']['text']
  return f'''<div class="contact-box raise-d" data-rv>
        <div><div class="kicker">Start a conversation</div><h2>{h2}</h2><p>{p}</p></div>
        <div class="contact-actions">
          <a class="cta lg" href="contact.html">Contact Chizeon {ic('arrow')}</a>
          <div class="mail-row"><code id="mailText">hello@chizeon.com</code><button class="copy" type="button" data-copy="hello@chizeon.com" data-target="#mailText">{ic('copy')}<span>Copy</span></button></div>
        </div>
      </div>'''

# ---------------- home ----------------
def home():
  vbar=''.join(f'<a class="v-item" href="{v["slug"]}.html"><span class="tile">{ic(v["icon"])}</span><div><h3>{v["name"]}</h3><p>{v["sub"]}</p></div><span class="pill {v["pill"]}">{v["status"]}</span></a>' for v in VENTURES)
  vcards=''.join(f'''<a class="card tilt vcard" href="{v["slug"]}.html"><div class="top"><span class="tile">{ic(v["icon"])}</span><span class="pill {v["pill"]}">{v["status"]}</span></div><div class="big-name">{v["name"]}</div><p>{v["summary"]}</p><ul>{"".join("<li>"+f[1]+"</li>" for f in v["features"][:3])}</ul><div class="foot"><span>{v["sub"]}</span><span class="more">Explore {ic('arrow')}</span></div></a>''' for v in VENTURES)
  _vmap={v['slug']:v for v in VENTURES}
  order=[(s['image'],(('index' if False else '')+s['venture']+'.html'),s['alt'],(_vmap[s['venture']]['tagline'] if s['venture'] in _vmap else ''),(s['image']=='rezovex')) for s in S['home']['slides']]
  slides=''.join(f'<div class="slide{" active" if i==0 else ""}{" multiply" if k=="rezovex" else ""}" aria-hidden="true"><img src="{IMGS[k]["uri"]}" width="{IMGS[k]["w"]}" height="{IMGS[k]["h"]}" alt="{nm}. {al}"{"" if i==0 else " loading=\"lazy\""}></div>' for i,(k,href,nm,al,bl) in enumerate(order))
  dots=''.join(f'<button type="button" class="{"on" if i==0 else ""}" role="tab" aria-selected="{"true" if i==0 else "false"}" aria-label="Show {o[2]}"></button>' for i,o in enumerate(order))
  caps=[(c['icon'],'gold' if c['highlight'] else '',c['title'],c['description']) for c in S['capabilities']]
  capcards=''.join(f'<article class="card tilt"><span class="tile {g}">{ic(i)}</span><h3>{t}</h3><p>{p}</p></article>' for i,g,t,p in caps)
  body=f'''{header('home',True)}
<main>
  <section class="hero" id="home" style="padding-block:clamp(40px,6vw,76px) clamp(150px,13vw,210px)">
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <div class="eyebrow">{S["home"]["hero"]["eyebrow"]}</div>
        <h1><span class="ln">{S["home"]["hero"]["headline1"]}</span><span class="ln">{S["home"]["hero"]["headline2"]}</span></h1>
        <p class="lead">{S["home"]["hero"]["lead"]}</p>
        <div class="actions">
          <a class="cta lg" href="#ventures">Explore Our Ventures {ic('arrow')}</a>
          <a class="btn-ghost" href="#about">{ic('play')} Discover Chizeon</a>
        </div>
      </div>
    </div>
    <div class="globe-stage" id="stage" aria-label="Rotating 3D globe with connected cities">
      <div class="orb"></div>
      <canvas id="globe"></canvas>
      <svg class="streaks" viewBox="0 0 900 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="sk1" x1="0" x2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#fff4d6"/></linearGradient>
          <linearGradient id="sk2" x1="0" x2="1"><stop offset="0" stop-color="#b8975a" stop-opacity="0"/><stop offset="1" stop-color="#e8d49a"/></linearGradient>
        </defs>
        <path d="M30 380C130 300 230 270 330 290" stroke="url(#sk1)" stroke-width="2.4"/>
        <path d="M70 450C170 380 250 350 330 360" stroke="url(#sk2)" stroke-width="1.6"/>
        <path d="M560 70C700 40 820 90 880 170" stroke="url(#sk2)" stroke-width="1.8"/>
      </svg>
    </div>
    <canvas class="city" id="city" aria-hidden="true"></canvas>
  </section>

  <section class="vsec" aria-label="Chizeon ventures">
    <div class="wrap">
      <div class="vshow" id="vshow" data-rv="zoom" role="img" aria-label="Chizeon ventures: Rezovex, PropVerify, Mobility Platform and Mobile Fuel Delivery"><div class="vs-stage">{slides}</div></div>
    </div>
  </section>

  <section id="about">
    <div class="wrap">
      <div class="about-panel raise" data-rv>
        <div class="about-copy">
          <div class="kicker">{S["home"]["about"]["kicker"]}</div>
          <h2>{S["home"]["about"]["heading1"]} <span class="g">{S["home"]["about"]["heading2"]}</span></h2>
          <p class="sub">{S["home"]["about"]["sub"]}</p>
          <div class="statement">{S["home"]["about"]["statement"]}</div>
          <p class="body">We are a technology company creating digital products, infrastructure and intelligent services for the real needs of everyday living. From financial access to verification, automation and future-facing services, our ambition is to turn complex challenges into experiences that feel simple, useful and human.</p>
          <p class="body" style="margin-top:12px">Our mission is bigger than a single product or market. We want to help shape a future where world-class technology is created, adopted and scaled from Nigeria and across Africa — with the quality, ambition and relevance to serve the world.</p>
          <ul class="principles">
            <li>{ic('dot')}Make innovation accessible</li><li>{ic('dot')}Build with the best</li><li>{ic('dot')}Scale beyond borders</li><li>{ic('dot')}Grow the ecosystem</li>
          </ul>
        </div>
        <div class="inf-wrap" id="infWrap">
          <div class="inf-float"><div class="inf3d" id="inf3d"><div class="plaque"><span class="logo-full" role="img" aria-label="Chizeon Technologies Ltd. Innovate. Develop. Deliver."></span></div></div></div>
          <p class="tagline">{S["home"]["about"]["tagline"]}</p>
        </div>
      </div>
      <div class="stats raise-d" data-rv="zoom">
        <div class="stat"><b>Collaboration over rivalry</b><span>The strongest technology ecosystems are built through shared knowledge, trusted partnerships and complementary strengths.</span></div>
        <div class="stat"><b>Access over exclusivity</b><span>Innovation should not be reserved for the wealthy. We work toward solutions that are practical, inclusive and within reach.</span></div>
        <div class="stat"><b>Impact over noise</b><span>We measure progress by the problems we solve, the time we give back and the opportunities we help unlock.</span></div>
      </div>
    </div>
  </section>

  <section id="ventures" class="band-dark">
    <div class="wrap">
      <div class="sec-head" data-rv><div class="kicker">{S["home"]["ventures"]["kicker"]}</div><h2>{S["home"]["ventures"]["heading"]}</h2><p>{S["home"]["ventures"]["intro"]}</p></div>
      <div class="vslider" data-rv>
        <div class="vs-track" id="vsTrack" tabindex="0" role="group" aria-roledescription="carousel" aria-label="Ventures. Swipe or use the arrows.">{vcards}</div>
        <div class="vs-ctrl"><button class="sl-btn prev" id="vsPrev" type="button" aria-label="Previous ventures">{ic('chev')}</button><div class="vs-pager" id="vsPager"></div><button class="sl-btn next" id="vsNext" type="button" aria-label="Next ventures">{ic('chev')}</button></div>
      </div>
      <p class="note" data-rv="fade">{S["home"]["ventures"]["note"]}</p>
    </div>
  </section>

  <section id="capabilities">
    <div class="wrap">
      <div class="sec-head" data-rv><div class="kicker">{S["home"]["capabilities"]["kicker"]}</div><h2>{S["home"]["capabilities"]["heading"]}</h2><p>{S["home"]["capabilities"]["intro"]}</p></div>
      <div class="grid g3" data-stagger="100">{capcards}</div>
      <div class="sec-foot" data-rv="fade"><a class="btn-dark" href="capabilities.html">Explore all capabilities {ic('arrow')}</a></div>
    </div>
  </section>

  <section id="leadership" class="band-soft">
    <div class="wrap">
      <div class="sec-head" data-rv><div class="kicker">{S["home"]["founder"]["kicker"]}</div><h2>{S["home"]["founder"]["quote"]}</h2></div>
      <div class="founder raise-d" data-rv="zoom">
        <div class="portrait" aria-hidden="true">EC</div>
        <div><h3>{S["home"]["founder"]["name"]}</h3><div class="role">{S["home"]["founder"]["role"]}</div><p>{S["home"]["founder"]["bio"]}</p><div class="btn-row"><a class="cta" href="leadership.html">Meet our leadership {ic('arrow')}</a></div></div>
      </div>
    </div>
  </section>

  <section id="contact" class="band-dark">
    <div class="wrap">
      {ctabox()}
    </div>
  </section>
</main>
{footer(True)}'''
  scripts='<script>\n'+BJS+'\n</script>\n'+THREE+'\n<script>\n'+HJS+'\n</script>'
  return page('Chizeon Technologies Ltd','Chizeon Technologies builds thoughtful technology for everyday life — creating accessible digital products and collaborating to advance Nigeria and Africa.',body,scripts,index=True)

# ---------------- venture pages ----------------
def venture(i):
  v=VENTURES[i]; prev=VENTURES[i-1]; nxt=VENTURES[(i+1)%len(VENTURES)]
  feats=''.join(f'<article class="card tilt"><span class="tile">{ic(ico)}</span><h3>{t}</h3><p>{p}</p></article>' for ico,t,p in v['features'])
  layers=''
  for k,(lab,sub,items) in enumerate(v['arch']):
    if k: layers+='<div class="link" aria-hidden="true"></div>'
    layers+=f'<div class="layer"><div class="lab">{lab}<small>{sub}</small></div><div class="items">'+''.join(f'<span>{x}</span>' for x in items)+'</div></div>'
  steps=''.join(f'<div class="step"><div class="n">{n+1}</div><h4>{t}</h4><p>{p}</p></div>' for n,(t,p) in enumerate(v['journey']))
  cur=STAGES.index(v['status'])
  track=''
  for n,s in enumerate(STAGES):
    cls='done' if n<cur else 'now' if n==cur else ''
    mark=ic('check') if n<cur else str(n+1)
    sm='Current status' if n==cur else ('Completed' if n<cur else 'Ahead')
    track+=f'<li class="{cls}"><span class="dot">{mark}</span><div><b>{s}</b><small>{sm}</small></div></li>'
  chips=''.join(f'<span>{c}</span>' for c in v['hud'])
  about_html=''
  if v.get('about'):
    about_html='<section id="about-v"><div class="wrap"><div class="sec-head" data-rv><div class="kicker">About '+v['name']+'</div><h2>'+v['tagline']+'</h2></div><div class="about-v" data-rv>'+''.join('<p>'+p+'</p>' for p in v['about'])+'<div class="statement">'+v['closing'][0]+'</div><p class="closing"><strong>'+v['closing'][1]+'</strong></p></div></div></section>\n\n'
  body=f'''{header('ventures',False)}
<main>
<section class="phero dark-ctx">
  <div class="wrap phero-grid">
    <div>
      <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span class="sep">/</span><a href="index.html#ventures">Ventures</a><span class="sep">/</span><span>{v['name']}</span></nav>
      <div class="status-row"><span class="pill {v['pill']}">{v['status']}</span><span class="tag">{v['sub']}</span></div>
      <h1>{v['name']}</h1>
      <p class="lead">{v['tagline']} {v['summary']}</p>
      <div class="actions"><a class="cta lg" href="contact.html">Talk to us about {v['name']} {ic('arrow')}</a><a class="btn-ghost" href="#build">{ic('play')} See how it is built</a></div>
      <div class="getapp"><span class="getapp-l">Get the app</span>{store_badges(v)}<small class="getapp-n" data-soon hidden>Store links coming soon.</small></div>
    </div>
    <div>
      <div class="stage3d"><canvas id="scene" role="img" aria-label="Animated 3D concept visual for {v['name']}"></canvas><div class="hud">{chips}</div></div>
      <p class="stage-cap">Animated concept visual. Drag across it to shift the view. It is not a product screen.</p>
    </div>
  </div>
</section>

{about_html}<section id="overview">
  <div class="wrap">
    <div class="sec-head" data-rv><div class="kicker">Overview</div><h2>Why {v['name']} exists.</h2></div>
    <div class="two-up" data-stagger="140">
      <article class="card tilt"><span class="kicker">The challenge</span><p class="big">{v['problem'][0]}</p><p>{v['problem'][1]}</p></article>
      <article class="card tilt"><span class="kicker">Our approach</span><p class="big">{v['approach'][0]}</p><p>{v['approach'][1]}</p></article>
    </div>
  </div>
</section>

<section class="band-dark" id="features">
  <div class="wrap">
    <div class="sec-head" data-rv><div class="kicker">What it offers</div><h2>Planned features.</h2><p>The core capabilities {v['name']} is being shaped around.</p></div>
    <div class="grid g3" data-stagger="100">{feats}</div>
  </div>
</section>

<section class="band-soft" id="build">
  <div class="wrap">
    <div class="sec-head" data-rv><div class="kicker">How it is built</div><h2>Platform architecture.</h2><p>Each layer hands work to the next, from the apps people use to the partners that connect {v['name']} to the wider world.</p></div>
    <div class="arch raise-d" style="padding:clamp(18px,3vw,34px);border-radius:28px" data-rv="zoom">{layers}</div>
    <p class="note" style="color:var(--muted)" data-rv="fade">Planned architecture. It shows the intended structure and may change as the venture develops.</p>
  </div>
</section>

<section class="band-dark" id="journey">
  <div class="wrap">
    <div class="sec-head" data-rv><div class="kicker">The user journey</div><h2>From first tap to done.</h2><p>How a person moves through {v['name']}, step by step.</p></div>
    <div class="steps" data-stagger="110">{steps}</div>
  </div>
</section>

<section id="status">
  <div class="wrap">
    <div class="sec-head" data-rv><div class="kicker">Where it stands</div><h2>Current status.</h2></div>
    <div class="raise" style="padding:clamp(22px,3.5vw,40px);border-radius:28px" data-rv="zoom">
      <ol class="track">{track}</ol>
      <p style="margin-top:26px;color:var(--muted);max-width:46rem">{v['note']}</p>
    </div>
  </div>
</section>

<section class="band-dark" style="padding-bottom:clamp(40px,6vw,70px)">
  <div class="wrap">
    {ctabox('Interested in '+v['name']+'?','Talk to Chizeon about partnerships, early access and collaboration.')}
    <div class="pn" style="margin-top:28px" data-stagger="120">
      <a class="raise-d tilt" href="{prev['slug']}.html"><small>Previous venture</small><b>{prev['name']}</b></a>
      <a class="raise-d tilt" href="{nxt['slug']}.html"><small>Next venture</small><b>{nxt['name']}</b></a>
    </div>
  </div>
</section>
</main>
{footer(False)}'''
  scripts='<script>\n'+BJS+'\n</script>\n'+THREE+'\n<script>\n'+SJS+'\ntry{ChizeonScenes.'+v['scene']+'(document.getElementById("scene"));}catch(e){document.documentElement.classList.add("no-webgl");}\n</script>'
  return page(v['name']+' | Chizeon Technologies Ltd',v['summary'],body,scripts)

# ---------------- capabilities ----------------
def capabilities():
  caps=[(c['icon'],'gold' if c['highlight'] else '',c['title'],c['description'],c['bullets']) for c in S['capabilities']]
  cards=''.join(f'<article class="card tilt"><span class="tile {g}">{ic(i)}</span><h3>{t}</h3><p>{p}</p><ul>'+''.join(f'<li>{b}</li>' for b in bl)+'</ul></article>' for i,g,t,p,bl in caps)
  deck=''.join(f'<article class="card dcard"><div class="dtop"><span class="tile {g}">{ic(i)}</span><span class="dn">{n+1:02d} / {len(caps):02d}</span></div><h3>{t}</h3><p>{p}</p><ul>'+''.join(f'<li>{b}</li>' for b in bl)+'</ul></article>' for n,(i,g,t,p,bl) in enumerate((x[0],x[1],x[2],x[3],x[4]) for x in caps))
  proc=[(p['title'],p['description']) for p in S['process']]
  steps=''.join(f'<div class="step"><div class="n">{n+1}</div><h4>{t}</h4><p>{p}</p></div>' for n,(t,p) in enumerate(proc))
  body=f'''{header('capabilities',False)}
<main>
<section class="phero dark-ctx">
  <div class="wrap phero-grid">
    <div>
      <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span class="sep">/</span><span>Capabilities</span></nav>
      <div class="kicker">What we do</div>
      <h1>Technology that connects ideas to <em>outcomes.</em></h1>
      <p class="lead">Our capabilities span the product journey, from identifying a problem to designing, building and improving a digital solution.</p>
      <div class="actions"><a class="cta lg" href="contact.html">Start a project {ic('arrow')}</a><a class="btn-ghost" href="#all">{ic('play')} See capabilities</a></div>
    </div>
    <div class="deck-wrap"><div class="deck" id="deck" tabindex="0" role="group" aria-roledescription="carousel" aria-label="Capabilities. Swipe a card to see the next.">{deck}</div>
      <div class="deck-ctrl"><button class="sl-btn prev" id="dkPrev" type="button" aria-label="Previous capability">{ic('chev')}</button><span class="deck-hint" id="dkHint">Swipe the card</span><button class="sl-btn next" id="dkNext" type="button" aria-label="Next capability">{ic('chev')}</button></div></div>
  </div>
</section>

<section id="all">
  <div class="wrap">
    <div class="sec-head" data-rv><div class="kicker">Six capabilities</div><h2>What we can build with you.</h2><p>Each capability below can stand alone or combine with the others inside one product.</p></div>
    <div class="grid g3" data-stagger="100">{cards}</div>
  </div>
</section>

<section class="band-dark">
  <div class="wrap">
    <div class="sec-head" data-rv><div class="kicker">How we work</div><h2>A clear path from idea to product.</h2><p>The same five stages guide our own ventures and the work we do with partners.</p></div>
    <div class="steps" data-stagger="110">{steps}</div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sec-head" data-rv><div class="kicker">Put it to work</div><h2>See the capabilities inside our ventures.</h2></div>
    <div class="grid g4" data-stagger="100">''' + ''.join(f'<a class="card tilt" href="{v["slug"]}.html"><span class="tile">{ic(v["icon"])}</span><h3>{v["name"]}</h3><p>{v["sub"]}</p><div class="foot"><span class="pill {v["pill"]}">{v["status"]}</span><span class="more">View {ic("arrow")}</span></div></a>' for v in VENTURES) + f'''</div>
  </div>
</section>

<section class="band-dark">
  <div class="wrap">{ctabox('Have a project in mind?','Tell us what you want to build and we will take it from there.')}</div>
</section>
</main>
{footer(False)}'''
  scripts='<script>\n'+BJS+'\n</script>'
  return page('Capabilities | Chizeon Technologies Ltd','What Chizeon Technologies builds: software, infrastructure, automation, fintech, verification technology and venture development.',body,scripts)

# ---------------- leadership ----------------
def leadership():
  pr=[(p['title'],p['description']) for p in S['leadership']['principles']]
  cards=''.join(f'<article class="card tilt"><span class="tile gold">{ic(["spark","lock","flow","trend"][i])}</span><h3>{t}</h3><p>{p}</p></article>' for i,(t,p) in enumerate(pr))
  body=f'''{header('leadership',False)}
<main>
<section class="phero dark-ctx">
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span class="sep">/</span><span>Leadership</span></nav>
    <div class="kicker">Leadership</div>
    <h1>A note from our <em>founder.</em></h1>
    <p class="lead">The belief behind Chizeon.</p>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="founder raise-d" data-rv="zoom">
      <div class="portrait" aria-hidden="true">EC</div>
      <div><h3>Eze Rejoice Chidera</h3><div class="role">Founder &amp; Chief Executive Officer</div><p class="quote-big">“The next era of technology must be one everyone can participate in.”</p><p>My passion for technology comes from a simple conviction: some of life’s hardest problems can become easier when we have the courage to think differently and the discipline to build solutions that work.</p><p>My academic journey at the University of Nigeria, Nsukka, helped shape my outlook and strengthened my belief in the power of knowledge, possibility and African ingenuity. Chizeon is an expression of that belief — a commitment to build technology that serves real people and responds to real needs.</p><p>I do not see the technology industry as a space where one company must win by making another lose. I see an ecosystem where founders, established institutions, innovators, investors and communities can collaborate to create something far greater than any one of us could build alone.</p><p>Our ambition is to make advanced technology more affordable, more accessible and more useful — whether it helps someone manage money across borders, make a more confident property decision, or solve a daily challenge that once felt unnecessarily difficult. The future should not belong only to those who can afford the most. Everyone deserves the chance to experience what technology can make possible.</p><div class="btn-row"><a class="cta" href="contact.html">Get in touch {ic('arrow')}</a></div></div>
    </div>
  </div>
</section>

<section class="band-soft">
  <div class="wrap">
    <div class="sec-head" data-rv><div class="kicker">The future we are building</div><h2>Made with African ambition. Built for human progress.</h2><p>We envision a future where Africa does not only adopt technology — it helps define what technology becomes.</p></div>
    <div class="grid g4" data-stagger="100">{cards}</div>
  </div>
</section>

<section class="band-dark">
  <div class="wrap">
    <div class="sec-head" data-rv><div class="kicker">What we believe</div><h2>The future is not a race to outdo one another.</h2></div>
    <div class="statement" style="color:#fff;max-width:52rem" data-rv>It is an opportunity to build together.</div>
    <div style="margin-top:46px">{ctabox()}</div>
  </div>
</section>
</main>
{footer(False)}'''
  scripts='<script>\n'+BJS+'\n</script>'
  return page('Leadership | Chizeon Technologies Ltd','A note from the founder of Chizeon Technologies Ltd and the future the company is building.',body,scripts)

# ---------------- contact ----------------
def contact():
  vlinks=''.join(f'<li>{ic("arrow")}<a href="{v["slug"]}.html">{v["name"]}</a></li>' for v in VENTURES)
  body=f'''{header('contact',False)}
<main>
<section class="phero dark-ctx">
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span class="sep">/</span><span>Contact</span></nav>
    <div class="kicker">Start a conversation</div>
    <h1>Have a problem <em>worth solving?</em></h1>
    <p class="lead">Connect with Chizeon Technologies about partnerships, product ideas and collaboration.</p>
  </div>
</section>

<section id="form">
  <div class="wrap contact-grid">
    <div class="form-card raise" data-rv>
      <form id="contactForm" novalidate>
        <div class="form-grid">
          <div class="field"><label for="name">Your name <span>*</span></label><input id="name" name="name" type="text" autocomplete="name" placeholder="Full name"><div class="err">Enter your name.</div></div>
          <div class="field"><label for="email">Email address <span>*</span></label><input id="email" name="email" type="email" autocomplete="email" placeholder="you@company.com"><div class="err">Enter a valid email address.</div></div>
          <div class="field"><label for="company">Company</label><input id="company" name="company" type="text" autocomplete="organization" placeholder="Optional"></div>
          <div class="field"><label for="topic">What is this about?</label><select id="topic" name="topic"><option>Partnership</option><option>Product idea</option><option>Collaboration</option><option>Rezovex</option><option>PropVerify</option><option>Mobility Platform</option><option>Mobile Fuel Delivery</option><option>Something else</option></select></div>
          <div class="field full"><label for="message">Your message <span>*</span></label><textarea id="message" name="message" placeholder="Tell us what you have in mind"></textarea><div class="err">Write a short message of at least 10 characters.</div></div>
        </div>
        <div class="form-foot"><button class="cta lg" type="submit">Prepare my message {ic('arrow')}</button><small>This page prepares your message for email. It does not send anything on its own.</small></div>
      </form>
      <div class="ready" id="ready" aria-live="polite">
        <h3>Your message is ready.</h3>
        <p>Open it in your email app, or copy it and send it to hello@chizeon.com. Nothing has been sent yet.</p>
        <pre id="readyText"></pre>
        <div class="btn-row"><a class="cta" id="mailBtn" href="mailto:hello@chizeon.com">Open in email app {ic('mail')}</a><button class="btn-dark" id="copyMsg" type="button" data-copy="" data-target="#readyText">{ic('copy')}<span>Copy message</span></button><button class="btn-dark" id="editBtn" type="button">Edit message</button></div>
      </div>
    </div>
    <div class="side-stack">
      <div class="side-card raise-d" data-rv="right">
        <span class="tile">{ic('mail')}</span>
        <h3>Email us directly</h3>
        <p>Prefer your own email app? Write to the address below.</p>
        <div class="mail-row"><code id="mailText">hello@chizeon.com</code><button class="copy" type="button" data-copy="hello@chizeon.com" data-target="#mailText">{ic('copy')}<span>Copy</span></button></div>
      </div>
      <div class="side-card raise-d" data-rv="right" style="--d:120ms">
        <h3>Good reasons to write</h3>
        <ul class="side-list"><li>{ic('check')}Partnerships and collaboration</li><li>{ic('check')}Product ideas you want to build</li><li>{ic('check')}Questions about a venture</li><li>{ic('check')}Early access and pilots</li></ul>
      </div>
      <div class="side-card raise-d" data-rv="right" style="--d:240ms">
        <h3>Explore our ventures</h3>
        <ul class="side-list">{vlinks}</ul>
      </div>
    </div>
  </div>
</section>
</main>
{footer(False)}'''
  scripts='<script>\n'+BJS+'\n</script>'
  return page('Contact | Chizeon Technologies Ltd','Contact Chizeon Technologies Ltd about partnerships, product ideas and collaboration.',body,scripts)

out={'index.html':home(),'capabilities.html':capabilities(),'leadership.html':leadership(),'contact.html':contact()}
for i,v in enumerate(VENTURES): out[v['slug']+'.html']=venture(i)
os.makedirs(os.path.join(D,'dist'),exist_ok=True)
open(os.path.join(D,'dist','share-card.png'),'wb').write(open(os.path.join(D,'share-card.png'),'rb').read())
for n,c in out.items():
  open(os.path.join(D,'dist',n),'w').write(c); print(n,len(c))
