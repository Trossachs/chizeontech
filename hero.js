(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var ptr={x:0,y:0};
window.addEventListener('pointermove',function(e){ptr.x=(e.clientX/innerWidth-.5)*2;ptr.y=(e.clientY/innerHeight-.5)*2;},{passive:true});
/* ---------- Land data (lon,lat pairs) ---------- */
var P=function(a){var r=[];for(var i=0;i<a.length;i+=2)r.push([a[i],a[i+1]]);return r;};
var LAND=[
 [-9.5,37,-8.8,38.7,-9.5,39.5,-8.8,42,-9,43.2,-2,43.5,-1.5,46,-4.5,48.3,-1.5,48.7,1.5,50.2,4,51.5,5,53.3,8.5,54,8.6,57,10.4,57.6,10.2,56,11,54,14,54,19,54.4,21,56,21.5,57.5,23.5,59,28,59.6,30,60,26,60.4,23,59.9,21.5,61.3,21.3,63.2,25,65,24.5,65.8,25.5,65.6,28,67,30,69.5,33,69.5,41,67,44,68,60,69,70,73,80,73,100,77,113,74,130,71,150,71,170,70,180,68.5,180,65,178,62,165,60,160,54,156,51,155,57,143,59,137,54,141,52,140,48,135,43,131,43,129,40,129.5,35,126.5,34.5,126,37,125,39.5,121.5,40.5,121,39,122.5,37,120,35.5,121,32,122,30.5,120,27,117,23.5,111,21.5,108,21.5,106.5,19,108.5,15,109,12,105,8.6,105,10,103,10.5,100.5,13.5,100,9,102,6,103.5,1.5,101,3,98.5,8,98,13,97.5,16.5,94.5,16.5,94,19,92,21.5,90,22,87,21.5,85,19.5,80.3,15.5,80.2,10,77.5,8.2,76,10.5,73.5,17,72.7,21,70,21,68.5,23.5,66.5,25.3,61.5,25.2,57,25.7,56.5,27,54,26.5,52,27.5,50.5,29.5,48,30,48.8,28,50,26,51.2,24.6,51.5,24,54,24.2,56,25.2,56.4,26.4,56.4,24.5,58.5,23.6,59.7,22.5,57.5,18.8,55,17,52,16,45,13,43.2,13,42.5,16,39,21.5,37,25,35,28.5,34.9,29.5,35,32,35.8,34.5,36,36.5,32,36.2,30,36.5,27.5,37,26.5,39.5,26.3,40.3,26,40.6,24,40.6,23.7,38,22,36.5,21,38,19.6,40,19.5,42,16,43.5,13.7,45.6,12.3,45.3,8.9,44.4,7.5,43.8,4.5,43.4,3.2,41.8,0.5,40.5,0,38.7,-2,36.8,-5.5,36],
 [-17.5,14.7,-16.5,19,-13,27.5,-9.8,30,-6,35.8,-2,35.1,3,36.8,10,37.2,11,33.5,15,32.3,20,32,25,31.6,32.3,31.2,34.2,27.8,35.5,24,37.2,21,38.6,18,39.8,15.5,43.1,12.7,43.5,11.5,51.2,11.8,51,10.4,48,4.5,41,-1.5,39.5,-5,39,-8,40.5,-11,40.5,-15,35,-20,35.5,-24,32.5,-26,32.8,-28.5,30,-31.5,27,-33.8,22,-34.2,18.4,-34.2,17.5,-31,15,-27,14.5,-22.5,11.7,-17,13.5,-12,12.2,-6,9,-1,9.5,3.5,6,4.3,4,6.3,-2,4.8,-7.5,4.4,-12,7.5,-14.5,10.5],
 [12.3,44.5,14,42.5,16,41.5,18.5,40.2,17,39,16.5,38,15.7,38,16,39.5,15,40,12.5,41.5,10.5,43,8.8,44.4,7.5,43.8],
 [5,58.5,5,62,10,64,14,67.5,19,70,25,71,30,70.3,28,68.5,25.5,65.8,22,65.3,21,64,17.5,62.5,17.2,60.7,18.8,59.5,16.5,57.5,16,56.2,13,55.5,12.5,56.5,11,59,10,59,8,58],
 [-5.5,50,-3,50.6,1.4,51.2,1.7,52.7,0,53.5,-1.5,55.5,-2,57.7,-3.5,58.6,-5,58.5,-6,57,-5,55,-3,54.5,-3,53.3,-4.5,53.3,-5,51.8,-3.5,51.3],
 [-10,51.8,-6,52,-6,54.5,-8,55.2,-10,54],
 [-24,65.5,-22,66.4,-16,66.5,-13.5,65,-18,63.4,-22.5,63.8],
 [-73,78,-60,82,-30,83.5,-20,80,-18,76,-22,70,-32,68,-40,65,-43,60,-49,61,-53,66,-55,70,-60,76],
 [-168,65.5,-166,68.5,-156,71.3,-141,69.7,-128,70,-115,68.5,-100,68,-95,72,-88,68,-82,69.5,-80,63,-94,59,-93,57,-85,55.5,-82,53,-79,51.5,-78.5,56,-77,60,-72,62,-65,60,-61,56,-56,52,-60,50,-65,49,-64,46,-60,46,-66,44,-70,43,-70.5,41.8,-74,40.5,-76,38,-75.5,35.3,-78,33.8,-81,31.5,-80,27,-80.5,25.2,-82,26.5,-83,29.5,-85,29.7,-89,30.2,-90,29,-94,29.5,-97.3,27.5,-97.8,22,-97.2,20,-96,18.5,-94.5,18.2,-91,18.7,-90.5,21,-87,21.5,-87.5,18,-88.5,16,-84,15.8,-83.3,12,-83.8,10.5,-81.5,8.8,-79.5,9.5,-77.5,8.5,-78,7,-80.5,7.5,-82.5,8.2,-85.5,10,-87.5,13,-92,14.5,-94.5,16.2,-97,15.8,-101,17.3,-105.5,20,-105.5,23,-109,25.5,-112.5,29,-114.7,31.7,-117,32.5,-120.5,34.5,-122.5,37.5,-124,40.5,-124.5,43,-124,46.5,-123,48.5,-125,50,-128,51,-130,54,-133,56.5,-137,58.5,-142,60,-147,61,-152,59,-156,57,-162,55.5,-158,58.5,-162,60,-165,62,-164,64.5],
 [-77.5,8.5,-75,11,-72,12,-68,10.5,-62,10.7,-60,8.5,-57,6,-52,5,-50,1.5,-48,-1,-44,-2.5,-39,-3.5,-35,-5.5,-35,-9,-37.5,-12,-39,-17.5,-41,-22,-44,-23,-48,-26,-48.7,-28.5,-52,-32,-54,-34.5,-57,-35,-57.5,-38,-62,-39,-62.5,-41,-65,-41,-65,-45,-67.5,-46.5,-66,-48,-68.5,-50.5,-69,-52,-68.5,-54,-72,-54,-74.5,-52,-75.5,-48,-73.5,-42,-73.5,-38,-72,-33,-71.5,-28,-70.5,-19,-71.5,-17.5,-76,-14,-79,-8,-81,-5,-80,-2,-80.5,0,-79,2.5,-77.5,6],
 [114,-22,114.5,-26,115,-34,118,-35,123,-34,126,-32.2,131,-31.5,135,-34.5,138,-35.5,140,-38,144,-38.5,148,-37.8,150,-37,153,-31,153.5,-27,152,-24.5,149,-21,146,-18.5,145.5,-14.5,143.5,-14,142.5,-10.7,141.5,-13,141.5,-17,139,-17.5,136,-15.5,136.5,-12,132.5,-11.5,130.5,-12.5,129,-15,126,-14,123,-17,122,-18,119,-20,116,-20.7],
 [49.3,-12,50.5,-15.5,47.5,-25,44,-24.5,43.3,-21,44.5,-16],
 [130.8,31,135,33.5,140,35,141,38,142,40.5,140,41,139,38,136.5,37,132,35.5,130.8,33.8],
 [140,42,141.5,45.4,145,43.3,143,42],
 [95.3,5.5,98,4,104,-1,106,-3.5,105.8,-5.8,102,-4,98,0.5],
 [105.2,-6.5,110,-6.8,114.5,-7.8,114.5,-8.5,106,-7.5],
 [109,1.5,111,2,114,4.5,117,7,119,5,117.5,1,116.5,-3,114.5,-4,110.5,-3,109,-1],
 [131,-1,135,-3.5,138,-1.5,141,-2.6,145.5,-5,148,-8,150.5,-10.5,147,-10,143.5,-9,141,-9,138,-8.2,137.5,-5,134,-4],
 [120,18.5,122,18.4,122,16,124,13,122.5,13.5,120.7,14.2,120,16],
 [122,7,126.5,9,126,6.5,124,6.3],
 [79.8,9.5,81.8,7.5,81,6,80,6],
 [172.7,-34.5,175,-37,178,-37.7,176,-41.5,174.5,-41,174.8,-39.8,173.5,-35.5],
 [172.7,-40.5,174.3,-41.7,171,-44.5,168,-46.6,166.5,-46,170.5,-43]
].map(P);
var SEAS=[
 [28.5,41.2,28,43,28.5,44.5,30,45.5,31,46.5,33.5,46,33.5,45,35,45.2,36.5,45.3,38,47,39,47,37.5,45,38,44.5,40,43.5,41.5,41.6,39,41,36,41.7,33,42,31,41.2],
 [47,45,49,46.5,53,46.8,53,45,51,44.5,51,42,52.7,40.5,53.8,39,54,37.2,51,36.6,49,37.5,49,40,47.5,43]
].map(P);

var CITIES={
 'Lagos':[3.4,6.5,1.5],'Abuja':[7.5,9.1,.7],'Accra':[-.2,5.6,.8],'Dakar':[-17.4,14.7,.6],'Casablanca':[-7.6,33.6,.8],'Algiers':[3,36.7,.7],'Tunis':[10.2,36.8,.5],
 'Cairo':[31.2,30,1.2],'Nairobi':[36.8,-1.3,1],'Addis':[38.7,9,.7],'Kinshasa':[15.3,-4.3,.9],'Johannesburg':[28,-26.2,1.2],'Cape Town':[18.4,-33.9,.8],
 'London':[-.1,51.5,1.5],'Paris':[2.3,48.9,1.3],'Madrid':[-3.7,40.4,1],'Berlin':[13.4,52.5,1],'Rome':[12.5,41.9,1],'Istanbul':[29,41,1.2],'Moscow':[37.6,55.8,1.2],
 'Dubai':[55.3,25.2,1.3],'Riyadh':[46.7,24.7,.9],'Jeddah':[39.2,21.5,.7],'Mumbai':[72.9,19.1,1.3],'Delhi':[77.2,28.6,1.3],'Singapore':[103.8,1.35,1.1],
 'Beijing':[116.4,39.9,1.2],'Shanghai':[121.5,31.2,1.3],'Tokyo':[139.7,35.7,1.3],'Sydney':[151.2,-33.9,1],
 'New York':[-74,40.7,1.4],'Toronto':[-79.4,43.7,.8],'Los Angeles':[-118.2,34,1.1],'Mexico City':[-99.1,19.4,1],'Sao Paulo':[-46.6,-23.5,1.3],'Buenos Aires':[-58.4,-34.6,.9]
};
var ARCS=[['Lagos','London','g'],['Lagos','Dubai','b'],['Lagos','Johannesburg','g'],['Cairo','Mumbai','g'],['London','New York','b'],['Lagos','Sao Paulo','b'],['Nairobi','Singapore','g'],['Paris','Istanbul','b'],['Lagos','Nairobi','g'],['Dubai','Singapore','b'],['Casablanca','Madrid','g'],['Lagos','Accra','b'],['Istanbul','Moscow','g'],['Cairo','Istanbul','b'],['Johannesburg','Cape Town','g']];

/* ---------- 3D globe ---------- */
function initGlobe(){
  var canvas=$('#globe'),stage=$('#stage');
  var fail=function(){document.documentElement.classList.add('no-webgl');if(canvas)canvas.style.display='none';};
  if(typeof THREE==='undefined'){fail();return;}
  var renderer;
  try{renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:true,powerPreference:'high-performance'});}catch(e){fail();return;}
  renderer.setClearColor(0x000000,0);
  var scene=new THREE.Scene();
  var camera=new THREE.PerspectiveCamera(32,1,.1,80);
  var root=new THREE.Group();scene.add(root);
  var tilt=new THREE.Group();tilt.rotation.x=.3;tilt.rotation.z=-.16;root.add(tilt);
  var spinG=new THREE.Group();tilt.add(spinG);
  var D2R=Math.PI/180;
  function ll2v(lon,lat,r){r=r||1;var a=lon*D2R,b=lat*D2R;return new THREE.Vector3(r*Math.cos(b)*Math.sin(a),r*Math.sin(b),r*Math.cos(b)*Math.cos(a));}

  /* land mask */
  var MW=2048,MH=1024,mask=document.createElement('canvas');mask.width=MW;mask.height=MH;
  var mx=mask.getContext('2d');mx.fillStyle='#000';mx.fillRect(0,0,MW,MH);
  function poly(list,color){mx.fillStyle=color;list.forEach(function(pl){mx.beginPath();pl.forEach(function(p,i){var X=(p[0]+180)/360*MW,Y=(90-p[1])/180*MH;if(i)mx.lineTo(X,Y);else mx.moveTo(X,Y);});mx.closePath();mx.fill();});}
  poly(LAND,'#fff');poly(SEAS,'#000');
  var md=mx.getImageData(0,0,MW,MH).data;
  function isLand(lon,lat){var x=Math.min(MW-1,Math.max(0,Math.floor((lon+180)/360*MW))),y=Math.min(MH-1,Math.max(0,Math.floor((90-lat)/180*MH)));return md[(y*MW+x)*4]>128;}
  var soft=document.createElement('canvas');soft.width=MW;soft.height=MH;var sx=soft.getContext('2d');
  if('filter' in sx)sx.filter='blur(1.6px)';
  sx.drawImage(mask,0,0);
  var tex=new THREE.CanvasTexture(soft);tex.anisotropy=4;tex.wrapS=THREE.RepeatWrapping;

  /* globe body */
  var gMat=new THREE.ShaderMaterial({
    uniforms:{uMask:{value:tex},uLight:{value:new THREE.Vector3(-.45,.55,.7).normalize()}},
    vertexShader:'varying vec3 vObj;varying vec3 vN;varying vec3 vV;void main(){vObj=position;vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}',
    fragmentShader:[
      'uniform sampler2D uMask;uniform vec3 uLight;varying vec3 vObj;varying vec3 vN;varying vec3 vV;',
      'void main(){',
      ' vec3 p=normalize(vObj);float lon=atan(p.x,p.z);float lat=asin(clamp(p.y,-1.0,1.0));',
      ' vec2 uv=vec2(lon/6.2831853+0.5,lat/3.14159265+0.5);',
      ' float land=texture2D(uMask,uv).r;',
      ' vec3 n=normalize(vN);vec3 v=normalize(vV);',
      ' float fres=pow(1.0-max(dot(n,v),0.0),2.4);',
      ' float diff=max(dot(n,normalize(uLight)),0.0);',
      ' vec3 ocean=mix(vec3(0.012,0.011,0.01),vec3(0.085,0.075,0.06),diff*0.9+0.05);',
      ' vec3 landc=mix(vec3(0.16,0.115,0.04),vec3(0.82,0.6,0.2),diff*0.8);',
      ' vec3 col=mix(ocean,landc,land);',
      ' float e=abs(land-texture2D(uMask,uv+vec2(0.0012,0.0)).r)+abs(land-texture2D(uMask,uv+vec2(0.0,0.0022)).r);',
      ' col+=vec3(1.0,0.86,0.5)*clamp(e,0.0,1.0)*0.55;',
      ' float gx=abs(fract(uv.x*36.0)-0.5);float gy=abs(fract(uv.y*18.0)-0.5);',
      ' col+=vec3(0.9,0.75,0.4)*max(smoothstep(0.484,0.5,gx),smoothstep(0.484,0.5,gy))*0.06;',
      ' vec3 h=normalize(normalize(uLight)+v);float sp=pow(max(dot(n,h),0.0),70.0)*(1.0-land)*0.6;',
      ' col+=vec3(1.0,0.92,0.7)*sp;',
      ' col+=vec3(0.95,0.7,0.25)*fres*0.9;',
      ' gl_FragColor=vec4(col,1.0);}'
    ].join('\n')
  });
  spinG.add(new THREE.Mesh(new THREE.SphereGeometry(1,96,64),gMat));

  var aMat=new THREE.ShaderMaterial({
    vertexShader:'varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'varying vec3 vN;void main(){float i=pow(max(0.0,0.62-dot(vN,vec3(0.0,0.0,1.0))),3.0);gl_FragColor=vec4(vec3(0.95,0.7,0.25)*i*0.9,clamp(i*0.35,0.0,1.0));}',
    side:THREE.BackSide,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false
  });
  root.add(new THREE.Mesh(new THREE.SphereGeometry(1.17,64,48),aMat));
  var aMat2=aMat; /* single halo */

  /* point lights (land dust, cities, glows) */
  var pos=[],size=[],phase=[],alpha=[],colr=[];
  function addPt(v,s,a,c){pos.push(v.x,v.y,v.z);size.push(s);phase.push(Math.random());alpha.push(a);colr.push(c[0],c[1],c[2]);}
  var N=44000,ga=2.399963229728653,nz=function(lo,la){return .5+.5*Math.sin(lo*.21+1.3)*Math.sin(la*.33+.7)*Math.sin((lo+la)*.11);};
  for(var i=0;i<N;i++){
    var y=1-2*(i+.5)/N,rr=Math.sqrt(1-y*y),ph=i*ga,x=Math.cos(ph)*rr,z=Math.sin(ph)*rr;
    var lat=Math.asin(y)/D2R,lon=Math.atan2(x,z)/D2R;
    if(!isLand(lon,lat)||Math.abs(lat)>68)continue;
    if(Math.random()>.12+.6*nz(lon,lat))continue;
    var warm=Math.random()<.45;
    addPt(new THREE.Vector3(x,y,z).multiplyScalar(1.002),.7+Math.random()*.9,.45+Math.random()*.4,warm?[1,.76,.3]:[1,.97,.88]);
  }
  var up=new THREE.Vector3(0,1,0);
  Object.keys(CITIES).forEach(function(k){
    var c=CITIES[k],cv=ll2v(c[0],c[1]),w=c[2];
    var e=new THREE.Vector3().crossVectors(up,cv).normalize(),nr=new THREE.Vector3().crossVectors(cv,e).normalize();
    var cnt=Math.round(90*w),sg=.014+.016*w;
    for(var j=0;j<cnt;j++){
      var u1=Math.random(),u2=Math.random(),rad=sg*Math.sqrt(-2*Math.log(u1+1e-6)),an=u2*6.2832;
      var q=cv.clone().addScaledVector(e,Math.cos(an)*rad).addScaledVector(nr,Math.sin(an)*rad).normalize().multiplyScalar(1.003);
      var wh=Math.random()<.35;
      addPt(q,1+Math.random()*1.6,.7+Math.random()*.3,wh?[1,.97,.9]:[1,.76,.28]);
    }
    addPt(cv.clone().multiplyScalar(1.004),20+w*14,.2+.06*w,[1,.7,.2]);
    addPt(cv.clone().multiplyScalar(1.004),6+w*3,.75,[1,.92,.7]);
  });
  var pg=new THREE.BufferGeometry();
  pg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  pg.setAttribute('aSize',new THREE.Float32BufferAttribute(size,1));
  pg.setAttribute('aPhase',new THREE.Float32BufferAttribute(phase,1));
  pg.setAttribute('aAlpha',new THREE.Float32BufferAttribute(alpha,1));
  pg.setAttribute('aColor',new THREE.Float32BufferAttribute(colr,3));
  var pVS='attribute float aSize;attribute float aPhase;attribute float aAlpha;attribute vec3 aColor;uniform float uK;uniform float uTime;uniform float uFacing;varying vec3 vC;varying float vA;'+
    'void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mv;'+
    'float tw=0.72+0.28*sin(uTime*1.7+aPhase*6.2831);'+
    'vec3 n=normalize(normalMatrix*normalize(position));float f=dot(n,normalize(-mv.xyz));'+
    'float lim=mix(1.0,smoothstep(0.02,0.3,f),uFacing);'+
    'gl_PointSize=max(1.0,aSize*uK*mix(1.0,0.6+0.4*f,uFacing));vC=aColor;vA=aAlpha*tw*lim;}';
  var pFS='varying vec3 vC;varying float vA;void main(){vec2 d=gl_PointCoord-0.5;float r=length(d)*2.0;float a=pow(max(0.0,1.0-r),2.0);gl_FragColor=vec4(vC*(0.55+a*0.9),a*vA);}';
  var pMat=new THREE.ShaderMaterial({uniforms:{uK:{value:2},uTime:{value:0},uFacing:{value:1}},vertexShader:pVS,fragmentShader:pFS,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
  spinG.add(new THREE.Points(pg,pMat));

  /* stars */
  var sp=[],ss=[],sph=[],sa=[],sc=[];
  for(var s=0;s<360;s++){var th=Math.random()*6.2832,ph2=Math.acos(2*Math.random()-1),rd=9+Math.random()*8;sp.push(rd*Math.sin(ph2)*Math.cos(th),rd*Math.sin(ph2)*Math.sin(th)*.7,rd*Math.cos(ph2)-4);ss.push(.6+Math.random()*1.6);sph.push(Math.random());sa.push(.25+Math.random()*.5);sc.push(1,.95,.82);}
  var sg2=new THREE.BufferGeometry();
  sg2.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));sg2.setAttribute('aSize',new THREE.Float32BufferAttribute(ss,1));sg2.setAttribute('aPhase',new THREE.Float32BufferAttribute(sph,1));sg2.setAttribute('aAlpha',new THREE.Float32BufferAttribute(sa,1));sg2.setAttribute('aColor',new THREE.Float32BufferAttribute(sc,3));
  var sMat=new THREE.ShaderMaterial({uniforms:{uK:{value:2},uTime:pMat.uniforms.uTime,uFacing:{value:0}},vertexShader:pVS,fragmentShader:pFS,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
  scene.add(new THREE.Points(sg2,sMat));

  /* light strokes: orbit rings + connection arcs */
  var flowVS='varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
  var ringFS='uniform vec3 uColor;uniform float uTime,uSpeed,uOff,uAlpha;varying vec2 vUv;void main(){float t=fract(vUv.x-uTime*uSpeed+uOff);float comet=exp(-t*7.0);float base=0.16+0.12*sin(vUv.x*37.6991+uTime*0.8);float a=(base+comet*1.1)*uAlpha;gl_FragColor=vec4(uColor*(0.7+comet*1.6),a);}';
  var arcFS='uniform vec3 uColor;uniform float uTime,uPh;varying vec2 vUv;void main(){float t=fract(vUv.x-uTime*0.22-uPh);float pulse=exp(-t*9.0);float ends=sin(3.14159*vUv.x);float a=(0.28+pulse*1.2)*ends;gl_FragColor=vec4(uColor*(0.8+pulse*1.2),a);}';
  var timeU={value:0},ringMats=[];
  function ring(R,tx,tz,col,speed,off,alphaMul){
    var pts=[];for(var i=0;i<128;i++){var a=i/128*6.2832;pts.push(new THREE.Vector3(Math.cos(a)*R,0,Math.sin(a)*R));}
    var cur=new THREE.CatmullRomCurve3(pts,true),g=new THREE.Group();g.rotation.set(tx,0,tz);
    [[.0042,1],[.016,.2]].forEach(function(cfg){
      var m=new THREE.ShaderMaterial({uniforms:{uColor:{value:new THREE.Color(col)},uTime:timeU,uSpeed:{value:speed},uOff:{value:off},uAlpha:{value:alphaMul*cfg[1]}},vertexShader:flowVS,fragmentShader:ringFS,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
      g.add(new THREE.Mesh(new THREE.TubeGeometry(cur,300,cfg[0],6,true),m));
    });
    root.add(g);
  }
  ring(1.55,1.22,-.26,0xf0c24c,.07,0,1);
  ring(1.38,1.02,.42,0xffffff,-.05,.4,.8);
  ring(1.78,1.38,.08,0xf6dd8c,.04,.7,.55);

  ARCS.forEach(function(a,idx){
    var A=CITIES[a[0]],B=CITIES[a[1]];if(!A||!B)return;
    var va=ll2v(A[0],A[1]),vb=ll2v(B[0],B[1]),ang=Math.acos(Math.min(1,va.dot(vb)));
    var peak=1+ang*.2+.03,c=2*peak-Math.cos(ang/2);
    var ctrl=va.clone().add(vb).normalize().multiplyScalar(c);
    var curve=new THREE.QuadraticBezierCurve3(va.clone().multiplyScalar(1.004),ctrl,vb.clone().multiplyScalar(1.004));
    var m=new THREE.ShaderMaterial({uniforms:{uColor:{value:new THREE.Color(a[2]==='g'?0xf0c24c:0xffffff)},uTime:timeU,uPh:{value:(idx*.137)%1}},vertexShader:flowVS,fragmentShader:arcFS,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
    spinG.add(new THREE.Mesh(new THREE.TubeGeometry(curve,72,.0034,5,false),m));
  });

  /* sizing */
  var W=0,H=0,dpr=1;
  function resize(){
    W=stage.clientWidth;H=stage.clientHeight;if(!W||!H)return;
    dpr=Math.min(devicePixelRatio||1,2);renderer.setPixelRatio(dpr);renderer.setSize(W,H,false);
    var asp=W/H;camera.aspect=asp;
    var half=Math.tan(camera.fov*D2R/2),needV=1.4,needH=asp<1.15?1.45:1.8;
    var d=Math.max(needV/half,needH/(half*asp));
    camera.position.set(0,0,d);camera.lookAt(0,0,0);camera.updateProjectionMatrix();
    var wide=asp>1.1;
    root.position.set(wide?Math.min(.45,(asp-1)*1.2):0,wide?.14:.05,0);
    var radPx=(H/2)/(d*half);
    pMat.uniforms.uK.value=(radPx/200)*dpr*1.7;
    sMat.uniforms.uK.value=dpr*1.2;
    if(reduce)step(0,2.5);
  }

  /* interaction */
  var spin=-18*D2R,vel=.07,AUTO=.07,dragging=false,lastX=0,lastT=0;
  canvas.addEventListener('pointerdown',function(e){dragging=true;lastX=e.clientX;lastT=performance.now();try{canvas.setPointerCapture(e.pointerId);}catch(_){}});
  canvas.addEventListener('pointermove',function(e){if(!dragging)return;var now=performance.now(),dx=e.clientX-lastX,dt=Math.max(.008,(now-lastT)/1000);spin+=dx*.006;vel=Math.max(-1.6,Math.min(1.6,dx*.006/dt));lastX=e.clientX;lastT=now;if(reduce)step(0,2.5);});
  var endDrag=function(){dragging=false;};
  canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);

  function step(dt,time){
    if(!dragging)vel+=(AUTO-vel)*Math.min(1,dt*1.2);
    spin+=vel*dt;spinG.rotation.y=spin;
    root.rotation.y+=(ptr.x*.2-root.rotation.y)*.05;
    root.rotation.x+=(ptr.y*.1-root.rotation.x)*.05;
    timeU.value=time;pMat.uniforms.uTime.value=time;
    renderer.render(scene,camera);
  }

  var running=false,onScreen=true,raf=0,last=performance.now(),t0=last;
  function loop(now){if(!running)return;raf=requestAnimationFrame(loop);var dt=Math.min(.05,(now-last)/1000);last=now;step(dt,(now-t0)/1000);}
  function start(){if(running||reduce)return;running=true;last=performance.now();raf=requestAnimationFrame(loop);}
  function stop(){running=false;cancelAnimationFrame(raf);}
  if('ResizeObserver' in window)new ResizeObserver(resize).observe(stage);else window.addEventListener('resize',resize);
  resize();
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){onScreen=es[0].isIntersecting;if(onScreen)start();else stop();},{threshold:0}).observe(stage);
  document.addEventListener('visibilitychange',function(){if(document.hidden)stop();else if(onScreen)start();});
  if(reduce)step(0,2.5);else start();
}

/* ---------- skyline + waterfront ---------- */
function initCity(){
  var cv=$('#city');if(!cv||!cv.getContext)return;
  var ctx=cv.getContext('2d');
  var W=0,H=0,dpr=1,hy=0,layers=[],comp=null,cx=null,twinks=[],streaks=[],cars=[],px=0,M=48,running=false,onScreen=true,lastDraw=0,raf=0;
  function mk(w,h){var c=document.createElement('canvas');c.width=Math.ceil(w*dpr);c.height=Math.ceil(h*dpr);var x=c.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);return [c,x];}
  function rnd(seed){var s=seed>>>0;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
  function smooth(a,b,x){x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x);}
  var WIN=['#efdca6','#fff3d0','#ffffff','#e3c47a'];

  function build(){
    W=cv.clientWidth;H=cv.clientHeight;if(!W||!H)return;
    dpr=Math.min(devicePixelRatio||1,2);cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
    hy=Math.round(H*.74);
    var pair=mk(W,hy);comp=pair[0];cx=pair[1];
    layers=[];twinks=[];streaks=[];cars=[];
    var wide=W>900,a=wide?.3:0,b=wide?.72:.5;
    var defs=[
      {par:5,seed:11,c0:'#2a2214',c1:'#0c0a07',h:.5,wmin:14,wmax:30,gap:[0,4],win:.28,dim:.55},
      {par:12,seed:23,c0:'#3a2e18',c1:'#100d08',h:.75,wmin:18,wmax:38,gap:[2,8],win:.42,dim:.8},
      {par:22,seed:37,c0:'#54421f',c1:'#15110a',h:1,wmin:22,wmax:46,gap:[4,14],win:.55,dim:1}
    ];
    var towers=wide?[[.66,.62,34],[.72,.5,28],[.79,.82,38],[.85,.95,40],[.9,.74,34],[.95,.6,30]]:[[.2,.6,30],[.38,.82,34],[.55,.95,38],[.72,.74,32],[.88,.62,30]];
    defs.forEach(function(df,li){
      var pr=mk(W+2*M,H),c=pr[0],x=pr[1],r=rnd(df.seed),hmax=hy*.92*df.h;
      function building(bx,bw,bh){
        var top=hy-bh,g=x.createLinearGradient(0,top,0,hy);g.addColorStop(0,df.c0);g.addColorStop(1,df.c1);
        x.fillStyle=g;x.fillRect(bx,top,bw,bh);
        x.fillStyle='rgba(255,226,150,'+(.4*df.dim)+')';x.fillRect(bx+bw-1.2,top,1.2,bh);
        x.fillStyle='rgba(255,226,150,'+(.15*df.dim)+')';x.fillRect(bx,top,1,bh);
        var cols=Math.max(1,Math.floor((bw-4)/5)),rows=Math.floor((bh-8)/8);
        for(var ry=0;ry<rows;ry++)for(var cc=0;cc<cols;cc++){
          if(r()>df.win*(.55+.45*(1-ry/Math.max(1,rows))))continue;
          var wx=bx+3+cc*5,wy=top+6+ry*8;
          x.globalAlpha=(.3+.55*r())*df.dim;x.fillStyle=WIN[Math.floor(r()*WIN.length)];x.fillRect(wx,wy,2.2,3.2);
          if(twinks.length<110&&r()<.012)twinks.push({li:li,x:wx,y:wy,c:x.fillStyle,s:.8+r()*2.2,p:r()*6.28});
        }
        x.globalAlpha=1;
        var roll=r();
        if(roll<.2&&bh>40){x.strokeStyle='rgba(255,235,185,'+(.7*df.dim)+')';x.lineWidth=1.1;x.beginPath();x.moveTo(bx+bw/2,top);x.lineTo(bx+bw/2,top-8-r()*16);x.stroke();}
        else if(roll<.38){x.fillStyle=df.c0;x.fillRect(bx+bw*.2,top-6,bw*.6,6);}
        else if(roll<.5){x.fillStyle=df.c0;x.beginPath();x.moveTo(bx,top);x.lineTo(bx+bw,top);x.lineTo(bx+bw,top-9);x.closePath();x.fill();}
        if(li===2&&r()<.3){x.save();x.shadowColor='#e3c47a';x.shadowBlur=10;x.fillStyle='rgba(255,236,180,.95)';x.fillRect(r()<.5?bx:bx+bw-1.6,top,1.6,bh*.92);x.restore();}
        if(li>0&&r()<.2){x.save();x.shadowColor='#e3c47a';x.shadowBlur=8;x.fillStyle='rgba(255,205,90,.95)';x.fillRect(bx,top,bw,1.6);x.restore();}
      }
      var cur=0;
      while(cur<W+2*M){
        var bw=df.wmin+r()*(df.wmax-df.wmin),f=(cur-M)/W,env=.08+.92*smooth(a,b,f);
        var bh=Math.max(18,hmax*env*(.22+.78*Math.pow(r(),.8)));
        building(cur,bw,Math.min(bh,hmax));cur+=bw+df.gap[0]+r()*(df.gap[1]-df.gap[0]);
      }
      if(li===2){
        towers.forEach(function(t){building(M+t[0]*W-t[2]/2,t[2],hmax*t[1]);});
        /* curved pavilion */
        var pxv=M+(wide?.715:.3)*W;
        x.save();
        var pg=x.createLinearGradient(0,hy-36,0,hy);pg.addColorStop(0,'#f1d98f');pg.addColorStop(.4,'#7a6130');pg.addColorStop(1,'#14100a');
        x.fillStyle=pg;x.beginPath();x.moveTo(pxv-92,hy);x.quadraticCurveTo(pxv-40,hy-40,pxv+112,hy-8);x.lineTo(pxv+112,hy);x.closePath();x.fill();
        x.shadowColor='#e3c47a';x.shadowBlur=10;x.strokeStyle='rgba(255,215,110,.9)';x.lineWidth=1.3;x.beginPath();x.moveTo(pxv-92,hy);x.quadraticCurveTo(pxv-40,hy-40,pxv+112,hy-8);x.stroke();
        x.restore();
        /* waterfront bank, trees, bokeh */
        x.fillStyle='#050403';x.fillRect(0,hy-6,W+2*M,6);
        for(var tI=0;tI<(W+2*M)/9;tI++){x.fillStyle='rgba(8,7,5,.95)';x.beginPath();x.ellipse(tI*9+r()*6,hy-6,4+r()*4,3+r()*5,0,0,6.283);x.fill();}
        for(var bI=0;bI<(W+2*M)/5;bI++){
          if(r()>.55)continue;
          x.save();x.shadowBlur=7;var gold=r()<.65;x.shadowColor=gold?'#e3c47a':'#ffffff';x.fillStyle=gold?'rgba(240,222,170,.95)':'rgba(255,255,255,.95)';
          x.beginPath();x.arc(bI*5+r()*3,hy-4-r()*4,.7+r()*1.1,0,6.283);x.fill();x.restore();
        }
      }
      layers.push({c:c,par:df.par});
    });
    for(var i=0;i<26;i++)streaks.push({x:Math.random()*W,y:6+Math.random()*(H-hy-12),l:30+Math.random()*120,v:(Math.random()<.5?-1:1)*(.15+Math.random()*.5),w:.8+Math.random()*1.2,a:.18+Math.random()*.4,c:Math.random()<.6?'#e3c47a':'#ffffff'});
    for(var k=0;k<14;k++)cars.push({x:Math.random()*W,v:(Math.random()<.5?-1:1)*(.3+Math.random()*.7),c:Math.random()<.6?'#efdca6':'#ffffff'});
  }

  function draw(t){
    if(!W||!comp)return;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    px+=(ptr.x-px)*.05;
    var gg=ctx.createRadialGradient(W*.74,hy,0,W*.74,hy,W*.5);gg.addColorStop(0,'rgba(220,165,50,.3)');gg.addColorStop(1,'rgba(220,165,50,0)');ctx.fillStyle=gg;ctx.fillRect(0,0,W,H);
    cx.setTransform(dpr,0,0,dpr,0,0);cx.clearRect(0,0,W,hy);
    layers.forEach(function(L){cx.drawImage(L.c,0,0,L.c.width,Math.round(hy*dpr),-M+px*L.par,0,W+2*M,hy);});
    ctx.drawImage(comp,0,0,comp.width,comp.height,0,0,W,hy);
    /* twinkling windows */
    twinks.forEach(function(w){var a=.25+.75*Math.max(0,Math.sin(t*w.s+w.p));ctx.globalAlpha=a;ctx.fillStyle=w.c;ctx.fillRect(w.x-M+px*layers[w.li].par,w.y,2.2,3.2);});
    ctx.globalAlpha=1;
    /* water */
    var wg=ctx.createLinearGradient(0,hy,0,H);wg.addColorStop(0,'rgba(70,52,20,.7)');wg.addColorStop(.5,'rgba(22,17,9,.88)');wg.addColorStop(1,'rgba(0,0,0,1)');
    ctx.fillStyle=wg;ctx.fillRect(0,hy,W,H-hy);
    var rh=H-hy;ctx.globalCompositeOperation='screen';
    for(var y=0;y<rh;y+=2){var k=y/rh,al=.5*Math.pow(1-k,1.6);if(al<.012)break;var off=Math.sin(y*.35+t*1.8)*(1.2+k*3.2);ctx.globalAlpha=al;ctx.drawImage(comp,0,Math.max(0,hy-y-2)*dpr,comp.width,2*dpr,off,hy+y,W,2);}
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
    var hg=ctx.createLinearGradient(0,0,W,0);hg.addColorStop(0,'rgba(255,220,140,0)');hg.addColorStop(.5,'rgba(255,225,150,.8)');hg.addColorStop(1,'rgba(255,220,140,.1)');ctx.fillStyle=hg;ctx.fillRect(0,hy,W,1);
    /* light trails on the water and bank */
    ctx.lineCap='round';
    streaks.forEach(function(s){s.x+=s.v;if(s.v>0&&s.x>W+s.l)s.x=-s.l;if(s.v<0&&s.x<-s.l)s.x=W+s.l;ctx.globalAlpha=s.a*(.6+.4*Math.sin(t*1.3+s.l));ctx.strokeStyle=s.c;ctx.lineWidth=s.w;ctx.beginPath();ctx.moveTo(s.x,hy+s.y);ctx.lineTo(s.x+s.l,hy+s.y);ctx.stroke();});
    ctx.globalAlpha=1;
    cars.forEach(function(c){c.x+=c.v;if(c.x>W+10)c.x=-10;if(c.x<-10)c.x=W+10;ctx.fillStyle=c.c;ctx.shadowColor=c.c;ctx.shadowBlur=6;ctx.fillRect(c.x,hy-3,2.4,1.4);});
    ctx.shadowBlur=0;
  }

  function loop(now){if(!running)return;raf=requestAnimationFrame(loop);if(now-lastDraw<33)return;lastDraw=now;draw(now/1000);}
  function start(){if(running||reduce)return;running=true;raf=requestAnimationFrame(loop);}
  function stop(){running=false;cancelAnimationFrame(raf);}
  var pending=0;
  function rebuild(){cancelAnimationFrame(pending);pending=requestAnimationFrame(function(){build();draw(1.5);});}
  if('ResizeObserver' in window)new ResizeObserver(rebuild).observe(cv);else window.addEventListener('resize',rebuild);
  build();draw(1.5);
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){onScreen=es[0].isIntersecting;if(onScreen)start();else stop();},{threshold:0}).observe(cv);else start();
  document.addEventListener('visibilitychange',function(){if(document.hidden)stop();else if(onScreen)start();});
  start();
}

try{initGlobe();}catch(e){document.documentElement.classList.add('no-webgl');}
try{initCity();}catch(e){}
})();
