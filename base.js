(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js');

/* nav */
var nav=$('#navLinks'),tog=$('#navToggle'),dd=$('#dd'),ddBtn=$('#ddBtn');
if(tog){tog.addEventListener('click',function(){var o=nav.classList.toggle('open');tog.setAttribute('aria-expanded',String(o));});}
if(ddBtn){ddBtn.addEventListener('click',function(){var o=dd.classList.toggle('open');ddBtn.setAttribute('aria-expanded',String(o));});}
$$('#navLinks a').forEach(function(a){a.addEventListener('click',function(){nav.classList.remove('open');if(dd)dd.classList.remove('open');if(tog)tog.setAttribute('aria-expanded','false');});});
document.addEventListener('click',function(e){if(dd&&!dd.contains(e.target)){dd.classList.remove('open');if(ddBtn)ddBtn.setAttribute('aria-expanded','false');}});
var y=$('#year');if(y)y.textContent=new Date().getFullYear();

/* scroll spy (home page only) */
var spyLinks=$$('[data-sec]');
if(spyLinks.length&&'IntersectionObserver' in window){
  var spy=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){spyLinks.forEach(function(l){l.classList.toggle('active',l.getAttribute('data-sec')===e.target.id);});}});},{rootMargin:'-40% 0px -55% 0px'});
  ['home','about','ventures'].forEach(function(id){var el=document.getElementById(id);if(el)spy.observe(el);});
}

/* scroll progress + back to top */
var prog=$('#prog'),top=$('#toTop'),ticking=false;
function onScroll(){
  var h=document.documentElement,max=h.scrollHeight-h.clientHeight,p=max>0?Math.min(1,Math.max(0,(window.scrollY||h.scrollTop)/max)):0;
  if(prog)prog.style.setProperty('--p',p.toFixed(4));
  if(top)top.classList.toggle('show',(window.scrollY||h.scrollTop)>700);
  ticking=false;
}
window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(onScroll);}},{passive:true});
onScroll();
if(top)top.addEventListener('click',function(){window.scrollTo({top:0,behavior:reduce?'auto':'smooth'});});

/* scroll reveal: staggered, direction-aware */
$$('[data-stagger]').forEach(function(g){
  var step=parseInt(g.getAttribute('data-stagger'),10)||90;
  Array.prototype.forEach.call(g.children,function(c,i){
    if(!c.hasAttribute('data-rv'))c.setAttribute('data-rv','up');
    c.style.setProperty('--d',(i*step)+'ms');
  });
});
var rvs=$$('[data-rv]');
function show(el){el.classList.add('in');setTimeout(function(){el.classList.add('done');},1600);}
if('IntersectionObserver' in window&&!reduce){
  var rv=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){show(e.target);rv.unobserve(e.target);}});},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  rvs.forEach(function(el){rv.observe(el);});
}else{rvs.forEach(show);}

/* 3D pointer tilt with specular glare */
if(matchMedia('(hover:hover) and (pointer:fine)').matches&&!reduce){
  $$('.tilt').forEach(function(el){
    el.addEventListener('pointermove',function(e){
      if(e.pointerType&&e.pointerType!=='mouse')return;
      var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,yy=(e.clientY-r.top)/r.height;
      el.style.setProperty('--ry',((x-.5)*11).toFixed(2)+'deg');
      el.style.setProperty('--rx',((.5-yy)*9).toFixed(2)+'deg');
      el.style.setProperty('--mx',(x*100).toFixed(1)+'%');
      el.style.setProperty('--my',(yy*100).toFixed(1)+'%');
      el.classList.add('hot');
    });
    el.addEventListener('pointerleave',function(){el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg');el.classList.remove('hot');});
  });
}

/* about plaque tilt */
var about=$('.about-panel'),inf=$('#inf3d');
if(about&&inf&&!reduce){
  about.addEventListener('pointermove',function(e){var r=about.getBoundingClientRect(),nx=(e.clientX-r.left)/r.width-.5,ny=(e.clientY-r.top)/r.height-.5;inf.style.setProperty('--ry',(-10+nx*24)+'deg');inf.style.setProperty('--rx',(6-ny*18)+'deg');});
  about.addEventListener('pointerleave',function(){inf.style.setProperty('--ry','-10deg');inf.style.setProperty('--rx','6deg');});
}


/* venture slideshow: automatic only, no user controls */
var vs=$('#vshow');
if(vs){
  var slides=$$('.slide',vs),cur=0,timer=0,inView=true;
  var arm=function(){clearTimeout(timer);if(reduce||!inView||document.hidden||slides.length<2)return;timer=setTimeout(step,3600);};
  function step(){slides[cur].classList.remove('active');cur=(cur+1)%slides.length;slides[cur].classList.add('active');arm();}
  if('IntersectionObserver' in window){new IntersectionObserver(function(es){inView=es[0].isIntersecting;arm();},{threshold:.2}).observe(vs);}
  document.addEventListener('visibilitychange',arm);
  arm();
}

/* ventures card slider */
var track=$('#vsTrack');
if(track){
  var cards=$$('.vcard',track),pager=$('#vsPager'),bPrev=$('#vsPrev'),bNext=$('#vsNext');
  var metrics=function(){var cw=cards[0].getBoundingClientRect().width,gap=parseFloat(getComputedStyle(track).columnGap)||22,per=Math.max(1,Math.round((track.clientWidth)/(cw+gap)));return {step:(cw+gap),per:per,pages:Math.ceil(cards.length/per)};};
  var build=function(){var m=metrics();pager.innerHTML='';for(var i=0;i<m.pages;i++){(function(i){var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Show slide '+(i+1));b.addEventListener('click',function(){track.scrollTo({left:i*m.per*m.step,behavior:reduce?'auto':'smooth'});});pager.appendChild(b);})(i);}update();};
  var update=function(){var m=metrics(),max=track.scrollWidth-track.clientWidth,pos=track.scrollLeft;var page=Math.min(m.pages-1,Math.round(pos/(m.per*m.step)));if(pos>=max-4)page=m.pages-1;$$('button',pager).forEach(function(b,i){b.classList.toggle('on',i===page);});bPrev.disabled=pos<=4;bNext.disabled=pos>=max-4;};
  var by=function(dir){var m=metrics();track.scrollBy({left:dir*m.per*m.step,behavior:reduce?'auto':'smooth'});};
  bPrev.addEventListener('click',function(){by(-1);});bNext.addEventListener('click',function(){by(1);});
  track.addEventListener('scroll',function(){requestAnimationFrame(update);},{passive:true});
  track.addEventListener('keydown',function(e){if(e.key==='ArrowRight')by(1);if(e.key==='ArrowLeft')by(-1);});
  window.addEventListener('resize',build);
  /* mouse drag */
  var down=false,startX=0,startL=0,dragged=false;
  track.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button)return;down=true;dragged=false;startX=e.clientX;startL=track.scrollLeft;});
  window.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-startX;if(Math.abs(dx)>6){dragged=true;track.classList.add('drag');}if(dragged)track.scrollLeft=startL-dx;});
  window.addEventListener('pointerup',function(){if(!down)return;down=false;if(dragged){var m=metrics(),idx=Math.round(track.scrollLeft/m.step);track.classList.remove('drag');track.scrollTo({left:idx*m.step,behavior:'smooth'});}});
  track.addEventListener('click',function(e){if(dragged){e.preventDefault();e.stopPropagation();dragged=false;}},true);
  build();
}

/* C within C loader: 3 second smooth sequence, always starts at the top */
var LOAD_MS=3000;
var html=document.documentElement,loader=$('#loader');
try{if('scrollRestoration' in history)history.scrollRestoration='manual';}catch(e){}
function toTop(){try{window.scrollTo(0,0);}catch(e){}html.scrollTop=0;if(document.body)document.body.scrollTop=0;}
var isVenture=!!document.getElementById('scene');
if(isVenture||!location.hash)toTop();
if(loader){
  html.classList.add('loading');
  var bar=$('.ld-bar i',loader),pct=$('.ld-pct',loader),msg=$('.ld-msg',loader),skip=null;
  var msgs=['Preparing Chizeon','Loading ventures','Setting the scene','Almost there'];
  var dur=reduce?1200:LOAD_MS,t0=performance.now(),loaded=document.readyState==='complete',done=false,raf=0,skipped=false;
  window.addEventListener('load',function(){loaded=true;});
  var paint=function(){};
  var finish=function(){
    if(done)return;done=true;cancelAnimationFrame(raf);paint(1,1);
    setTimeout(function(){loader.classList.add('hide');html.classList.remove('loading');if(isVenture||!location.hash)toTop();},reduce?0:200);
  };
  var tick=function(now){
    if(done)return;
    var t=Math.min(1,(now-t0)/dur),p=skipped?1:.5-.5*Math.cos(Math.PI*t);
    paint(p,t);
    if(t>=1&&(loaded||now-t0>dur+5000)){finish();return;}
    raf=requestAnimationFrame(tick);
  };
  raf=requestAnimationFrame(tick);
  if(skip)skip.addEventListener('click',function(){skipped=true;dur=1;t0=performance.now()-2;finish();});
  window.addEventListener('pageshow',function(e){if(e.persisted){done=true;loader.classList.add('hide');html.classList.remove('loading');if(isVenture)toTop();}});
  document.addEventListener('click',function(e){
    if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;
    var t=a.getAttribute('target');if(t&&t!=='_self')return;
    var h=a.getAttribute('href');if(!h||h.charAt(0)==='#'||/^(mailto:|tel:|sms:|https?:|javascript:)/i.test(h))return;
    loader.classList.add('leaving');loader.classList.remove('hide');html.classList.add('loading');
    setTimeout(function(){loader.classList.add('hide');loader.classList.remove('leaving');html.classList.remove('loading');},8000);
  });
}

/* capabilities deck: swipe the top card away, the rest stack underneath */
var deck=$('#deck');
if(deck){
  var setDx=function(c,v){c.style.setProperty('--dx',typeof v==='number'?v+'px':v);c.style.setProperty('--rot',(parseFloat(v)/16)+'deg');};
  var dcs=$$('.dcard',deck),ord=dcs.slice(),hint=$('#dkHint'),busy=false;
  var lay=function(){ord.forEach(function(c,k){c.style.setProperty('--k',k);c.setAttribute('data-k',k);c.style.zIndex=ord.length-k;c.setAttribute('aria-hidden',k?'true':'false');});};
  var cyc=function(dir){
    if(busy)return;busy=true;var top=ord[0];
    top.classList.add('fly');setDx(top,(dir>0?-1:1)*Math.max(420,deck.offsetWidth*1.2)+'px');
    setTimeout(function(){top.classList.remove('fly');setDx(top,'0px');ord.push(ord.shift());lay();busy=false;if(hint)hint.textContent='Swipe the card';},reduce?0:380);
  };
  var back=function(){if(busy)return;ord.unshift(ord.pop());lay();};
  lay();
  var sx=null,dx=0,t0d=0;
  deck.addEventListener('pointerdown',function(e){if(busy||e.target.closest('a'))return;sx=e.clientX;dx=0;t0d=performance.now();deck.classList.add('drag');try{deck.setPointerCapture(e.pointerId);}catch(x){}});
  deck.addEventListener('pointermove',function(e){if(sx==null)return;dx=e.clientX-sx;setDx(ord[0],dx+'px');});
  var end=function(){
    if(sx==null)return;var v=Math.abs(dx)/Math.max(1,performance.now()-t0d);var d=dx;sx=null;deck.classList.remove('drag');
    if(Math.abs(d)>70||(Math.abs(d)>30&&v>.5)){setDx(ord[0],d+'px');cyc(d<0?1:-1);}else{setDx(ord[0],'0px');}
  };
  deck.addEventListener('pointerup',end);deck.addEventListener('pointercancel',end);
  deck.addEventListener('keydown',function(e){if(e.key==='ArrowRight')cyc(1);if(e.key==='ArrowLeft')back();});
  $('#dkNext').addEventListener('click',function(){cyc(1);});
  $('#dkPrev').addEventListener('click',back);
}

/* store badge guard: a badge with no link is shown but not clickable */
document.querySelectorAll('.store.off').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();});});

/* copy buttons */
$$('[data-copy]').forEach(function(btn){
  btn.addEventListener('click',function(){
    var text=btn.getAttribute('data-copy'),label=$('span',btn),old=label.textContent;
    var done=function(t){label.textContent=t;setTimeout(function(){label.textContent=old;},1800);};
    var sel=function(){var t=$(btn.getAttribute('data-target'));if(t){var r=document.createRange();r.selectNodeContents(t);var s=getSelection();s.removeAllRanges();s.addRange(r);}done('Selected');};
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){done('Copied');},sel);}else{sel();}
  });
});

/* contact form: composes a message, does not send */
var form=$('#contactForm');
if(form){
  var ready=$('#ready'),pre=$('#readyText'),mailBtn=$('#mailBtn'),copyMsg=$('#copyMsg'),editBtn=$('#editBtn');
  var rules={name:function(v){return v.trim().length>1;},email:function(v){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());},message:function(v){return v.trim().length>9;}};
  function check(){
    var ok=true;
    Object.keys(rules).forEach(function(k){
      var f=form.elements[k],box=f.closest('.field'),good=rules[k](f.value);
      box.classList.toggle('bad',!good);if(!good)ok=false;
    });
    return ok;
  }
  Object.keys(rules).forEach(function(k){form.elements[k].addEventListener('input',function(){var b=form.elements[k].closest('.field');if(rules[k](form.elements[k].value))b.classList.remove('bad');});});
  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(!check()){var bad=$('.field.bad input, .field.bad textarea',form);if(bad)bad.focus();return;}
    var v=function(k){return form.elements[k].value.trim();};
    var lines=['Hello Chizeon Technologies,','',v('message'),'','Name: '+v('name'),'Email: '+v('email')];
    if(v('company'))lines.push('Company: '+v('company'));
    lines.push('Topic: '+v('topic'));
    var text=lines.join('\n'),subject='Chizeon enquiry: '+v('topic');
    pre.textContent=text;
    var cfg=window.CHIZEON_SUPABASE;
    if(cfg&&cfg.url&&cfg.key&&window.fetch){
      fetch(cfg.url+'/rest/v1/form_submissions',{method:'POST',headers:{'Content-Type':'application/json',apikey:cfg.key,Authorization:'Bearer '+cfg.key,Prefer:'return=minimal'},
        body:JSON.stringify({name:v('name'),email:v('email'),company:v('company')||null,topic:v('topic'),message:v('message')})}).catch(function(){});
    }
    mailBtn.setAttribute('href','mailto:hello@chizeon.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(text));
    copyMsg.setAttribute('data-copy',text);
    form.hidden=true;ready.classList.add('show');
    ready.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});
  });
  editBtn.addEventListener('click',function(){ready.classList.remove('show');form.hidden=false;form.elements.message.focus();});
}
})();
