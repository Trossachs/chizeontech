(function(global){
'use strict';
var T=global.THREE;
if(!T){document.documentElement.classList.add('no-webgl');return;}
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var GOLD=0xd9a933,GOLD_HI=0xf6dd8c,WHITE=0xf4f4f2,DARK=0x141210,BLACK=0x070605;
var CARS=[0xc62828,0x1f5fbf,0xf2f2f2,0xaab2bd,0x25282d,0xf5c518,0x2e7d4f];
var clamp=function(v,a,b){return Math.min(b,Math.max(a,v));};
var lerp=function(a,b,t){return a+(b-a)*t;};
var ease=function(t){t=clamp(t,0,1);return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;};
var easeOutBack=function(t){t=clamp(t,0,1);var c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2);};
var rnd=function(a,b){return a+Math.random()*(b-a);};
function mat(color,o){o=o||{};return new T.MeshStandardMaterial(Object.assign({color:color,metalness:.35,roughness:.5},o));}
function box(w,h,d,m){return new T.Mesh(new T.BoxGeometry(w,h,d),m);}
function cyl(rt,rb,h,m,seg){return new T.Mesh(new T.CylinderGeometry(rt,rb,h,seg||20),m);}

/* canvas textures */
function symbolTex(sym,col){
  var c=document.createElement('canvas');c.width=c.height=256;var x=c.getContext('2d');col=col||['#e8d49a','#c4a263','#7a6130'];
  var g=x.createRadialGradient(100,90,10,128,128,128);g.addColorStop(0,col[0]);g.addColorStop(.6,col[1]);g.addColorStop(1,col[2]);
  x.fillStyle=g;x.beginPath();x.arc(128,128,126,0,6.2832);x.fill();
  x.strokeStyle='rgba(255,255,255,.85)';x.lineWidth=7;x.beginPath();x.arc(128,128,104,0,6.2832);x.stroke();
  x.fillStyle='#ffffff';x.font='700 '+(sym.length>1?120:150)+'px "Outfit","Segoe UI",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(sym,128,136);
  var t=new T.CanvasTexture(c);t.anisotropy=4;return t;
}
function windowTex(cols,rows,lit,seed){
  var w=cols*16,h=rows*16,c=document.createElement('canvas');c.width=w;c.height=h;var x=c.getContext('2d');
  x.fillStyle='#1d2430';x.fillRect(0,0,w,h);
  var s=seed||7,r=function(){s=(s*16807)%2147483647;return s/2147483647;};
  for(var j=0;j<rows;j++)for(var i=0;i<cols;i++){
    if(r()<lit){x.fillStyle=r()<.7?'#ffe3a0':'#cfe6ff';}else{x.fillStyle='#2f3a4a';}
    x.fillRect(i*16+3,j*16+4,10,8);
  }
  var t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;return t;
}
function labelTex(draw,w,h){var c=document.createElement('canvas');c.width=w;c.height=h;var x=c.getContext('2d');draw(x,w,h);var t=new T.CanvasTexture(c);t.anisotropy=4;return t;}

/* shared scene scaffold */
function stage(canvas,o){
  o=o||{};
  var host=canvas.parentElement,renderer;
  try{renderer=new T.WebGLRenderer({canvas:canvas,antialias:true,alpha:true,powerPreference:'high-performance'});}
  catch(e){document.documentElement.classList.add('no-webgl');return null;}
  renderer.setClearColor(0x000000,0);
  var scene=new T.Scene();
  if(o.fog)scene.fog=new T.Fog(0x070a0e,o.fog[0],o.fog[1]);
  var camera=new T.PerspectiveCamera(o.fov||38,1,.1,200);
  scene.add(new T.AmbientLight(0xffffff,.72));
  var key=new T.DirectionalLight(0xfff4e2,1.1);key.position.set(6,11,7);scene.add(key);
  var fill=new T.DirectionalLight(0xffffff,.35);fill.position.set(-8,5,4);scene.add(fill);
  var rim=new T.PointLight(0x8fb4ff,1.1,34);rim.position.set(-7,5,-5);scene.add(rim);
  var ptr={x:0,y:0,tx:0,ty:0};
  host.addEventListener('pointermove',function(e){var r=host.getBoundingClientRect();ptr.tx=((e.clientX-r.left)/r.width-.5)*2;ptr.ty=((e.clientY-r.top)/r.height-.5)*2;});
  host.addEventListener('pointerleave',function(){ptr.tx=0;ptr.ty=0;});
  var S={scene:scene,camera:camera,renderer:renderer,ptr:ptr,fns:[],W:0,H:0,time:0};
  S.tick=function(fn){S.fns.push(fn);};
  S.resize=function(){
    var W=host.clientWidth,H=host.clientHeight;if(!W||!H)return;
    S.W=W;S.H=H;var dpr=Math.min(devicePixelRatio||1,2);renderer.setPixelRatio(dpr);renderer.setSize(W,H,false);
    camera.aspect=W/H;
    var asp=W/H;S.fit=asp<1?1.0+(1-asp)*.75:1.0;
    camera.updateProjectionMatrix();
    if(reduce)S.frame(0,o.still||4);
  };
  S.frame=function(dt,t){
    S.time=t;ptr.x+=(ptr.tx-ptr.x)*.06;ptr.y+=(ptr.ty-ptr.y)*.06;
    for(var i=0;i<S.fns.length;i++)S.fns[i](t,dt,S);
    renderer.render(scene,camera);
  };
  var running=false,raf=0,last=0,t0=0,vis=true;
  function loop(now){if(!running)return;raf=requestAnimationFrame(loop);var dt=Math.min(.05,(now-last)/1000);last=now;S.frame(dt,(now-t0)/1000);}
  S.start=function(){if(running||reduce)return;running=true;last=performance.now();if(!t0)t0=last;raf=requestAnimationFrame(loop);};
  S.stop=function(){running=false;cancelAnimationFrame(raf);};
  if('ResizeObserver' in window)new ResizeObserver(S.resize).observe(host);else addEventListener('resize',S.resize);
  S.resize();
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){vis=es[0].isIntersecting;if(vis)S.start();else S.stop();},{threshold:0}).observe(host);else S.start();
  document.addEventListener('visibilitychange',function(){if(document.hidden)S.stop();else if(vis)S.start();});
  if(reduce)S.frame(0,o.still||4);else S.start();
  return S;
}
function orbit(S,o){
  /* o: r,h,speed,sway,look */
  var look=o.look||new T.Vector3(0,1,0);
  S.tick(function(t){
    var a=(o.sway?Math.sin(t*o.speed)*o.sway:t*o.speed)+S.ptr.x*.35+(o.base||0);
    var r=o.r*(S.fit||1),h=o.h*(S.fit||1)+(-S.ptr.y)*.8;
    S.camera.position.set(Math.sin(a)*r,h,Math.cos(a)*r);S.camera.lookAt(look);
  });
}
function floor(S,size,gridDiv,color){
  var m=new T.Mesh(new T.PlaneGeometry(size,size),new T.MeshStandardMaterial({color:0x141a20,metalness:.2,roughness:.85}));m.rotation.x=-Math.PI/2;S.scene.add(m);
  var g=new T.GridHelper(size,gridDiv,color||0x3d4a5a,0x222a33);g.position.y=.01;g.material.transparent=true;g.material.opacity=.55;S.scene.add(g);return m;
}
function glow(color,size,op){
  var tx=labelTex(function(x,w,h){var g=x.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,230,170,.55)');g.addColorStop(1,'rgba(255,190,60,0)');x.fillStyle=g;x.fillRect(0,0,w,h);},128,128);
  var s=new T.Sprite(new T.SpriteMaterial({map:tx,color:color||0xffffff,transparent:true,opacity:op==null?1:op,depthWrite:false,blending:T.AdditiveBlending}));s.scale.set(size,size,1);return s;
}
function people(parent,color,skin){
  var g=new T.Group();
  var body=cyl(.09,.12,.34,mat(color,{metalness:.1,roughness:.6}),10);body.position.y=.2;g.add(body);
  var head=new T.Mesh(new T.SphereGeometry(.09,14,10),mat(skin||0xc68642,{metalness:0,roughness:.7}));head.position.y=.46;g.add(head);
  parent.add(g);return g;
}
function car(color,roofColor){
  var g=new T.Group();
  var body=box(1.05,.26,.52,mat(color,{metalness:.55,roughness:.35}));body.position.y=.26;g.add(body);
  var cab=box(.54,.22,.46,mat(roofColor||0x2b3948,{metalness:.4,roughness:.2}));cab.position.set(-.06,.5,0);g.add(cab);
  var wm=mat(0x050505,{metalness:0,roughness:.9});
  [[.34,.28],[.34,-.28],[-.34,.28],[-.34,-.28]].forEach(function(p){var w=cyl(.11,.11,.1,wm,14);w.rotation.x=Math.PI/2;w.position.set(p[0],.12,p[1]);g.add(w);});
  var hl=mat(0xfff3c4,{emissive:0xffe08a,emissiveIntensity:1.4});
  [.16,-.16].forEach(function(z){var l=box(.04,.06,.1,hl);l.position.set(.53,.28,z);g.add(l);});
  var tl=mat(0xff4030,{emissive:0xff2a1a,emissiveIntensity:.9});
  [.16,-.16].forEach(function(z){var l=box(.04,.05,.1,tl);l.position.set(-.53,.28,z);g.add(l);});
  return g;
}
function dispose(){}

/* ---------------- REZOVEX ---------------- */
function rezovex(canvas){
  var S=stage(canvas,{fog:[16,36],still:5});if(!S)return;
  var sc=S.scene;
  floor(S,28,28);
  orbit(S,{r:11.5,h:5.2,speed:.2,sway:.55,look:new T.Vector3(0,2.1,0)});
  var N=26,GAP=.5,X0=-6.25,price=2.2,candles=[],gUp=mat(0x1fb36b,{emissive:0x0a5a33,emissiveIntensity:.5,metalness:.3,roughness:.4}),gDn=mat(0xe0453a,{emissive:0x5a1410,emissiveIntensity:.5,metalness:.3,roughness:.4}),wickM=mat(0xaab4c2,{metalness:.1});
  var chart=new T.Group();sc.add(chart);
  function nextData(prev){var o=prev,c=clamp(o+rnd(-.55,.6)+(Math.sin(performance.now()/6000)*.12),.5,4.2);return {o:o,c:c,h:Math.max(o,c)+rnd(.05,.4),l:Math.max(.1,Math.min(o,c)-rnd(.05,.4)),v:rnd(.2,1)};}
  var vol=mat(0x4a6fa5,{emissive:0x142238,emissiveIntensity:.6,transparent:true,opacity:.75});
  for(var i=0;i<N;i++){
    var d=nextData(price);price=d.c;
    var up=d.c>=d.o,body=box(.3,1,.3,up?gUp:gDn),wick=box(.04,1,.04,wickM),vb=box(.3,1,.3,vol);
    var g=new T.Group();g.add(body);g.add(wick);g.add(vb);chart.add(g);
    candles.push({g:g,body:body,wick:wick,vb:vb,x:X0+i*GAP,d:d,age:3,up:up});
  }
  function setCandle(c,k){
    var d=c.d,o=d.o,cl=lerp(d.o,d.c,k),hi=lerp(o,d.h,k),lo=lerp(o,d.l,k);
    var bh=Math.max(.04,Math.abs(cl-o)),by=(cl+o)/2;
    c.body.scale.y=bh;c.body.position.y=by;
    c.wick.scale.y=Math.max(.05,hi-lo);c.wick.position.y=(hi+lo)/2;
    var vh=Math.max(.03,d.v*.8*k);c.vb.scale.y=vh;c.vb.position.set(0,vh/2,1.35);
    c.body.material=(cl>=o)?gUp:gDn;
  }
  /* trend ribbon */
  var RP=N*2,rgeo=new T.BufferGeometry(),rpos=new Float32Array(RP*2*3),ridx=[];
  for(var q=0;q<RP-1;q++){var a=q*2;ridx.push(a,a+1,a+2,a+1,a+3,a+2);}
  rgeo.setAttribute('position',new T.BufferAttribute(rpos,3));rgeo.setIndex(ridx);
  var ribbon=new T.Mesh(rgeo,new T.MeshBasicMaterial({color:0x6ec1ff,side:T.DoubleSide,transparent:true,opacity:.95}));sc.add(ribbon);
  var head=glow(0xffffff,1.4,1);sc.add(head);
  function ribbonUpdate(){
    var pts=candles.slice().sort(function(a,b){return a.x-b.x;}).filter(function(c){return c.x>X0-.4&&c.x<X0+(N-1)*GAP+.4;});
    var n=Math.min(pts.length,RP),k=0,i2;
    for(i2=0;i2<RP;i2++){var p=pts[Math.min(i2,n-1)];var pp=p?p.d:{c:1};var x=p?p.x:X0,yv=(p?lerp(p.d.o,p.d.c,clamp(p.age/1.2,0,1)):1)+.25;
      var m=i2*2;rpos[m*3]=x;rpos[m*3+1]=yv+.03;rpos[m*3+2]=.05;rpos[(m+1)*3]=x;rpos[(m+1)*3+1]=yv-.03;rpos[(m+1)*3+2]=.05;}
    rgeo.attributes.position.needsUpdate=true;rgeo.computeBoundingSphere();
    var last=pts[n-1];if(last){head.position.set(last.x,lerp(last.d.o,last.d.c,clamp(last.age/1.2,0,1))+.25,.1);}
  }
  /* coins with currency symbols */
  var syms=['₦','$','€','£','¥','₵','₹','R','₩','₿'];
  var coins=[];
  var rimM=mat(0xc9ced6,{metalness:.8,roughness:.35});
  var COIN={'₦':['#3fb97a','#0f7a3e','#064a25'],'$':['#6fcf97','#2e8b57','#14532d'],'€':['#6fa0ff','#1f4fa8','#0e2a63'],'£':['#b27ad8','#6a2c91','#3a1556'],'¥':['#ff7a8a','#c8102e','#7a0a1c'],'₵':['#ffd96a','#d4a017','#8a6508'],'₹':['#ffb067','#e8730c','#8f4306'],'R':['#59c79a','#007a4d','#04442b'],'₩':['#7fb0f0','#1d4e89','#0f2b4d'],'₿':['#ffc069','#f7931a','#9a560a']};
  syms.forEach(function(s,i){
    var g=new T.Group(),disc=cyl(.5,.5,.1,rimM,40);disc.rotation.x=Math.PI/2;g.add(disc);
    var face=new T.Mesh(new T.CircleGeometry(.47,40),new T.MeshStandardMaterial({map:symbolTex(s,COIN[s]),metalness:.3,roughness:.4,emissive:0x111111,emissiveMap:null,emissiveIntensity:.4}));
    face.position.z=.056;g.add(face);var back=face.clone();back.rotation.y=Math.PI;back.position.z=-.056;g.add(back);
    var ang=i/syms.length*Math.PI*2,rad=rnd(5.6,8.4);
    g.userData={ang:ang,rad:rad,h:rnd(1.2,5.4),sp:rnd(.08,.2)*(Math.random()<.5?-1:1),ph:rnd(0,6.28),spin:rnd(.7,1.6),sc:rnd(.7,1.15)};
    g.scale.setScalar(g.userData.sc);sc.add(g);coins.push(g);
  });
  S.tick(function(t,dt){
    var spd=1.35;
    candles.forEach(function(c){
      c.x-=spd*dt*.55;c.age+=dt;
    });
    var maxX=Math.max.apply(null,candles.map(function(c){return c.x;}));
    candles.forEach(function(c){
      if(c.x<X0-GAP){var lastC=candles.reduce(function(a,b){return a.x>b.x?a:b;});c.d=nextData(lastC.d.c);c.x=maxX+GAP;c.age=0;maxX=c.x;}
      c.g.position.x=c.x;
      var k=ease(clamp(c.age/1.2,0,1));setCandle(c,k);
      var edge=clamp((c.x-X0)/1.2,0,1)*clamp((X0+(N-1)*GAP+.8-c.x)/.8,0,1);c.g.scale.set(1,1,1);c.g.visible=edge>.02;
    });
    ribbonUpdate();
    coins.forEach(function(g){var u=g.userData;u.ang+=u.sp*dt;
      g.position.set(Math.cos(u.ang)*u.rad*1.02,u.h+Math.sin(t*.9+u.ph)*.45,Math.sin(u.ang)*u.rad*.55-1.5);
      g.rotation.y+=u.spin*dt;g.rotation.z=Math.sin(t*.6+u.ph)*.18;});
    head.material.opacity=.7+.3*Math.sin(t*5);
  });
  /* floor glints */
  var ring=new T.Mesh(new T.RingGeometry(7.5,7.56,96),new T.MeshBasicMaterial({color:0x6ec1ff,transparent:true,opacity:.5,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.02;sc.add(ring);
  S.tick(function(t){ring.scale.setScalar(1+Math.sin(t*.8)*.015);});
}

/* ---------------- PROPVERIFY ---------------- */
function propverify(canvas){
  var S=stage(canvas,{fog:[16,38],still:9});if(!S)return;
  var sc=S.scene;
  floor(S,30,30);
  orbit(S,{r:12.5,h:7.2,speed:.13,look:new T.Vector3(0,1.4,0)});
  var CYCLE=17,PL=3.4;
  /* plot */
  var plot=new T.Mesh(new T.PlaneGeometry(PL*2,PL*2),new T.MeshStandardMaterial({color:0x3a4a2a,metalness:.05,roughness:.95}));plot.rotation.x=-Math.PI/2;plot.position.y=.02;sc.add(plot);
  var bpts=[new T.Vector3(-PL,.06,-PL),new T.Vector3(PL,.06,-PL),new T.Vector3(PL,.06,PL),new T.Vector3(-PL,.06,PL)];
  var border=new T.LineLoop(new T.BufferGeometry().setFromPoints(bpts),new T.LineBasicMaterial({color:0xf2f2f2}));sc.add(border);
  var stakes=[];
  bpts.forEach(function(p,i){
    var g=new T.Group();g.position.set(p.x,0,p.z);
    var post=cyl(.05,.05,1.3,mat(0xc08a52,{metalness:.1,roughness:.8}),8);post.position.y=.65;g.add(post);
    var tip=new T.Mesh(new T.SphereGeometry(.1,12,10),new T.MeshBasicMaterial({color:0xff6a1a}));tip.position.y=1.35;g.add(tip);
    var gl=glow(0xff9a5a,.8,.7);gl.position.y=1.35;g.add(gl);sc.add(g);stakes.push(g);
  });
  /* verification ripple */
  var rip=new T.Mesh(new T.RingGeometry(.9,1,64),new T.MeshBasicMaterial({color:0x2ea44f,transparent:true,opacity:0,side:T.DoubleSide}));rip.rotation.x=-Math.PI/2;rip.position.y=.07;sc.add(rip);
  /* document */
  var docTex=labelTex(function(x,w,h){
    x.fillStyle='#fffaf0';x.fillRect(0,0,w,h);x.fillStyle='#17110a';x.font='700 26px "Outfit",sans-serif';x.fillText('TITLE DOCUMENT',28,50);
    x.fillStyle='#2f5da8';x.fillRect(28,66,w-56,4);
    for(var i=0;i<7;i++){x.fillStyle='#d9d2bf';x.fillRect(28,100+i*38,w-130,10);x.fillStyle='#e9e3d2';x.fillRect(28,118+i*38,w-190,8);}
    x.strokeStyle='#2f5da8';x.lineWidth=3;x.strokeRect(6,6,w-12,h-12);
  },300,420);
  var doc=new T.Group();
  var sheet=new T.Mesh(new T.PlaneGeometry(2.1,2.94),new T.MeshStandardMaterial({map:docTex,side:T.DoubleSide,roughness:.8,metalness:0,emissive:0x222222,emissiveIntensity:.3,transparent:true}));doc.add(sheet);
  var scan=new T.Mesh(new T.PlaneGeometry(2.3,.12),new T.MeshBasicMaterial({color:0x4fb3ff,transparent:true,opacity:.8,blending:T.AdditiveBlending,depthWrite:false}));scan.position.z=.02;doc.add(scan);
  var checks=[];
  for(var ci=0;ci<4;ci++){
    var cm=new T.Mesh(new T.CircleGeometry(.13,20),new T.MeshBasicMaterial({color:0x2ea44f,transparent:true,opacity:0}));cm.position.set(.78,.82-ci*.46,.02);
    var tick=new T.Mesh(new T.PlaneGeometry(.12,.04),new T.MeshBasicMaterial({color:0x17110a,transparent:true,opacity:0}));
    doc.add(cm);checks.push(cm);
  }
  var stampTex=labelTex(function(x,w,h){x.strokeStyle='#2ea44f';x.lineWidth=12;x.beginPath();x.arc(w/2,h/2,w/2-14,0,6.2832);x.stroke();x.fillStyle='#2ea44f';x.font='800 54px "Outfit",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('VERIFIED',w/2,h/2+4);x.strokeStyle='#2ea44f';x.lineWidth=14;x.lineCap='round';x.beginPath();x.moveTo(w/2-44,h/2+56);x.lineTo(w/2-10,h/2+90);x.lineTo(w/2+50,h/2+30);x.stroke();},300,300);
  var stamp=new T.Sprite(new T.SpriteMaterial({map:stampTex,transparent:true,opacity:0,depthWrite:false}));stamp.scale.set(1.5,1.5,1);stamp.position.set(.2,-.6,.15);doc.add(stamp);
  doc.position.set(-PL-1.6,2.4,PL*.2);doc.rotation.y=.5;sc.add(doc);
  /* progress bar on the ground */
  var barBack=box(PL*2,.08,.18,mat(0x2c333b,{metalness:.1}));barBack.position.set(0,.05,PL+1.1);sc.add(barBack);
  var bar=box(PL*2,.1,.2,mat(0x2ea44f,{emissive:0x14602c,emissiveIntensity:.7}));bar.position.set(0,.08,PL+1.1);sc.add(bar);
  /* buildings */
  var roofM=mat(0xb5482f,{metalness:.1,roughness:.75}),wallM=mat(0xf1e6d0,{metalness:.05,roughness:.7});
  var items=[];
  function house(x,z,at){
    var g=new T.Group();g.position.set(x,0,z);
    var b=box(1.0,.7,.9,wallM);b.position.y=.35;g.add(b);
    var r=new T.Mesh(new T.ConeGeometry(.82,.5,4),roofM);r.rotation.y=Math.PI/4;r.position.y=.95;g.add(r);
    var dr=box(.2,.35,.04,mat(0x6b4423,{metalness:.1,roughness:.8}));dr.position.set(0,.18,.46);g.add(dr);
    sc.add(g);items.push({g:g,at:at,dur:.9,h:1});
  }
  function tower(x,z,w,d,h,at,seed){
    var tex=windowTex(Math.max(2,Math.round(w*3.4)),Math.max(4,Math.round(h*3.4)),.62,seed);
    var g=new T.Group();g.position.set(x,0,z);
    var side=new T.MeshStandardMaterial({map:tex,color:0xc4cfdc,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.7,metalness:.2,roughness:.6});
    var top=mat(0x4a5560,{metalness:.3});
    var m=new T.Mesh(new T.BoxGeometry(w,1,d),[side,side,top,top,side,side]);m.position.y=.5;g.add(m);
    var cap=box(w*.6,.15,d*.6,mat(0xaab4c0,{metalness:.6,roughness:.3}));cap.userData.cap=1;g.add(cap);
    sc.add(g);items.push({g:g,at:at,dur:1.5,h:h,body:m,cap:cap,tower:true});
  }
  var hx=[-2.4,-1.2,0,-2.4,-1.2,0],hz=[-2.5,-2.5,-2.5,-.9,-.9,-.9];
  hx.forEach(function(x,i){house(x-.4,hz[i]-.1,6.8+i*.35);});
  tower(1.8,-2.4,1.1,1.1,3.6,9.4,3);tower(2.4,-.5,1.2,1.1,5.2,10.0,9);tower(1.2,.9,1.0,1.0,2.9,10.6,5);tower(2.6,1.9,1.0,1.1,4.2,11.2,11);tower(-.6,1.6,.9,.9,2.3,11.8,17);
  /* crane */
  var crane=new T.Group();crane.position.set(-.2,0,-3.1);
  var mast=box(.14,4.4,.14,mat(0xf2b705,{emissive:0x3a2a00,emissiveIntensity:.3}));mast.position.y=2.2;crane.add(mast);
  var jibG=new T.Group();jibG.position.y=4.4;crane.add(jibG);
  var jib=box(3.2,.12,.12,mat(0xf2b705,{emissive:0x3a2a00,emissiveIntensity:.3}));jib.position.x=1.0;jibG.add(jib);
  var hook=box(.05,1,.05,new T.MeshBasicMaterial({color:0x2b2b2b}));hook.position.set(2.0,-.5,0);jibG.add(hook);
  sc.add(crane);
  S.tick(function(t){
    var u=t%CYCLE,out=1-ease((u-15.6)/1.2);
    /* stakes */
    stakes.forEach(function(s,i){var k=easeOutBack((u-.3-i*.25)/.6);s.scale.y=Math.max(.001,k*out);s.scale.x=s.scale.z=1;});
    border.material.opacity=1;
    /* doc */
    var dIn=ease((u-2.6)/.8),dOut=1-ease((u-7.4)/.8);
    doc.visible=dIn*dOut>.01;doc.scale.setScalar(Math.max(.001,dIn*dOut));
    doc.position.y=2.4+Math.sin(t*1.2)*.08;
    var sp=clamp((u-3.4)/2.8,0,1);scan.position.y=1.5-sp*3.0;scan.visible=sp>0&&sp<1;
    checks.forEach(function(c,i){c.material.opacity=clamp((sp-(.15+i*.2))*6,0,1);});
    stamp.material.opacity=ease((u-6.0)/.5)*dOut;var ss=1+Math.max(0,1-(u-6.0)/.5)*.8;stamp.scale.set(1.5*ss,1.5*ss,1);
    /* ripple on verified */
    var rk=clamp((u-6.2)/1.6,0,1);rip.material.opacity=rk>0&&rk<1?(1-rk)*.9:0;rip.scale.setScalar(.5+rk*PL*1.35);
    /* buildings */
    items.forEach(function(it){
      var k=easeOutBack((u-it.at)/it.dur);k=Math.max(0,k)*out;
      if(it.tower){it.g.visible=k>.001;it.body.scale.y=Math.max(.001,it.h*k);it.body.position.y=it.h*k/2;it.cap.position.y=it.h*k+.08;}
      else{it.g.visible=k>.001;it.g.scale.set(1,Math.max(.001,k),1);}
    });
    crane.visible=u>6.4&&out>.02;crane.scale.setScalar(Math.max(.001,ease((u-6.4)/1)*out));jibG.rotation.y=t*.35;
    /* progress */
    var pk=clamp((u-.4)/14.8,0,1);bar.scale.x=Math.max(.001,pk);bar.position.x=-PL+PL*pk;
  });
}

/* ---------------- MOBILITY ---------------- */
function mobility(canvas){
  var S=stage(canvas,{fog:[20,46],still:5});if(!S)return;
  var sc=S.scene,SIZE=22;
  /* ground with roads */
  var gc=document.createElement('canvas');gc.width=gc.height=1024;var x=gc.getContext('2d'),U=1024/SIZE;
  x.fillStyle='#1e2a24';x.fillRect(0,0,1024,1024);
  function road(cx,cz,w,h){x.fillStyle='#34373c';x.fillRect((cx-w/2+SIZE/2)*U,(cz-h/2+SIZE/2)*U,w*U,h*U);}
  [-6,6].forEach(function(p){road(p,0,1.7,SIZE);road(0,p,SIZE,1.7);});road(0,0,1.2,SIZE);road(0,0,SIZE,1.2);
  x.strokeStyle='rgba(255,208,70,.85)';x.lineWidth=3;x.setLineDash([14,18]);
  [-6,6].forEach(function(p){x.beginPath();x.moveTo((p+SIZE/2)*U,0);x.lineTo((p+SIZE/2)*U,1024);x.stroke();x.beginPath();x.moveTo(0,(p+SIZE/2)*U);x.lineTo(1024,(p+SIZE/2)*U);x.stroke();});
  x.setLineDash([10,16]);x.strokeStyle='rgba(255,255,255,.35)';x.beginPath();x.moveTo(SIZE/2*U,0);x.lineTo(SIZE/2*U,1024);x.stroke();x.beginPath();x.moveTo(0,SIZE/2*U);x.lineTo(1024,SIZE/2*U);x.stroke();
  var gt=new T.CanvasTexture(gc);gt.anisotropy=4;
  var ground=new T.Mesh(new T.PlaneGeometry(SIZE,SIZE),new T.MeshStandardMaterial({map:gt,metalness:.1,roughness:.9}));ground.rotation.x=-Math.PI/2;sc.add(ground);
  orbit(S,{r:14.5,h:11.5,speed:.1,look:new T.Vector3(0,0,0)});
  /* buildings */
  var bseed=3;
  function bld(cx,cz,w,d,h,ti){var tex=windowTex(Math.max(2,Math.round(w*2.6)),Math.max(3,Math.round(h*2.8)),.5,(bseed+=7));var side=new T.MeshStandardMaterial({map:tex,color:0xc4cfdc,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.6,metalness:.2,roughness:.7});var m=new T.Mesh(new T.BoxGeometry(w,h,d),[side,side,mat(0x4a5560),mat(0x4a5560),side,side]);m.position.set(cx,h/2,cz);sc.add(m);}
  var seed=5,r=function(){seed=(seed*16807)%2147483647;return seed/2147483647;};
  [[-3,-3],[3,-3],[-3,3],[3,3]].forEach(function(q){
    for(var i=0;i<4;i++){var ox=(i%2?1:-1)*1.25,oz=(i<2?-1:1)*1.25;bld(q[0]+ox*.9,q[1]+oz*.9,1.7,1.7,.7+r()*2.4,i);}
  });
  for(var s=-9;s<=9;s+=2.3){[ -9.2, 9.2].forEach(function(e){bld(s,e,1.5,1.4,.6+r()*3.2,Math.floor(r()*3));bld(e,s,1.4,1.5,.6+r()*3.2,Math.floor(r()*3));});}
  /* ring road path: clockwise rectangle, perimeter 48 */
  var P=48,H=6;
  function ringPos(s){s=((s%P)+P)%P;var seg=Math.floor(s/12),f=s%12;
    if(seg===0)return {x:-H+f,z:H,a:0,nx:0,nz:1};
    if(seg===1)return {x:H,z:H-f,a:Math.PI/2,nx:1,nz:0};
    if(seg===2)return {x:H-f,z:-H,a:Math.PI,nx:0,nz:-1};
    return {x:-H,z:-H+f,a:-Math.PI/2,nx:-1,nz:0};}
  var angDiff=function(a,b){var d=(b-a)%(Math.PI*2);if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;return d;};
  /* ambient traffic on cross roads */
  var amb=[];
  [[0,0,.9],[0,1,.7],[1,0,.8],[1,1,.6]].forEach(function(c,i){
    var cg=car(CARS[(i*2+1)%CARS.length]);sc.add(cg);amb.push({g:cg,axis:c[0],dir:c[1]?1:-1,pos:rnd(-9,9),v:c[2]*1.5});
  });
  /* hail cars with passengers */
  var cols=[0xf5c518,0x1f5fbf,0xc62828];
  var hails=[0,1,2].map(function(i){
    var cg=car(cols[i]);sc.add(cg);
    var halo=new T.Mesh(new T.TorusGeometry(.32,.025,8,32),new T.MeshBasicMaterial({color:0x9ad0ff}));halo.rotation.x=Math.PI/2;halo.position.y=.95;halo.visible=false;cg.add(halo);
    var per=people(sc,[0xd9534f,0x3b82f6,0x2ea44f][i],[0xc68642,0x8d5524,0xe0ac69][i]);
    var pin=new T.Group();var cone=new T.Mesh(new T.ConeGeometry(.12,.3,10),new T.MeshBasicMaterial({color:0x3b9cff}));cone.rotation.x=Math.PI;cone.position.y=.95;pin.add(cone);
    var ball=new T.Mesh(new T.SphereGeometry(.11,12,10),new T.MeshBasicMaterial({color:0xffffff}));ball.position.y=1.2;pin.add(ball);sc.add(pin);
    var ring=new T.Mesh(new T.RingGeometry(.35,.4,40),new T.MeshBasicMaterial({color:0x3b9cff,transparent:true,opacity:.8,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.05;sc.add(ring);
    var H0={car:cg,halo:halo,per:per,pin:pin,ring:ring,s:i*16+2,v:0,state:'seek',timer:0,pick:0,drop:0,a:0,cr:i%2?1:.85};
    H0.pick=H0.s+rnd(6,12);return H0;
  });
  function curb(sv,off){var p=ringPos(sv);return {x:p.x+p.nx*off,z:p.z+p.nz*off,p:p};}
  S.tick(function(t,dt){
    amb.forEach(function(c){c.pos+=c.dir*c.v*dt;if(c.pos>10.5)c.pos=-10.5;if(c.pos<-10.5)c.pos=10.5;
      if(c.axis===0){c.g.position.set(c.dir*.33,0,c.pos);c.g.rotation.y=c.dir>0?-Math.PI/2:Math.PI/2;}
      else{c.g.position.set(c.pos,0,c.dir*.33);c.g.rotation.y=c.dir>0?0:Math.PI;}
    });
    hails.forEach(function(h){
      var target=(h.state==='seek')?h.pick:h.drop;
      var d=(((target-h.s)%P)+P)%P;
      if(h.state==='seek'||h.state==='ride'){
        var v=Math.min(3.1,Math.max(.35,d*1.05));if(d<.04){h.v=0;h.s=target;h.state=h.state==='seek'?'board':'alight';h.timer=0;}else{h.v=v;h.s+=v*dt;}
      }else{h.timer+=dt;}
      var p=ringPos(h.s-.0),want=p.a,diff=angDiff(h.a,want);h.a+=diff*Math.min(1,dt*6);
      h.car.position.set(p.x+p.nx*.28,0,p.z+p.nz*.28);h.car.rotation.y=h.a;
      var pk=curb(h.pick,1.35),dr=curb(h.drop,1.35);
      if(h.state==='seek'){h.per.visible=true;h.per.position.set(pk.x,0,pk.z);h.per.scale.setScalar(1);h.per.position.y=Math.abs(Math.sin(t*3+h.pick))*.04;h.pin.position.set(pk.x,Math.sin(t*3)*.08,pk.z);h.pin.visible=true;h.ring.position.set(pk.x,.05,pk.z);h.ring.visible=true;h.ring.scale.setScalar(1+((t*1.4)%1)*1.2);h.ring.material.opacity=.8-((t*1.4)%1)*.8;h.halo.visible=false;}
      else if(h.state==='board'){
        var k=clamp(h.timer/1.1,0,1);var cp=h.car.position;h.per.position.set(lerp(pk.x,cp.x+p.nx*.2,ease(k)),0,lerp(pk.z,cp.z+p.nz*.2,ease(k)));h.per.scale.setScalar(Math.max(.001,1-Math.max(0,k-.7)/.3));h.pin.visible=false;h.ring.visible=false;
        if(h.timer>1.4){h.state='ride';h.drop=h.s+rnd(11,22);h.halo.visible=true;}
      }
      else if(h.state==='ride'){h.per.visible=false;h.halo.visible=true;h.halo.rotation.z=t*2;h.pin.visible=true;var q=curb(h.drop,1.35);h.pin.position.set(q.x,.0+Math.sin(t*3)*.06,q.z);h.pin.children[0].material.color.setHex(0x2ecc71);h.ring.visible=true;h.ring.position.set(q.x,.05,q.z);h.ring.scale.setScalar(1+((t*1.4)%1)*1.2);h.ring.material.opacity=.7-((t*1.4)%1)*.7;h.ring.material.color.setHex(0x2ecc71);}
      else if(h.state==='alight'){
        var k2=clamp(h.timer/1.2,0,1);h.halo.visible=false;h.per.visible=true;var cp2=h.car.position;h.per.scale.setScalar(Math.min(1,k2*3));h.per.position.set(lerp(cp2.x+p.nx*.2,dr.x,ease(k2)),0,lerp(cp2.z+p.nz*.2,dr.z,ease(k2)));h.pin.visible=false;h.ring.visible=false;
        if(h.timer>1.9){h.state='seek';h.pick=h.s+rnd(7,14);h.pin.children[0].material.color.setHex(0x3b9cff);h.ring.material.color.setHex(0x3b9cff);}
      }
    });
  });
}

/* ---------------- MOBILE FUEL DELIVERY ---------------- */
function fuel(canvas){
  var S=stage(canvas,{fog:[18,44],still:9});if(!S)return;
  var sc=S.scene,SIZE=34;
  var gc=document.createElement('canvas');gc.width=1024;gc.height=1024;var x=gc.getContext('2d'),U=1024/SIZE;
  x.fillStyle='#1e2a24';x.fillRect(0,0,1024,1024);
  x.fillStyle='#34373c';x.fillRect(0,(SIZE/2-1.4)*U,1024,2.8*U);
  x.fillStyle='#2b2e33';x.fillRect(0,(SIZE/2-6.4)*U,1024,4.4*U);x.fillRect(0,(SIZE/2+2)*U,1024,2.6*U);
  x.strokeStyle='rgba(255,208,70,.9)';x.lineWidth=3;x.setLineDash([16,20]);x.beginPath();x.moveTo(0,SIZE/2*U);x.lineTo(1024,SIZE/2*U);x.stroke();
  x.setLineDash([]);x.strokeStyle='rgba(255,255,255,.45)';x.lineWidth=2;[-1.4,1.4].forEach(function(o){x.beginPath();x.moveTo(0,(SIZE/2+o)*U);x.lineTo(1024,(SIZE/2+o)*U);x.stroke();});
  var gt=new T.CanvasTexture(gc);gt.anisotropy=4;
  var g0=new T.Mesh(new T.PlaneGeometry(SIZE,SIZE),new T.MeshStandardMaterial({map:gt,metalness:.1,roughness:.9}));g0.rotation.x=-Math.PI/2;sc.add(g0);
  orbit(S,{r:13.5,h:7.2,speed:.16,sway:.55,look:new T.Vector3(0,.9,-1)});
  /* gas station */
  function station(cx,cz,scale){
    var g=new T.Group();g.position.set(cx,0,cz);g.scale.setScalar(scale);
    var can=box(5,.22,2.8,mat(0xf4f4f2,{metalness:.2,roughness:.4}));can.position.y=2.1;g.add(can);
    var strip=box(5.05,.12,2.85,new T.MeshBasicMaterial({color:0xd62828}));strip.position.y=1.96;g.add(strip);
    var under=new T.Mesh(new T.PlaneGeometry(4.8,2.6),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.3,blending:T.AdditiveBlending}));under.rotation.x=Math.PI/2;under.position.y=1.9;g.add(under);
    [[-2.2,-1.1],[2.2,-1.1],[-2.2,1.1],[2.2,1.1]].forEach(function(p){var pl=box(.14,2.0,.14,mat(0x9aa3ad,{metalness:.5}));pl.position.set(p[0],1,p[1]);g.add(pl);});
    [-1.0,1.0].forEach(function(px){
      var pump=box(.5,1.05,.4,mat(0xd62828,{metalness:.3,roughness:.4}));pump.position.set(px,.52,0);g.add(pump);
      var scr=box(.34,.2,.02,new T.MeshBasicMaterial({color:0x7ad7ff}));scr.position.set(px,.78,.21);g.add(scr);
      var base=box(.58,.1,.5,mat(0x3a4350));base.position.set(px,.05,0);g.add(base);
    });
    var shop=box(2.4,1.3,1.6,mat(0xb9825a,{metalness:.05,roughness:.8}));shop.position.set(0,.65,-2.6);g.add(shop);
    var win=box(2.0,.5,.04,new T.MeshBasicMaterial({color:0xcfe9ff}));win.position.set(0,.75,-1.78);g.add(win);
    var sign=new T.Mesh(new T.BoxGeometry(.9,1.1,.12),new T.MeshBasicMaterial({map:labelTex(function(c,w,h){c.fillStyle='#0f1318';c.fillRect(0,0,w,h);c.strokeStyle='#d62828';c.lineWidth=8;c.strokeRect(6,6,w-12,h-12);c.fillStyle='#ff7a00';c.font='800 54px "Outfit",sans-serif';c.textAlign='center';c.fillText('FUEL',w/2,84);c.fillStyle='#ffffff';c.font='700 34px "Outfit",sans-serif';c.fillText('24/7',w/2,140);c.beginPath();c.moveTo(w/2,168);c.bezierCurveTo(w/2+34,206,w/2+30,232,w/2,236);c.bezierCurveTo(w/2-30,232,w/2-34,206,w/2,168);c.fillStyle='#ff7a00';c.fill();},180,260)}));
    var sp=box(.1,3,.1,mat(0x9aa3ad));sp.position.set(-3.2,1.5,-1.2);g.add(sp);sign.position.set(-3.2,3.3,-1.2);g.add(sign);
    var gl=glow(0xffffff,3,.7);gl.position.set(-3.2,3.3,-1.0);g.add(gl);
    sc.add(g);return g;
  }
  station(-3.4,-4.4,1);station(-12,-4.6,.8);station(10,-4.4,.9);
  /* ambient traffic */
  var amb=[];
  [[-1,0xc62828,1.6],[1,0xaab2bd,1.3],[-1,0x1f5fbf,1.0],[1,0xf2f2f2,1.5]].forEach(function(c,i){var cg=car(c[1]);sc.add(cg);amb.push({g:cg,dir:c[0],pos:-16+i*8,v:c[2]});});
  /* customer car + request beacon */
  var cust=car(0x2e7d4f);cust.position.set(1.4,0,2.7);sc.add(cust);
  var beacon=new T.Mesh(new T.RingGeometry(.9,1,48),new T.MeshBasicMaterial({color:0x3b9cff,transparent:true,opacity:.8,side:T.DoubleSide}));beacon.rotation.x=-Math.PI/2;beacon.position.set(1.4,.05,2.7);sc.add(beacon);
  var dropTex=labelTex(function(c,w,h){c.fillStyle='#ff9f1c';c.beginPath();c.moveTo(w/2,14);c.bezierCurveTo(w/2+70,100,w/2+60,172,w/2,180);c.bezierCurveTo(w/2-60,172,w/2-70,100,w/2,14);c.fill();c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.ellipse(w/2-22,110,10,28,.4,0,6.28);c.fill();},128,192);
  var drop=new T.Sprite(new T.SpriteMaterial({map:dropTex,transparent:true,depthWrite:false}));drop.scale.set(.55,.82,1);sc.add(drop);
  /* gauge */
  var gauge=new T.Mesh(new T.RingGeometry(.42,.52,40,1,Math.PI/2,Math.PI*2),new T.MeshBasicMaterial({color:0x2ecc71,side:T.DoubleSide,transparent:true,opacity:0}));
  gauge.position.set(1.4,2.15,2.7);sc.add(gauge);
  var gaugeBack=new T.Mesh(new T.RingGeometry(.42,.52,40),new T.MeshBasicMaterial({color:0x2b3139,side:T.DoubleSide,transparent:true,opacity:0}));gaugeBack.position.copy(gauge.position);sc.add(gaugeBack);
  /* tanker */
  var truck=new T.Group();
  var cabM=mat(0x1f4fa8,{metalness:.4,roughness:.35}),tankM=mat(0xdfe4ea,{metalness:.7,roughness:.25});
  var cab=box(.9,.8,.8,cabM);cab.position.set(.95,.6,0);truck.add(cab);
  var wnd=box(.04,.3,.66,new T.MeshBasicMaterial({color:0xbfe3ff}));wnd.position.set(1.41,.8,0);truck.add(wnd);
  var chassis=box(2.8,.18,.7,mat(0x23262b));chassis.position.set(-.15,.22,0);truck.add(chassis);
  var tank=cyl(.42,.42,2.2,tankM,28);tank.rotation.z=Math.PI/2;tank.position.set(-.5,.82,0);truck.add(tank);
  var stripe=cyl(.425,.425,.3,mat(0xff7a00,{emissive:0x5a2a00,emissiveIntensity:.4}),28);stripe.rotation.z=Math.PI/2;stripe.position.set(-.5,.82,0);truck.add(stripe);
  var dm=new T.Mesh(new T.SphereGeometry(.12,10,8),mat(0x7d8793));dm.position.set(-.5,1.27,0);truck.add(dm);
  var wm=mat(0x050505,{roughness:.9});
  [[.95,.38],[.95,-.38],[-.2,.38],[-.2,-.38],[-.95,.38],[-.95,-.38]].forEach(function(p){var w=cyl(.17,.17,.14,wm,14);w.rotation.x=Math.PI/2;w.position.set(p[0],.17,p[1]);truck.add(w);});
  var lb=box(.18,.08,.5,new T.MeshBasicMaterial({color:0xffc23a}));lb.position.set(.95,1.05,0);truck.add(lb);
  var lbg=glow(0xffffff,1.1,.9);lbg.position.set(.95,1.15,0);truck.add(lbg);
  sc.add(truck);
  /* hose */
  var hoseCurve=new T.CatmullRomCurve3([new T.Vector3(.4,.55,1.34),new T.Vector3(.5,1.05,1.7),new T.Vector3(1.0,1.0,2.1),new T.Vector3(1.1,.48,2.42)]);
  var hoseGeo=new T.TubeGeometry(hoseCurve,48,.035,6,false),hoseIdx=hoseGeo.index.count;
  var hose=new T.Mesh(hoseGeo,new T.MeshStandardMaterial({color:0x2b2b2b,emissive:0x000000,emissiveIntensity:0,metalness:.2,roughness:.6}));sc.add(hose);
  var drops=[];for(var di=0;di<9;di++){var d=new T.Mesh(new T.SphereGeometry(.05,8,6),new T.MeshBasicMaterial({color:0xffb84d}));d.visible=false;sc.add(d);drops.push(d);}
  var CYC=19,STOP=.9;
  S.tick(function(t,dt){
    amb.forEach(function(c){c.pos+=c.dir*c.v*dt;if(c.pos>18)c.pos=-18;if(c.pos<-18)c.pos=18;c.g.position.set(c.pos,0,c.dir>0?-.5:-1.0);c.g.rotation.y=c.dir>0?0:Math.PI;});
    var u=t%CYC;
    /* truck: arrive 0-4, serve, depart 10.5-15 */
    var tx;
    if(u<4)tx=lerp(-17,STOP,ease(u/4));else if(u<10.4)tx=STOP;else tx=lerp(STOP,17,ease((u-10.4)/4.6));
    truck.position.set(tx,0,.9);truck.rotation.y=0;
    /* hose */
    var hk=u<4.2?0:u<5.2?(u-4.2):u<9.4?1:u<10.2?1-(u-9.4)/.8:0;hk=clamp(hk,0,1);
    hoseGeo.setDrawRange(0,Math.floor(hoseIdx*ease(hk)/3)*3);
    drops.forEach(function(d,i){var on=u>5.2&&u<9.4;d.visible=on;if(on){var k=((t*.9+i/drops.length)%1),p=hoseCurve.getPoint(k);d.position.copy(p);}});
    /* request beacon + gauge */
    var wait=u<5.2||u>=15.5;
    beacon.visible=wait;var bt=(t*1.2)%1;beacon.scale.setScalar(1+bt*1.1);beacon.material.opacity=.85-bt*.85;
    drop.visible=wait;drop.position.set(1.4,2.3+Math.sin(t*3)*.1,2.7);
    var gk=u<5.2?0:clamp((u-5.2)/4.2,0,1);var gOn=u>5.2&&u<11.2;
    gauge.material.opacity=gOn?1:0;gaugeBack.material.opacity=gOn?.8:0;gauge.visible=gOn&&gk>0;
    if(gk>0){gauge.geometry.dispose();gauge.geometry=new T.RingGeometry(.42,.52,40,1,Math.PI/2,Math.PI*2*gk);}
    /* customer departs after fueling */
    var cx2;if(u<11)cx2=1.4;else if(u<15.2)cx2=lerp(1.4,19,ease((u-11)/4.2));else cx2=-30;
    if(u>=15.2&&u<CYC){cx2=lerp(-18,1.4,ease((u-15.2)/3.8));}
    cust.position.set(cx2,0,2.7);cust.rotation.y=0;
  });
}

global.ChizeonScenes={rezovex:rezovex,propverify:propverify,mobility:mobility,fuel:fuel};
})(window);
