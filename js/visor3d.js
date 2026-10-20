/* Visor 3D (three.js): materiales, carga del modelo, animación, selección, capas, deslizadores. */
const OVEN_INFO = {name:"Horno Electrolux a gas con ventilador", sub:"De empotrar, 60 cm (serie OE8G…) · 1ª opción del manual: alineado al mueble"};
const WOOD = {
  cama:{carc:"#e3ddd2", front:"#e3ddd2", thin:"#cfc6b6", box:"#d6cebf", cantos:1},
  cama2:{carc:"#e3ddd2", front:"#e3ddd2", thin:"#cfc6b6", box:"#d6cebf", cantos:1},
  cama5:{carc:"#e3ddd2", front:"#e3ddd2", thin:"#cfc6b6", box:"#d6cebf", cantos:1},
  cama3:{carc:"#e3ddd2", front:"#e3ddd2", thin:"#cfc6b6", box:"#d6cebf", cantos:1},
  cama4:{carc:"#e3ddd2", front:"#e3ddd2", thin:"#cfc6b6", box:"#d6cebf", cantos:1},
  cocina:{carc:"#e6dac3", front:"#f1e9da", thin:"#c9bda6", box:"#ddd0b8"},
  tv:{carc:"#5e4330", front:"#ece3d3", thin:"#cbbfa9", box:"#d9cdb8"},
  armario:{carc:"#5a4030", front:"#ece2cf", thin:"#c9bda6", box:"#6b4d38", cantos:1}
};
const CANTO_CLARO="#ece2cf", CANTO_OSCURO="#4a3426";
function lum(hex){ const c=new THREE.Color(hex); return c.r*.3+c.g*.59+c.b*.11; }
function cantoColor(m,s){ return lum(pieceColor(m,s))<.35 ? CANTO_CLARO : CANTO_OSCURO; }
function edgeHex(m,s){ const c=new THREE.Color(pieceColor(m,s)); return (c.r*.3+c.g*.59+c.b*.11)<.35 ? 0x1b120c : 0x4a3d2e; }
function pieceColor(m,s){
  const x=byId[s.id], w=WOOD[m];
  if(x.d[2]===6) return w.thin;
  if(s.front) return w.front;
  if(s.g) return w.box;
  return w.carc;
}

const V3 = {openSet:new Set(), doorSet:new Set(), ready:false, m:"cocina", sel:null, area:null, inst:null, extras:[], showOven:true, explode:0, open:false, hideFronts:false, missing:false, isolate:false};
function init3D(){
  if(V3.ready) return true;
  if(!window.THREE || !THREE.OrbitControls){ $("#v3msg").hidden=false; return false; }
  const wrap=$("#v3canvas");
  const renderer=new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  wrap.appendChild(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(38,1,0.01,50);
  scene.add(new THREE.HemisphereLight(0xffffff,0x6f665a,0.5));
  const sun=new THREE.DirectionalLight(0xffffff,0.85); sun.position.set(1.5,3,2.5); scene.add(sun);
  const fill=new THREE.DirectionalLight(0xffffff,0.3); fill.position.set(-2,1,-1.5); scene.add(fill);
  const under=new THREE.DirectionalLight(0xffffff,0.55); under.position.set(0.6,-3,1.2); scene.add(under);   // para la vista desde abajo
  const floor=new THREE.Mesh(new THREE.CircleGeometry(2.2,48), new THREE.MeshBasicMaterial({color:0x000000, transparent:true, opacity:.12}));
  floor.rotation.x=-Math.PI/2; scene.add(floor);
  const controls=new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping=true; controls.dampingFactor=.12; controls.maxPolarAngle=Math.PI-0.02; controls.minPolarAngle=0.02; controls.minDistance=.4; controls.maxDistance=6;
  Object.assign(V3,{renderer,scene,camera,controls,floor,group:null,meshes:[],ready:true});
  const resize=()=>{ const w=wrap.clientWidth, h=wrap.clientHeight; if(!w||!h) return; renderer.setSize(w,h,false); renderer.domElement.style.width=w+"px"; renderer.domElement.style.height=h+"px"; camera.aspect=w/h; camera.updateProjectionMatrix(); if(V3.group && !V3.touched) resetCam(); };
  new ResizeObserver(resize).observe(wrap); resize();
  // toque = seleccionar (sin arrastrar)
  let down=null, lastTap=null;
  renderer.domElement.addEventListener("pointerdown",e=>{ down={x:e.clientX,y:e.clientY,t:Date.now()}; V3.touched=true; });
  renderer.domElement.addEventListener("pointerup",e=>{
    if(!down) return; const moved=Math.hypot(e.clientX-down.x,e.clientY-down.y), dt=Date.now()-down.t; down=null;
    if(moved>8||dt>500) return;
    const r=renderer.domElement.getBoundingClientRect();
    const p=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1, -((e.clientY-r.top)/r.height)*2+1);
    const ray=new THREE.Raycaster(); ray.setFromCamera(p,camera);
    const hits=ray.intersectObjects(V3.meshes.concat(V3.extras).filter(o=>o.visible),false);
    if(MEAS.on){ if(hits.length) measPick(hits[0], e.clientX-r.left, e.clientY-r.top); return; }
    const o=hits[0]?.object||null, now=Date.now();
    if(o && lastTap && lastTap.o===o && now-lastTap.t<400 && Math.hypot(e.clientX-lastTap.x,e.clientY-lastTap.y)<30){ lastTap=null; if(toggleByMesh(o)) return; }
    lastTap={o,t:now,x:e.clientX,y:e.clientY};
    select3D(o? o.userData.id : null, false, o? o.userData.spec : null);
  });
  const loop=()=>{ requestAnimationFrame(loop); if($("#v-3d").hidden) return; step3D(); controls.update(); if(typeof measFrame==="function") measFrame(); renderer.render(scene,camera); };
  loop();
  return true;
}
function load3D(m){
  V3.m=m; V3.sel=null;
  if(V3.group){ V3.scene.remove(V3.group); V3.group.traverse(o=>{ o.geometry?.dispose(); [].concat(o.material||[]).forEach(mm=>mm.dispose?.()); }); }
  const spec=buildModel(m), group=new THREE.Group(), meshes=[], seen={};
  let mn=[1e9,1e9,1e9], mx=[-1e9,-1e9,-1e9];
  spec.forEach(s=>{ const b=s.bed?bedClosedBox(s.b):s.desk?deskClosedBox(s.b):s.b; mn=[Math.min(mn[0],b[0]),Math.min(mn[1],b[2]),Math.min(mn[2],b[4])]; mx=[Math.max(mx[0],b[1]),Math.max(mx[1],b[3]),Math.max(mx[2],b[5])]; });
  const C=[(mn[0]+mx[0])/2, 0, (mn[2]+mx[2])/2]; V3.C=C;
  const S=0.001;
  spec.forEach(s=>{
    const b=s.b, w=(b[1]-b[0])*S, h=(b[3]-b[2])*S, d=(b[5]-b[4])*S;
    const geo=new THREE.BoxGeometry(w,h,d);
    const mat=new THREE.MeshStandardMaterial({color:pieceColor(m,s), roughness:.8, metalness:0, transparent:true, opacity:1});
    let edgeMat=null, matArg=mat;
    if(WOOD[m].cantos){   // caras grandes = color de la tabla; las 4 caras delgadas (cantos) = color contrario
      edgeMat=new THREE.MeshStandardMaterial({color:cantoColor(m,s), roughness:.7, metalness:0, transparent:true, opacity:1});
      const dims=[w,h,d], ti=dims.indexOf(Math.min(...dims));
      matArg=[0,1,2,3,4,5].map(f=>Math.floor(f/2)===ti?mat:edgeMat);
    }
    const mesh=new THREE.Mesh(geo,matArg);
    const base=new THREE.Vector3(((b[0]+b[1])/2-C[0])*S, ((b[2]+b[3])/2)*S, ((b[4]+b[5])/2-C[2])*S);
    mesh.position.copy(base);
    const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({color:edgeHex(m,s), transparent:true, opacity:.75}));
    mesh.add(edges);
    seen[s.id]=(seen[s.id]||0)+(s.sub?0:1);
    mesh.userData={k:meshes.length, mat, edgeMat, id:s.id, spec:s, base, cur:base.clone(), g:s.g||null, front:!!s.front, idx:seen[s.id]-1, approx:!!s.approx, edges, hw:w/2, hd:d/2};
    group.add(mesh); meshes.push(mesh);
  });
  const extras=[];
  (m==="cocina" ? buildOven().concat(buildElec(),buildGas()) : m==="armario" ? buildArmHw() : m==="cama" ? buildCamaHw() : CAMA_CFG[m] ? buildCamaHw(m).concat(MECS[m]?buildMec(m):[], CAMA_CFG[m].desk?buildDeskHw():[]) : []).forEach(o=>{
    const b=o.b; let geo;
    if(o.k==="xcyl"){ geo=new THREE.CylinderGeometry(o.r*S,o.r*S,(b[1]-b[0])*S,24); geo.rotateZ(Math.PI/2); }
    else if(o.k==="sph") geo=new THREE.SphereGeometry(o.r*S,18,12);
    else if(o.k==="seg"||o.k==="sc") geo=new THREE.CylinderGeometry(o.r*S,o.r*S,1,24);
    else geo=new THREE.BoxGeometry((b[1]-b[0])*S,(b[3]-b[2])*S,(b[5]-b[4])*S);
    const mat=new THREE.MeshStandardMaterial({color:o.c, roughness:o.n==="puerta"?.25:.5, metalness:o.n==="cuerpo"||o.n==="puerta"?.1:.6, transparent:true, opacity:1});
    const mesh=new THREE.Mesh(geo,mat), base=new THREE.Vector3(((b[0]+b[1])/2-C[0])*S, ((b[2]+b[3])/2)*S, ((b[4]+b[5])/2-C[2])*S);
    mesh.position.copy(base);
    const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({color:0x000000, transparent:true, opacity:.5}));
    mesh.add(edges);
    if(o.op){ mat.opacity=o.op; mat.depthWrite=false; }
    mesh.userData={id:o.id, oven:true, color:o.c, base, g:null, front:false, edges, bed:!!o.bed, desk:!!o.desk, lift:!!o.lift, op:o.op||1, spring:o.k==="seg"?o:null, sc:o.k==="sc"?o:null};
    if(o.k==="seg"||o.k==="sc") edges.visible=false;
    group.add(mesh); extras.push(mesh);
  });
  V3.extras=extras; V3.openSet.clear(); V3.doorSet.clear(); V3.pos={}; V3.hidden=new Set(); V3.lyrOpen=new Set(); if(typeof MEAS!=="undefined"){ measClear(); if(MEAS.on) setTimeout(measShow); }
  V3.bedA=-Math.PI/2;
  if(/^cama/.test(m)) meshes.concat(extras).forEach(o=>{ if(o.userData.bed||o.userData.spec?.bed) o.rotation.x=-Math.PI/2; });
  $("#v3mec").hidden = !MECS[m];
  V3.group=group; V3.meshes=meshes; V3.H=(mx[1]-mn[1])*S; V3.W=(mx[0]-mn[0])*S;
  V3.scene.add(group);
  resetCam(); look3D(); renderInfo3D(); renderChips3D(); renderDrawers3D();
}
function resetCam(){
  const W=V3.W||2, H=V3.H||.85, cam=V3.camera;
  // distancia para que quepa todo el ancho, también con el celular vertical
  const half=Math.tan(cam.fov*Math.PI/360);
  const dist=Math.max((W*0.62)/(half*cam.aspect), (H*0.9)/half);
  const dir=new THREE.Vector3(-0.45,0.42,0.9).normalize();
  V3.controls.target.set(0,H*0.42,0);
  cam.position.copy(V3.controls.target).addScaledVector(dir,dist);
  V3.controls.maxDistance=dist*2.2; V3.controls.update();
}
const DOORS = {cama5:[{k:"cama",n:"Cama (bajar / subir)"}], cama:[{k:"cama",n:"Cama (bajar / subir)"}], cama2:[{k:"cama",n:"Cama (bajar / subir)"}], cama3:[{k:"cama",n:"Cama (bajar / subir)"}], cama4:[{k:"cama",n:"Cama (bajar / subir)"}], armario:[{k:"a-p1",n:"Puerta 1 (izquierda)"},{k:"a-p2",n:"Puerta 2"},{k:"a-p3",n:"Puerta 3"},{k:"a-p4",n:"Puerta 4 (derecha)"}], cocina:[{k:"c-pi",n:"Puerta izquierda (412)"},{k:"c-pd",n:"Puerta derecha (404,5)"}], tv:[{k:"t-pi",n:"Puerta izquierda de la despensa"},{k:"t-pd",n:"Puerta derecha de la despensa"}]};
const DOOR_ANGLE = 100*Math.PI/180;
const DOOR_FOR = {"a-p4":/^ai/}; // puerta que hay que abrir para sacar esos cajones
// V3.pos[k] = 0..1 (0 cerrado, 1 abierto). Si no hay valor, manda el estado abierto/cerrado de siempre.
function doorFrac(k){ const re=DOOR_FOR[k], auto=!!re && (V3.open || [...V3.openSet].some(g=>re.test(g)) || (V3.area && re.test(V3.area)));
  const f=V3.pos?.[k] ?? (V3.doorSet.has(k)?1:0); return auto?1:f; }
function drawerFrac(g, spec){ if(V3.open || (V3.area && AREA_BY_KEY[V3.area]?.drawer && AREA_BY_KEY[V3.area].t(spec))) return 1; return V3.pos?.[g] ?? (V3.openSet.has(g)?1:0); }
function doorIsOpen(k){ if(V3.pos?.[k]!=null) return V3.pos[k]>0.5 || doorFrac(k)>0.5; if(V3.doorSet.has(k)) return true; const re=DOOR_FOR[k]; return !!re && (V3.open || [...V3.openSet].some(g=>re.test(g)) || (V3.area && re.test(V3.area))); }
function doorRot(u){ if(!u.spec?.door || u.spec.bed) return 0; const f=doorFrac(u.spec.door); return f ? (u.spec.hinge==="L"?-DOOR_ANGLE:DOOR_ANGLE)*f : 0; }
function targetOf(o){
  const u=o.userData, t=u.base.clone();
  const phi=doorRot(u);
  if(phi){ // gira sobre la bisagra: canto del lado de la bisagra, cara de atrás de la puerta
    const sx=u.spec.hinge==="L"?1:-1, vx=sx*u.hw, vz=u.hd;
    const px=u.base.x - vx, pz=u.base.z - vz;
    t.x=px + vx*Math.cos(phi) + vz*Math.sin(phi); t.z=pz - vx*Math.sin(phi) + vz*Math.cos(phi);
  }
  if(V3.explode>0){ const dir=u.base.clone(); dir.y-= (V3.H||.85)/2; t.addScaledVector(dir, V3.explode*0.9); if(u.front) t.z+=V3.explode*0.25; }
  if(u.g) t.z+=0.38*drawerFrac(u.g, u.spec);
  return t;
}
function bedAngle(){ return -Math.PI/2*(1-doorFrac("cama")); }
const _up=new THREE.Vector3(0,1,0);
function step3D(){
  V3.bedA=(V3.bedA??-Math.PI/2)+(bedAngle()-(V3.bedA??-Math.PI/2))*0.16;
  const liftT=(CAMA_CFG[V3.m]?.desk && doorFrac("cama")===0 && Math.abs(V3.bedA+Math.PI/2)<0.01) ? DESK.LIFT*(V3.pos?.lift||0) : 0;
  V3.liftS=(V3.liftS||0)+(liftT-(V3.liftS||0))*0.15;
  for(const o of V3.meshes.concat(V3.extras)){
    const u=o.userData;
    if(u.spring){   // pistón: de la rótula fija A a la rótula móvil Q (que gira con la cama)
      const S=0.001, C=V3.C, PY=BED_PIVOT.y*S, PZ=(BED_PIVOT.z-C[2])*S, a=V3.bedA, x=(u.spring.x-C[0])*S;
      const sp=u.spring, A=new THREE.Vector3(x, sp.A.y*S, (sp.A.z-C[2])*S), dy=sp.Q.y*S-PY, dz=(sp.Q.z-C[2])*S-PZ;
      const Q=new THREE.Vector3(x, PY+dy*Math.cos(a)-dz*Math.sin(a), PZ+dy*Math.sin(a)+dz*Math.cos(a));
      if(sp.lnk){ Q.y+=DESK.OFF.y*S; Q.z+=DESK.OFF.z*S; }
      const v=Q.clone().sub(A), L=v.length(), n=v.divideScalar(L), p=new THREE.Vector3(0,n.z,-n.y);   // p: a un lado, en el plano del hueco
      const len=sp.len!=null?sp.len*S:Math.max(0.001,L-sp.s0*S), s0=A.clone().addScaledVector(n,sp.s0*S).addScaledVector(p,(sp.off||0)*S);
      o.position.copy(s0).addScaledVector(n,len/2); o.quaternion.setFromUnitVectors(_up,n); o.scale.set(1,len,1);
      V3.mecL=L*1000;
      continue;
    }
    if(u.sc){   // tijera del convertidor: barras de largo fijo que se cruzan; su alto depende de cuánto suba
      const S=0.001, C=V3.C, d=deskDelta(V3.bedA), h=DESK.SC.y1-DESK.SC.y0+(V3.liftS||0), span=Math.sqrt(Math.max(1,DESK.SC.L**2-h**2));
      const A=new THREE.Vector3((u.sc.x-C[0])*S, (DESK.SC.y0+d.y)*S, (DESK.SC.zc-u.sc.sg*span/2+d.z-C[2])*S);
      const B=new THREE.Vector3((u.sc.x-C[0])*S, (DESK.SC.y0+h+d.y)*S, (DESK.SC.zc+u.sc.sg*span/2+d.z-C[2])*S);
      const v=B.clone().sub(A), L=v.length(); o.position.copy(A).addScaledVector(v,0.5); o.quaternion.setFromUnitVectors(_up,v.divideScalar(L)); o.scale.set(1,L,1); continue;
    }
    if(u.desk || u.spec?.desk){   // escritorio: se traslada igual que su pasador, sin girar (paralelogramo)
      const d=deskDelta(V3.bedA), t=u.spec?targetOf(o).sub(u.base):new THREE.Vector3(), lf=u.lift?(V3.liftS||0):0;
      o.position.set(u.base.x+t.x, u.base.y+(d.y+lf)*0.001+t.y, u.base.z+d.z*0.001+t.z); continue;
    }
    if(u.bed || u.spec?.bed){   // la cama gira sobre su eje (x); la posición sigue el arco
      o.rotation.x=V3.bedA;
      const S=0.001, PY=BED_PIVOT.y*S, PZ=(BED_PIVOT.z-V3.C[2])*S, a=o.rotation.x, dy=u.base.y-PY, dz=u.base.z-PZ;
      const t=u.spec?targetOf(o).sub(u.base):new THREE.Vector3();
      o.position.set(u.base.x+t.x, PY+dy*Math.cos(a)-dz*Math.sin(a)+t.y, PZ+dy*Math.sin(a)+dz*Math.cos(a)+t.z);
      continue;
    }
    const t=targetOf(o); o.position.lerp(t, 0.18); const r=u.spec?doorRot(u):0; o.rotation.y+=(r-o.rotation.y)*0.18;
  }
}
function look3D(){
  const area=V3.area?AREA_BY_KEY[V3.area]:null, selSet=V3.sel||area;
  for(const o of V3.meshes){
    const u=o.userData, mat=u.mat||o.material, em=u.edges.material;
    const isSel = area ? area.t(u.spec) : !!(V3.sel && u.id===V3.sel);
    let vis = !(V3.hideFronts && u.front && !isSel);
    if(V3.isolate && selSet && !isSel) vis=false;
    if(V3.hidden?.has(u.k)) vis=false;
    o.visible=vis;
    let op=1, color=null, emi=0x000000;
    if(selSet){ if(isSel){ color="#ffb020"; emi=0x6a3d00; } else op=.16; }
    else if(V3.missing){ const found=u.idx < cnt(u.id); if(!found) op=.18; }
    mat.color.set(color||pieceColor(V3.m,{id:u.id,front:u.front,g:u.g}));
    mat.emissive.setHex(emi);
    mat.opacity=op; mat.depthWrite = op>.5;
    if(u.edgeMat){ u.edgeMat.color.set(color||cantoColor(V3.m,{id:u.id,front:u.front,g:u.g})); u.edgeMat.emissive.setHex(emi); u.edgeMat.opacity=op; u.edgeMat.depthWrite=op>.5; }
    em.opacity = op<1 ? op*.6 : .75;
    em.color.setHex(isSel?0x000000:edgeHex(V3.m,{id:u.id,front:u.front,g:u.g}));
  }
  for(const o of V3.extras){
    const u=o.userData, mat=o.material, me=V3.sel===u.id;
    o.visible = V3.showOven && !(V3.isolate && selSet && !me);
    const op = selSet && !me ? .16 : (u.op||1);
    const keep=me && u.id==="__mec";   // el mecanismo conserva sus colores (acero, pistón negro, vástago cromado)
    mat.color.set(me&&!keep?"#ffb020":u.color); mat.emissive.setHex(me&&!keep?0x6a3d00:keep?0x1a1205:0);
    mat.opacity=op; mat.depthWrite=op>.5; u.edges.material.opacity=op<1?op*.5:.5;
  }
  renderBar3D();
}
function frameMeshes(list){
  const box=new THREE.Box3(); list.forEach(o=>box.expandByObject(o));
  if(!box.isEmpty()){ const c=box.getCenter(new THREE.Vector3()); V3.controls.target.copy(c); }
}
function selectArea3D(k, frame){
  V3.area=k||null; V3.sel=null; V3.inst=null; V3.allAreas=false; V3.allPieces=false; if(!k) V3.isolate=false;
  look3D(); renderInfo3D(); renderChips3D(true);
  if(k && frame){ const a=AREA_BY_KEY[k]; frameMeshes(V3.meshes.filter(o=>a.t(o.userData.spec))); }
}
function select3D(id, frame, inst){
  V3.sel=id||null; V3.area=null; V3.inst=inst||null; V3.allAreas=false; V3.allPieces=false;
  if(!id) V3.isolate=false;
  look3D(); renderInfo3D(); renderChips3D(true);
  if(id && frame) frameMeshes(V3.meshes.filter(o=>o.userData.id===id));
}
function renderDrawers3D(){
  const el=$("#v3drawers"); if(!el) return; V3.pos=V3.pos||{};
  const row=(k,n,f,kind,extra="")=>`<div class="mvrow"><label class="mvn" for="mv-${k}">${n}</label><input id="mv-${k}" type="range" min="0" max="100" step="1" value="${Math.round(f*100)}" data-mv="${k}" data-kind="${kind}" ${extra}><span class="mvv" id="mvv-${k}">${Math.round(f*100)} %</span></div>`;
  const items=[...DOORS[V3.m].map(d=>row(d.k, d.k==="cama"?"🛏 Cama (0 = arriba, 100 = abajo)":"🚪 "+esc(d.n), doorFrac(d.k), "door")),
    ...AREAS[V3.m].filter(a=>a.drawer).map(a=>row(a.k, "▭ "+esc(a.n), V3.open?1:(V3.pos[a.k]??(V3.openSet.has(a.k)?1:0)), "drawer"))];
  el.innerHTML=items.join("");
  el.querySelectorAll("[data-mv]").forEach(s=>{ s.oninput=()=>{ const k=s.dataset.mv, f=s.value/100; V3.pos[k]=f; $("#mvv-"+k).textContent=s.value+" %";
      if(s.dataset.kind==="door"){ f>0.5?V3.doorSet.add(k):V3.doorSet.delete(k); if(k==="cama" && f>0 && V3.pos.lift){ V3.pos.lift=0; } }
      if(s.dataset.kind==="drawer"){ if(V3.open){ V3.open=false; $("#v3open").setAttribute("aria-pressed",false); } f>0.5?V3.openSet.add(k):V3.openSet.delete(k); }
      V3.touched=true; };
    s.onchange=()=>{ renderDrawers3D(); renderInfo3D(); renderBar3D(); renderChips3D(); }; });
}
function toggleDoor(k){ V3.doorSet.has(k)?V3.doorSet.delete(k):V3.doorSet.add(k); V3.pos=V3.pos||{}; V3.pos[k]=V3.doorSet.has(k)?1:0; if(k==="cama") V3.pos.lift=0; renderDrawers3D(); renderInfo3D(); renderBar3D(); renderChips3D(); }
function toggleDrawer(k){
  if(V3.open){ V3.open=false; $("#v3open").setAttribute("aria-pressed",false); AREAS[V3.m].filter(a=>a.drawer).forEach(a=>V3.openSet.add(a.k)); }
  V3.openSet.has(k)?V3.openSet.delete(k):V3.openSet.add(k); V3.pos=V3.pos||{}; V3.pos[k]=V3.openSet.has(k)?1:0;
  renderDrawers3D(); renderInfo3D(); renderBar3D(); renderChips3D();
}
function renderInfo3D(){
  const el=$("#v3info"), tag=$("#v3tag");
  tag.hidden=!V3.sel && !V3.area;
  if(V3.area){
    const a=AREA_BY_KEY[V3.area], list=piecesOfArea(V3.area), total=list.reduce((s,r)=>s+r.n,0);
    tag.innerHTML=`${mtag(a.m)}<b>${esc(a.n)}</b><span class="dims">${total} piezas</span>`; tag.onclick=null;
    el.innerHTML=`<div class="v3sel">
      <div class="row" style="justify-content:space-between;gap:8px">${mtag(a.m)}<span class="hint">${total} piezas · ${list.length} tipos</span></div>
      <div class="v3name">${esc(a.n)}</div>
      ${a.drawer?`<p class="hint" style="margin:0">El cajón se muestra abierto para que veas cómo va armado.</p>`:""}
      <div class="plist">${list.map(r=>{const c=cnt(r.x.id);return `<button class="prow" type="button" data-pick3="${r.x.id}"><span class="itm">${esc(r.x.it.replace(/ /g,""))}</span><span style="min-width:0"><span class="t">${esc(r.x.n)}${r.n>1?` ×${r.n}`:""}</span><span class="s"><span>Plano: ${esc(r.x.pl)}</span><span class="dims">${dimStr(r.x)}</span>${r.x.ids?`<span>ID ${esc(r.x.ids)}</span>`:""}</span></span><span class="r"><span class="st ${c>=r.x.q?"done":""}"><span class="g">${c===0?"○":c<r.x.q?"◐":"●"}</span>${c}/${r.x.q}</span></span></button>`}).join("")}</div>
      <div class="row">
        <button class="btn sm" type="button" id="v3iso">${V3.isolate?"Mostrar todo":"Ver solo este conjunto"}</button>
        <button class="btn sm" type="button" id="v3clear">Quitar selección</button>
      </div></div>`;
    el.querySelectorAll("[data-pick3]").forEach(b=>b.onclick=()=>{ select3D(b.dataset.pick3,true); $("#v3canvas").scrollIntoView({behavior:"smooth",block:"center"}); });
    $("#v3iso").onclick=()=>{ V3.isolate=!V3.isolate; look3D(); renderInfo3D(); };
    $("#v3clear").onclick=()=>selectArea3D(null);
    return;
  }
  if(V3.sel==="__esc"){
    tag.hidden=false; tag.innerHTML=`<b>Escritorio que no se inclina</b><span class="dims">paralelogramo · eléctrico</span>`; tag.onclick=null;
    const row=(k,v)=>`<div class="srow"><span class="k">${k}</span><span class="v">${v}</span></div>`;
    el.innerHTML=`<div class="v3sel"><div class="v3name">Escritorio de todo el ancho</div>
      <p class="hint" style="margin:0">Un marco de acero cuelga de la cama por 2 pasadores y lo sostienen 2 barras ancladas al piso, paralelas al tramo eje → pasador de la cama y del mismo largo (592 mm). Esas 4 líneas forman un paralelogramo: al girar la cama, el escritorio solo sube o baja, sin inclinarse. Mueve el deslizador de la cama para verlo a medio camino.</p>
      <div class="spec">
      ${row("Cerrada","Tablero de 189 × 50 cm a <b>75 cm</b> del piso, con faldón de 6 cm. Las barras quedan casi verticales debajo, como patas.")}
            ${row("Abierta","El conjunto se mete debajo de la cama: tablero a 11 cm del piso. Encima caben cosas de <b>hasta 13 cm</b> (portátil, libros, cuadernos).")}
      ${row("Eléctrico","La cama la mueven 2 actuadores de <b>1500 N</b> (con el escritorio y lo que tenga encima harían falta ~860 N: el de 900 N quedaría al 96 %, sin margen).")}
      ${row("Pasadores en la cama","A 86 cm de la pared (cama abierta), bajo la base, en un bloque atornillado a los lastres.")}
      ${row("Soportes al piso","A 33 cm de la pared y 7 cm de alto, atornillados al piso con chazo. Es lo único fijo delante del mueble.")}
      ${row("Ojo","Antes de bajar la cama, quita lo que mida más de 13 cm. La repisa de abajo del kit se reemplaza por el escritorio; uno de sus laterales pasa a ser la pata del pie.")}
      </div><div class="row"><button class="btn sm" type="button" id="v3clear">Quitar selección</button></div></div>`;
    $("#v3clear").onclick=()=>select3D(null);
    return;
  }
  if(V3.sel==="__mec"){
    const m=V3.m, K=MECS[m], L=Math.round(V3.mecL||0), act=K.kind==="act";
    tag.hidden=false; tag.innerHTML=`<b>${act?"Mecanismo eléctrico (actuadores)":"Mecanismo de ayuda con pistones"}</b><span class="dims">diseño propio · 2 lados iguales</span>`; tag.onclick=null;
    const row=(k,v)=>`<div class="srow"><span class="k">${k}</span><span class="v">${v}</span></div>`;
    const gap=K.face-15, Lr={cama2:"379 abierta, 551 cerrada", cama3:"410 abierta, 699 cerrada", cama5:"410 abierta, 699 cerrada", cama4:"571 abierta, 715 cerrada"}[m];
    let rows=row("1 · Placa del lateral",`Acero de 4 mm, ${K.plate[1]-K.plate[0]} × ${K.plate[3]-K.plate[2]} mm, por dentro del lateral, con <b>6 pernos pasantes M8</b> y arandela grande por fuera. Reparte la fuerza: el MDP solo no aguanta.`)
      +row("2 · Eje",`Ø20 con buje, en el punto del eje del kit (29,6 cm del piso, 5,4 cm del frente). Atraviesa placa, lateral y ${m==="cama4"?"barra":"cabecera"}. Reemplaza el tornillo M8 del kit.`)
      +row("3 · Brazo de la cama",`Platina de 4 mm, ${K.arm[3]-K.arm[2]} × 88 mm, por fuera de la ${m==="cama4"?"barra":"cabecera"} con 3 pernos pasantes. Gira con la cama y lleva la oreja del punto móvil.`);
    if(m==="cama2") rows+=row("4 · Pistón a gas",`<b>800 N</b>, 560 mm ojo a ojo extendido, carrera 200 (usa 172), con rótulas M8. Punto fijo a 69,6 cm del piso y 20 cm de la pared; punto móvil 3 cm arriba y 15 cm detrás del eje. Sirve el AUTOHAUX 22" de 800 N.`)
      +row("Cómo se siente","Sin ayuda: ~28 kg en el borde. Con 2 pistones: <b>~3 kg</b>. Abierta se queda abajo; pasando ~65° sube sola y cerrada empuja suave contra las cerraduras (~5 kg).")
      +row("Cálculo","Cama + colchón ≈ 73 kg, centro a 45 cm del eje: 320 N·m acostada. Cada pistón da 1000 N × 15,3 cm abierta y 800 N × 4,1 cm cerrada. Colchón de resortes de 35 kg o más: usa 900–1000 N.");
    if(m==="cama3"||m==="cama5") rows+=row("4 · Actuador lineal",`<b>12 V, ${K.F} N, carrera 300 mm</b>, 405 → 705 mm. Usa 410 → 699 mm${m==="cama5"?"":" (el de Temu, 10 mm/s: <b>~29 s</b> para abrir o cerrar)"}. Punto fijo a 70 cm del piso y 3 cm de la pared; punto móvil en la esquina de la cabecera, junto a la pared. ${m==="cama5"?"Con el escritorio, cada uno empuja como máximo <b>~860 N</b> (57 % de 1500); los de 1500 N suelen ir a 5–8 mm/s: <b>~40–60 s</b> por recorrido.":"Cada uno empuja como máximo <b>~650 N</b> (72 % de su capacidad)."}`)
      +row("5 · Conexión",`Fuente de <b>12 V y 10 A</b> (o más) → fusible de 15 A → interruptor de balancín <b>DPDT (ON)-OFF-(ON)</b> de mantener → los 2 actuadores <b>en paralelo</b> (rojo con rojo, negro con negro). Al invertir la polaridad cambia el sentido. Cable de 1,5 mm² (16 AWG). Traen fin de carrera interno: se paran solos arriba y abajo y ahí se vuelven a emparejar.`)
      +row("Seguridad",`<b>No tienen freno por obstáculo</b>: usa solo interruptor de mantener presionado (se mueve mientras lo aprietas). Quita las cerraduras o déjalas abiertas siempre. Sin corriente la cama no se mueve a mano: se queda donde está.`)
      +row("Por qué no al centro","Cerrada, la cama y el colchón llenan todo el alto (de 2,6 a 146 cm) y todo el fondo entre la pared y el frente; abierta, el marco y la repisa ocupan el piso. Un actuador al centro tendría que atravesar el colchón en algún punto del giro. Solo cabe a los lados.");
    if(m==="cama4") rows+=row("4 · Pistón a gas",`<b>~1400–1500 N</b>, unos 750 mm ojo a ojo extendido, carrera ≥ 150 (usa 144), con rótulas M8. Punto fijo a 88 cm del piso y 27,5 cm de la pared; punto móvil sobre la barra, 14 cm de la pared.`)
      +row("Cómo se siente","Sin ayuda: ~30 kg en el pie de la cama. Con 2 pistones: <b>~3,5 kg</b> como máximo. Abierta se queda abajo; pasando ~70° sube sola y cerrada se queda arriba.")
      +row("Cálculo","Vertical pesa más en la mano: el centro queda a 69 cm del eje (494 N·m acostada, contra 320 de la horizontal). Por eso los pistones son de ~1400 N.")
      +row("Espacio","Techo de 2,25 m o más (el mueble mide 2,18). Abierta, la cama sale 1,92 m de la pared.");
    el.innerHTML=`<div class="v3sel"><div class="v3name">${act?"Actuador eléctrico":"Mecanismo de ayuda"} (por lado)</div>
      <p class="hint" style="margin:0">Va en el hueco de ${gap} mm entre cada lateral y la cama. Ahora mismo ${act?"el actuador":"el pistón"} mide <b>${L} mm</b> de punto a punto (${Lr}).</p>
      <div class="spec">${rows}${row("Resistencia","El punto débil es el MDP de 15 mm: con un perno solo, la fuerza (hasta ~1500 N) lo aplasta y se agranda el agujero. Por eso: <b>sándwich</b> en el lateral (platina por dentro y contraplaca por fuera, 6 pernos pasantes: la fuerza se reparte en ~800 cm²) y en la cama una <b>escuadra de acero en L</b> que toma la cabecera y se atornilla por debajo a los lastres, en vez de colgar todo de una tabla de 10 × 1,5 cm. El eje lleva buje de bronce o nylon para no ovalar el agujero. Y el mueble anclado a la pared.")}${row("Ojo","Es un diseño mío, no del fabricante: móntalo con alguien que trabaje herrajes. Ancla el mueble a la pared. "+(act?"Prueba primero sin colchón.":"Monta los pistones con la cama CERRADA y trabada."))}</div>
      <div class="row"><button class="btn sm" type="button" id="v3clear">Quitar selección</button></div></div>`;
    $("#v3clear").onclick=()=>select3D(null);
    return;
  }
  if(V3.sel==="__cama"){
    tag.hidden=false; tag.innerHTML=`<b>Herrajes y colchón de la cama</b><span class="dims">no son piezas de madera</span>`; tag.onclick=null;
    el.innerHTML=`<div class="v3sel"><div class="v3name">Herrajes de la cama abatible</div><div class="spec">
      <div class="srow"><span class="k">Eje (G, E, F, H)</span><span class="v">2 tornillos M8 × 45 con arandelas y tuerca, uno por lado: atraviesan cada lateral y la cabecera. Sobre ellos gira la cama (paso 12). Según el dibujo del lateral (paso 8), el agujero queda a unos 30 cm del piso y a unos 6 cm del borde de adelante; en el 3D está a 29,6 y 5,4 cm. El manual no da la cota: usa siempre el agujero que viene hecho de fábrica.</span></div>
      <div class="srow"><span class="k">Cerraduras (I)</span><span class="v">2, en la base superior: traban la cama cerrada. <b>Siempre con llave puesta al cerrar</b> y retira la llave después.</span></div>
      <div class="srow"><span class="k">Colchón</span><span class="v">1,40 × 1,90. Cerrada queda entre la base y la trasera: en el modelo caben unos 20 cm de grueso; mídelo antes de comprarlo.</span></div>
      <div class="srow"><span class="k">Deslizadores</span><span class="v">6 sapatas D en el borde de la repisa bajo la cama (es lo que toca el piso cuando la bajas) y 4 M bajo los laterales.</span></div>
      <div class="srow"><span class="k">Fijación a la pared</span><span class="v">El kit trae 2 chazos de 8 mm (K) y 2 tornillos 5 × 60 (L). Úsalos para anclar el mueble a la pared: una cama abatible sin anclar se puede ir hacia adelante.</span></div>
      <div class="srow"><span class="k">Uso</span><span class="v">Aguanta 240 kg. Se necesitan 2 personas para abrirla y cerrarla. No subirse al mueble.</span></div>
    </div><div class="row"><button class="btn sm" type="button" id="v3clear">Quitar selección</button></div></div>`;
    $("#v3clear").onclick=()=>select3D(null);
    return;
  }
  if(V3.sel==="__herraje"){
    tag.hidden=false; tag.innerHTML=`<b>Herrajes del armario</b><span class="dims">no son piezas de madera</span>`; tag.onclick=null;
    el.innerHTML=`<div class="v3sel"><div class="v3name">Herrajes</div><div class="spec">
      <div class="srow"><span class="k">Tubos de colgar</span><span class="v">2: uno de ~431 mm en el módulo izquierdo (bajo la repisa de arriba) y uno de ~877 mm en el central.</span></div>
      <div class="srow"><span class="k">Patas</span><span class="v">De 6 cm, como dice el plano. En el 3D van 6 (esquinas y centro); el número real depende del kit.</span></div>
      <div class="srow"><span class="k">Bisagras</span><span class="v">4 por puerta (puertas de 1,78 m): 16 en total.</span></div>
      <div class="srow"><span class="k">Rieles</span><span class="v">9 pares de 45 cm: 6 para los cajones de abajo y 3 para los interiores.</span></div>
    </div><div class="row"><button class="btn sm" type="button" id="v3clear">Quitar selección</button></div></div>`;
    $("#v3clear").onclick=()=>select3D(null);
    return;
  }
  if(V3.sel==="__h"){
    tag.hidden=false; tag.innerHTML=`<b>H de madera bajo el horno</b><span class="dims">la armas tú · no viene en el despiece</span>`; tag.onclick=null;
    const T=H_GROSOR, mid=535-T;
    el.innerHTML=`<div class="v3sel">
      <div class="v3name">"H" bajo el horno</div>
      <div class="hint">Base de 5 cm que armas con tus tablas, sobre la base del mueble dentro del hueco del horno. El horno se apoya encima y el frente queda cerrado, como un zócalo.</div>
      <div class="spec">
        <div class="srow"><span class="k">Forma</span><span class="v">Vista desde arriba es una H acostada: el frente y una tabla atrás, a lo ancho del hueco, unidos por una tabla al medio de adelante hacia atrás.</span></div>
        <div class="srow"><span class="k">Frente</span><span class="v mono">Tira de melamina TIVOLI 618 × 50 × 15, con canto arriba</span><span class="v"> · No viene en el pedido: pídela en Madecentro. Va al ras del mueble, justo debajo de la puerta del horno.</span></div>
        <div class="srow"><span class="k">Tus tablas</span><span class="v mono">1 de 618 × 50 (atrás, a 3 cm del borde trasero)<br>1 de ${mid} × 50 (centro)</span></div>
        <div class="srow"><span class="k">Ajustes</span><span class="v">618 = el hueco de 620 entre listones menos 2 mm de holgura. La del centro mide 535 − grueso de tus tablas (${mid} si son de ${T} mm), para que vaya de la tabla de atrás a la tira de melamina.</span></div>
        <div class="srow"><span class="k">Alto</span><span class="v">50 mm, como indicó Madecentro. Con el hueco de 645 del modelo quedan 595 para el horno (mide 596 de frente; su cuerpo entra y el frente va por delante del mueble). Si al armar el hueco te da 660, quedan 610, justo lo del manual.</span></div>
        <div class="srow"><span class="k">Ventilación</span><span class="v">El aire del horno sale hacia arriba, hacia el cajón bajo: por eso la repisa del horno mide 559 de fondo y deja ~2 cm libres atrás. No tapes ese espacio.</span></div>
      </div>
      <div class="row"><button class="btn sm" type="button" id="v3clear">Quitar selección</button></div></div>`;
    $("#v3clear").onclick=()=>select3D(null);
    return;
  }
  if(V3.sel==="__gas"){
    tag.hidden=false; tag.innerHTML=`<b>Instalación de gas del horno</b><span class="dims">según el manual · posición A recomendada</span>`; tag.onclick=null;
    el.innerHTML=`<div class="v3sel">
      <div class="v3name">Instalación de gas</div>
      <div class="hint">En el 3D: codo de 90° en la entrada del horno, manguera metálica por detrás del mueble y registro en la pared a la derecha del mueble (posición A, la recomendada por el manual). La ubicación exacta del registro es una sugerencia.</div>
      <div class="spec">
        <div class="srow"><span class="k">Registro (llave)</span><span class="v"><b>Exclusivo</b> para el horno, en el mismo cuarto, <b>visible y fuera del hueco y del mueble</b>, para cerrarlo rápido. Recomendado al lado del nicho (posición A o E del manual), a <b>350–700 mm del piso</b> y a máximo <b>1.150 mm</b> del centro del horno. En el 3D queda a 465 mm y a 500 de altura.</span></div>
        <div class="srow"><span class="k">Codo de 90°</span><span class="v"><b>Obligatorio en tu caso:</b> el hueco mide 580 de fondo (menos de 650), así que entre la entrada de gas del horno y la manguera va un codo de 90° de <b>latón, rosca macho × hembra de 1/2" BSP</b>.</span></div>
        <div class="srow"><span class="k">Manguera</span><span class="v"><b>Metálica flexible de 1/2"</b>, aprobada por el fabricante. Nunca de plástico ni solo forrada en metal. <b>Una sola</b>, sin uniones en serie. No debe tocar cajones ni partes que se muevan, ni atravesar paredes, pisos o divisiones: por eso va por detrás del mueble.</span></div>
        <div class="srow"><span class="k">Conexión</span><span class="v">Llave de <b>22 mm</b> en la entrada del horno y de <b>26 mm (1")</b> en el registro, cada una con su anillo de sellado.</span></div>
        <div class="srow"><span class="k">Gas natural o propano</span><span class="v"><b>Gas natural (red):</b> al registro de pared. <b>Cilindro (GLP):</b> siempre con regulador de presión; si la manguera de 125 cm no alcanza, se hace con tubo de cobre o acero. Manguera y regulador se cambian cada 5 años. Si el horno viene para otro gas, la conversión la hace el Servicio Autorizado (en Colombia la primera es gratis en garantía).</span></div>
        <div class="srow"><span class="k">Prueba de fugas</span><span class="v">Con todo conectado, pasa <b>jabón líquido espeso</b> por cada unión: si hace burbujas, hay fuga. Nunca con fuego.</span></div>
        <div class="srow"><span class="k">Ventilación</span><span class="v">La cocina debe tener ventilación permanente (rejillas abiertas o campana), porque el horno a gas produce calor y humedad.</span></div>
        <div class="srow"><span class="k">Quién lo hace</span><span class="v">Un <b>gasista certificado</b>. La instalación gratuita de Electrolux no incluye la red de gas, el registro ni los materiales.</span></div>
      </div>
      <div class="row"><button class="btn sm" type="button" id="v3clear">Quitar selección</button></div></div>`;
    $("#v3clear").onclick=()=>select3D(null);
    return;
  }
  if(V3.sel==="__elec"){
    tag.hidden=false; tag.innerHTML=`<b>Instalación eléctrica del horno</b><span class="dims">toma sugerida · según el manual</span>`; tag.onclick=null;
    el.innerHTML=`<div class="v3sel">
      <div class="v3name">Instalación eléctrica</div>
      <div class="hint">En el 3D: toma en la pared encima del mesón y cable por detrás del mueble. La posición exacta de la toma es una sugerencia que cumple el manual.</div>
      <div class="spec">
        <div class="srow"><span class="k">Dónde va la toma</span><span class="v"><b>Fuera del hueco del horno</b>, de fácil acceso. El manual da como correcto: "lado de afuera del nicho y encima del mostrador". <b>Incorrecto:</b> dentro del hueco o detrás del horno.</span></div>
        <div class="srow"><span class="k">Toma</span><span class="v"><b>Exclusiva</b> para el horno y <b>con polo a tierra</b>. Sin extensiones ni multitomas en T. Si el enchufe del horno no encaja, cambia la toma; no uses adaptador ni modifiques el enchufe.</span></div>
        <div class="srow"><span class="k">Breaker</span><span class="v">El horno debe poder desconectarse en todos los polos (apertura de contacto de al menos 3 mm): un breaker (termomagnético) propio, también fuera del hueco y a mano.</span></div>
        <div class="srow"><span class="k">Voltaje</span><span class="v">Revisa que el voltaje de la casa sea el de la etiqueta del horno (127 V o 220 V según la versión). Si la luz varía mucho o se corta seguido, el manual pide un estabilizador de 3.500 VA o más.</span></div>
        <div class="srow"><span class="k">Cable</span><span class="v">Lejos de las paredes calientes del horno y sin que el horno quede encima. El manual recomienda un paso de Ø80 mm; aquí sale por detrás porque el mueble no lleva fondo.</span></div>
        <div class="srow"><span class="k">Quién lo hace</span><span class="v">Un electricista. En Colombia, la instalación del horno por el Servicio Autorizado es gratis (se pide en la web), pero <b>no incluye</b> la red eléctrica, la toma, el breaker ni la tierra: eso debe quedar listo antes.</span></div>
      </div>
      <p class="hint" style="margin:0">Aunque el horno es a gas, también se enchufa: el ventilador, la luz y el encendido usan corriente.</p>
      <div class="row"><button class="btn sm" type="button" id="v3clear">Quitar selección</button></div></div>`;
    $("#v3clear").onclick=()=>select3D(null);
    return;
  }
  if(V3.sel==="__horno"){
    tag.hidden=false; tag.innerHTML=`<b>${OVEN_INFO.name}</b><span class="dims">electrodoméstico, no es pieza del mueble</span>`; tag.onclick=null;
    const ok=(t)=>`<span class="st done"><span class="g">✓</span></span> ${t}`;
    el.innerHTML=`<div class="v3sel">
      <div class="v3name">${OVEN_INFO.name}</div>
      <div class="hint">${OVEN_INFO.sub}. Va en el hueco de la derecha del mueble de cocina, apoyado sobre la H de madera.</div>
      <div class="spec">
        <div class="srow"><span class="k">Medidas del horno</span><span class="v mono">596 alto × 596 ancho × 613 fondo con manija (ficha oficial) · cuerpo 560 de ancho (manual)</span></div>
        <div class="srow"><span class="k">Ancho del hueco</span><span class="v">${ok("620 mm entre listones; el manual pide mínimo 600")}</span></div>
        <div class="srow"><span class="k">Fondo</span><span class="v">${ok("580 mm; el manual pide mínimo 580 (550 del horno + 30 de ventilación). Queda justo.")}</span></div>
        <div class="srow"><span class="k">Alto del hueco</span><span class="v"><span class="st"><span class="g">!</span></span> Hueco de 645 de la base a la repisa (según el modelo). Con la H de 50 quedan <b>595</b> por dentro: el cuerpo del horno entra y el frente (596) va por delante del mueble. El manual recomienda 610; si al armar el hueco mide 660, con la H de 50 da justo 610.</span></div>
        <div class="srow"><span class="k">Ventilación</span><span class="v">El aire sale hacia arriba, al cajón bajo, por el espacio de ~2 cm que deja la repisa atrás (mide 559 de fondo en un mueble de 580). No lo tapes.</span></div>
        <div class="srow"><span class="k">Tipo</span><span class="v"><b>A gas con ventilador (convección).</b> Usa gas para cocinar y corriente para el ventilador, la luz y el encendido: necesita <b>registro de gas y toma eléctrica</b>. Toca cada uno en el 3D para ver cómo se instala.</span></div>
        <div class="srow"><span class="k">Modelo</span><span class="v">El PDF dice OE8EH, que es la versión eléctrica. Si el tuyo es a gas con ventilador, es un <b>OE8GH u OE8GF</b> (el OE8GL no trae ventilador): confírmalo en la etiqueta. Las medidas son las mismas.</span></div>
      </div>
      <div class="row"><button class="btn sm" type="button" id="v3clear">Quitar selección</button></div></div>`;
    $("#v3clear").onclick=()=>select3D(null);
    return;
  }
  if(V3.sel){ const s=byId[V3.sel]; tag.innerHTML=`${mtag(s.m)}<b>${esc(s.n)}</b><span class="dims">${dimStr(s)} · ×${s.q}</span>`; tag.onclick=()=>openPiece(s.id); }
  if(!V3.sel){
    el.innerHTML=`<div class="v3empty"><b>Toca una pieza</b> del mueble para ver cuál es, o elígela en la lista de abajo.</div>`;
    return;
  }
  const x=byId[V3.sel], c=cnt(x.id), approx=V3.meshes.some(o=>o.userData.id===x.id&&o.userData.approx);
  el.innerHTML=`<div class="v3sel">
    <div class="row" style="justify-content:space-between;gap:8px">${mtag(x.m)}<span class="st ${c>=x.q?"done":""}"><span class="g">${c===0?"○":c<x.q?"◐":"●"}</span>${c}/${x.q} encontradas</span></div>
    <div class="v3name">${esc(x.n)}</div>
    ${V3.inst&&V3.inst.door?`<button class="btn sm" type="button" data-door="${V3.inst.door}" style="align-self:flex-start">${V3.inst.door==="cama"?(V3.doorSet.has("cama")?"Subir la cama":"Bajar la cama"):(V3.doorSet.has(V3.inst.door)?"Cerrar":"Abrir")+" esta puerta"}</button>`:""}
    ${(()=>{ const own=V3.inst&&V3.inst.g?AREAS[x.m].find(a=>a.drawer&&a.t(V3.inst)):null; return own?`<button class="btn sm" type="button" data-dr="${own.k}" style="align-self:flex-start">${V3.openSet.has(own.k)||V3.open?"Cerrar":"Abrir"} este cajón</button>`:""; })()}
    ${(()=>{ const own=V3.inst&&V3.inst.g?AREAS[x.m].find(a=>a.drawer&&a.t(V3.inst)):null; return own?`<button class="btn sm info" type="button" data-area="${own.k}" style="align-self:flex-start">Esta es del ${esc(own.n)} · ver el cajón completo</button>`:""; })()}
    <p style="margin:0">${esc(x.w)}</p>
    ${specHTML(x)}
    <div class="row">
      <button class="btn sm info" type="button" id="v3ficha">Ver ficha y plano</button>
      <button class="btn sm" type="button" id="v3iso">${V3.isolate?"Mostrar todo":"Ver sola"}</button>
      <button class="btn sm" type="button" id="v3clear">Quitar selección</button>
    </div></div>`;
  $("#v3ficha").onclick=()=>openPiece(x.id);
  el.querySelectorAll("[data-area]").forEach(b=>b.onclick=()=>selectArea3D(b.dataset.area,true));
  el.querySelectorAll("[data-dr]").forEach(b=>b.onclick=()=>toggleDrawer(b.dataset.dr));
  el.querySelectorAll("[data-door]").forEach(b=>b.onclick=()=>toggleDoor(b.dataset.door));
  $("#v3iso").onclick=()=>{ V3.isolate=!V3.isolate; look3D(); renderInfo3D(); };
  $("#v3clear").onclick=()=>select3D(null);
}
const drawerOf = sp => sp?.g ? AREAS[V3.m].find(a=>a.drawer && a.t(sp)) : null;
const isDrawerOpen = k => V3.open || V3.openSet.has(k);
function toggleByMesh(o){
  const sp=o.userData.spec; if(!sp) return false;
  if(sp.door){ toggleDoor(sp.door); return true; }
  const d=drawerOf(sp); if(d){ toggleDrawer(d.k); return true; }
  return false;
}
const meshesOf = f => V3.meshes.filter(o=>f(o.userData.spec));
const visState = l => { const h=l.filter(o=>V3.hidden.has(o.userData.k)).length; return !l.length||h===0?"on":h===l.length?"off":"part"; };
function setHidden(list, hide){
  list.forEach(o=>hide?V3.hidden.add(o.userData.k):V3.hidden.delete(o.userData.k));
  if(hide && V3.sel && byId[V3.sel] && !V3.meshes.some(o=>o.userData.id===V3.sel && !V3.hidden.has(o.userData.k))){ V3.sel=null; V3.inst=null; }
  if(hide && V3.area && visState(meshesOf(AREA_BY_KEY[V3.area].t))==="off") V3.area=null;
  if(!V3.sel && !V3.area) V3.isolate=false;
  look3D(); renderInfo3D(); renderChips3D();
}
const EYE={on:["i-eye","Visible"], off:["i-eyeoff","Oculto"], part:["i-eyehalf","Parcial"]};
const eyeBtn=(st,attrs,label)=>`<button class="eye ${st}" type="button" ${attrs} aria-pressed="${st!=="off"}" aria-label="${st==="off"?"Mostrar":"Ocultar"} ${esc(label)}">${ico(EYE[st][0])}<span>${EYE[st][1]}</span></button>`;
function canvasIntoView(){ const r=$("#v3canvas").getBoundingClientRect(); if(r.top<60 || r.bottom>innerHeight) $("#v3canvas").scrollIntoView({behavior:"smooth",block:"center"}); }
function renderChips3D(){
  const el=$("#v3layers"); if(!el || !V3.meshes) return;
  const m=V3.m, tab=V3.lyrTab||"areas", sel=V3.sel&&byId[V3.sel]?byId[V3.sel]:null, area=V3.area?AREA_BY_KEY[V3.area]:null, nh=V3.hidden?.size||0;
  $("#v3showAll").hidden=!nh; $("#v3showAll").innerHTML=`${ico("i-eye")} Mostrar todo (${nh} oculta${nh===1?"":"s"})`;
  document.querySelectorAll("#v3lyrTab button").forEach(b=>b.setAttribute("aria-pressed", b.dataset.v===tab));
  const pieceRow=(x,n,inK)=>{ const a=inK?AREA_BY_KEY[inK]:null, l=meshesOf(s=>s.id===x.id && (!a||a.t(s))), st=visState(l);
    return `<div class="lyr ${st==="off"?"off":""} ${V3.sel===x.id?"sel":""}">${eyeBtn(st,`data-hp="${x.id}" ${inK?`data-in="${inK}"`:""}`,x.n)}
      <button class="lname" type="button" data-c3="${x.id}" aria-pressed="${V3.sel===x.id}"><span class="t">${esc(x.n)}${n>1?` ×${n}`:""}</span><span class="s">${dimStr(x)}</span></button></div>`; };
  let h="";
  if(tab==="areas"){
    let areas=AREAS[m];
    if(sel && !V3.allAreas){ const ks=new Set((areaIndex()[sel.id]||[]).map(r=>r.k)); areas=areas.filter(a=>ks.has(a.k));
      h+=`<p class="hint">Solo los conjuntos donde va «${esc(sel.n)}». <button class="btn sm" type="button" id="v3allA">Ver todos</button></p>`; }
    const row=a=>{ const l=meshesOf(a.t), st=visState(l), open=V3.lyrOpen.has(a.k)||V3.area===a.k, own=V3.inst&&sel&&a.t(V3.inst);
      return `<div class="lyr ${st==="off"?"off":""} ${V3.area===a.k?"sel":""}">${eyeBtn(st,`data-ha="${a.k}"`,a.n)}
        <button class="lname" type="button" data-a3="${a.k}" aria-pressed="${V3.area===a.k}"><span class="t">${own?"● ":""}${esc(a.n)}</span><span class="s">${l.length} pieza${l.length===1?"":"s"}${a.drawer?` · ${isDrawerOpen(a.k)?"abierto":"cerrado"}`:""}${st==="part"?" · algunas ocultas":""}</span></button>
        ${a.drawer?`<button class="lact" type="button" data-dr="${a.k}">${isDrawerOpen(a.k)?"Cerrar":"Abrir"}</button>`:""}
        <button class="lexp" type="button" data-ex="${a.k}" aria-expanded="${open}" aria-label="${open?"Ocultar":"Ver"} piezas de ${esc(a.n)}">${open?"▾":"▸"}</button></div>
        ${open?`<div class="lsub">${piecesOfArea(a.k).map(r=>pieceRow(r.x,r.n,a.k)).join("")}</div>`:""}`; };
    const dr=areas.filter(a=>a.drawer), zn=areas.filter(a=>!a.drawer);
    if(zn.length) h+=`<div class="lyrsec">Zonas</div>`+zn.map(row).join("");
    if(dr.length) h+=`<div class="lyrsec">Cajones</div>`+dr.map(row).join("");
    const doors=DOORS[m].filter(d=>!sel||V3.allAreas||V3.meshes.some(o=>o.userData.spec?.door===d.k&&o.userData.id===sel.id));
    if(doors.length) h+=`<div class="lyrsec">${m==="cama"?"Cama":"Puertas"}</div>`+doors.map(d=>{ const l=meshesOf(s=>s.door===d.k), st=visState(l), x=l[0]?byId[l[0].userData.id]:null, on=V3.sel&&V3.inst?.door===d.k;
      return `<div class="lyr ${st==="off"?"off":""} ${on?"sel":""}">${eyeBtn(st,`data-hd="${d.k}"`,d.n)}<button class="lname" type="button" data-sd="${d.k}" aria-pressed="${!!on}"><span class="t">${esc(d.n)}</span><span class="s">${d.k==="cama"?"":x?esc(x.n)+" · ":""}${d.k==="cama"?(doorIsOpen("cama")?"abajo (abierta)":"arriba (cerrada)"):doorIsOpen(d.k)?"abierta":"cerrada"}</span></button><button class="lact" type="button" data-door="${d.k}">${d.k==="cama"?(V3.doorSet.has(d.k)?"Subir":"Bajar"):V3.doorSet.has(d.k)?"Cerrar":"Abrir"}</button></div>`; }).join("");
  } else {
    let pieces=P.filter(x=>x.m===m), counts=null;
    if(area && !V3.allPieces){ const l=piecesOfArea(area.k); counts=Object.fromEntries(l.map(r=>[r.x.id,r.n])); pieces=pieces.filter(x=>counts[x.id]);
      h+=`<p class="hint">Solo las piezas de «${esc(area.n)}». <button class="btn sm" type="button" id="v3allP">Ver todas</button></p>`; }
    const inK=counts?area.k:null;
    [...new Set(pieces.map(x=>x.g))].forEach(g=>{ const ids=pieces.filter(x=>x.g===g).map(x=>x.id), l=meshesOf(s=>ids.includes(s.id)&&(!inK||AREA_BY_KEY[inK].t(s))), st=visState(l);
      h+=`<div class="row" style="justify-content:space-between;margin-top:8px"><span class="lyrsec" style="margin:0">${esc(g)}</span><button class="btn sm" type="button" data-hg="${esc(g)}">${st==="off"?"Mostrar grupo":"Ocultar grupo"}</button></div>`;
      h+=pieces.filter(x=>x.g===g).map(x=>pieceRow(x,counts?counts[x.id]:x.q,inK)).join(""); });
  }
  el.innerHTML=h;
  el.querySelectorAll("[data-ha]").forEach(b=>b.onclick=()=>{ const l=meshesOf(AREA_BY_KEY[b.dataset.ha].t); setHidden(l, visState(l)!=="off"); });
  el.querySelectorAll("[data-hd]").forEach(b=>b.onclick=()=>{ const l=meshesOf(s=>s.door===b.dataset.hd); setHidden(l, visState(l)!=="off"); });
  el.querySelectorAll("[data-hp]").forEach(b=>b.onclick=()=>{ const a=b.dataset.in?AREA_BY_KEY[b.dataset.in]:null, l=meshesOf(s=>s.id===b.dataset.hp&&(!a||a.t(s))); setHidden(l, visState(l)!=="off"); });
  el.querySelectorAll("[data-hg]").forEach(b=>b.onclick=()=>{ const ids=P.filter(x=>x.m===m&&x.g===b.dataset.hg).map(x=>x.id), a=V3.area&&!V3.allPieces&&tab==="pieces"?AREA_BY_KEY[V3.area]:null, l=meshesOf(s=>ids.includes(s.id)&&(!a||a.t(s))); setHidden(l, visState(l)!=="off"); });
  el.querySelectorAll("[data-a3]").forEach(b=>b.onclick=()=>{ selectArea3D(V3.area===b.dataset.a3?null:b.dataset.a3, true); canvasIntoView(); });
  el.querySelectorAll("[data-c3]").forEach(b=>b.onclick=()=>{ select3D(V3.sel===b.dataset.c3?null:b.dataset.c3, true); canvasIntoView(); });
  el.querySelectorAll("[data-sd]").forEach(b=>b.onclick=()=>{ const o=V3.meshes.find(o=>o.userData.spec?.door===b.dataset.sd); if(o){ select3D(o.userData.id, true, o.userData.spec); canvasIntoView(); } });
  el.querySelectorAll("[data-ex]").forEach(b=>b.onclick=()=>{ const k=b.dataset.ex; V3.lyrOpen.has(k)?V3.lyrOpen.delete(k):V3.lyrOpen.add(k); renderChips3D(); });
  el.querySelectorAll("[data-dr]").forEach(b=>b.onclick=()=>toggleDrawer(b.dataset.dr));
  el.querySelectorAll("[data-door]").forEach(b=>b.onclick=()=>toggleDoor(b.dataset.door));
  $("#v3allA")?.addEventListener("click",()=>{ V3.allAreas=true; renderChips3D(); });
  $("#v3allP")?.addEventListener("click",()=>{ V3.allPieces=true; renderChips3D(); });
}
function renderBar3D(){
  const bar=$("#v3bar"); if(!bar || !V3.meshes) return;
  const nh=V3.hidden?.size||0, a=V3.area?AREA_BY_KEY[V3.area]:null, x=V3.sel&&byId[V3.sel]?byId[V3.sel]:null;
  const B=(label,attrs,cls="")=>`<button class="btn sm ${cls}" type="button" ${attrs}>${label}</button>`;
  let h="";
  if(typeof MEAS!=="undefined" && MEAS.on){ bar.hidden=true; return; }
  if(a){
    h+=B(`${ico("i-eyeoff")} Ocultar`,'data-bh="area"')+B(V3.isolate?"Mostrar todo":"Ver solo esto",'data-bi');
    if(a.drawer) h+=B(isDrawerOpen(a.k)?"Cerrar cajón":"Abrir cajón",`data-dr="${a.k}"`);
  } else if(x){
    const inst=V3.inst, d=drawerOf(inst), zone=inst?AREAS[V3.m].find(z=>!z.drawer && z.k!==V3.m[0]+"-front" && !/front/.test(z.k) && z.t(inst)):null;
    h+=B(`${ico("i-eyeoff")} Ocultar${inst?"":" todas"}`,'data-bh="sel"')+B(V3.isolate?"Mostrar todo":"Ver sola",'data-bi');
    if(inst?.door) h+=B(inst.door==="cama"?(doorIsOpen("cama")?"Subir cama":"Bajar cama"):doorIsOpen(inst.door)?"Cerrar puerta":"Abrir puerta",`data-door="${inst.door}"`);
    if(d) h+=B(isDrawerOpen(d.k)?"Cerrar cajón":"Abrir cajón",`data-dr="${d.k}"`)+B("Todo el cajón",`data-a3="${d.k}"`,"info");
    else if(zone) h+=B("Toda la zona",`data-a3="${zone.k}"`,"info");
  }
  if(V3.sel||V3.area) h+=B("✕",'data-bx aria-label="Quitar selección"');
  if(nh) h+=B(`${ico("i-eye")} Mostrar ${nh} oculta${nh===1?"":"s"}`,'data-bshow');
  bar.innerHTML=h; bar.hidden=!h; document.querySelector(".v3hint").hidden=!!h;
  bar.querySelector('[data-bh="area"]')?.addEventListener("click",()=>setHidden(meshesOf(a.t),true));
  bar.querySelector('[data-bh="sel"]')?.addEventListener("click",()=>setHidden(V3.inst?V3.meshes.filter(o=>o.userData.spec===V3.inst):V3.meshes.filter(o=>o.userData.id===V3.sel),true));
  bar.querySelector("[data-bi]")?.addEventListener("click",()=>{ V3.isolate=!V3.isolate; look3D(); renderInfo3D(); });
  bar.querySelector("[data-door]")?.addEventListener("click",e=>toggleDoor(e.currentTarget.dataset.door));
  bar.querySelector("[data-dr]")?.addEventListener("click",e=>toggleDrawer(e.currentTarget.dataset.dr));
  bar.querySelector("[data-a3]")?.addEventListener("click",e=>selectArea3D(e.currentTarget.dataset.a3,true));
  bar.querySelector("[data-bx]")?.addEventListener("click",()=>{ V3.area?selectArea3D(null):select3D(null); });
  bar.querySelector("[data-bshow]")?.addEventListener("click",()=>setHidden(V3.meshes,false));
}
function showMec(){
  const K=MECS[V3.m]; if(!K) return;
  const lat=V3.meshes.filter(o=>o.userData.id===CAMA_CFG[V3.m].pre+"latizq"); setHidden(lat,true);
  const S=0.001, C=V3.C, tg=new THREE.Vector3((K.xc+8-C[0])*S, (K.A.y+300)/2*S, (180-C[2])*S);
  V3.controls.target.copy(tg); V3.camera.position.set(tg.x-1.05, 0.62, tg.z+0.55); V3.controls.update(); V3.touched=true;
  V3.showOven=true; $("#v3oven").setAttribute("aria-pressed",true);
  select3D("__mec"); look3D(); canvasIntoView();
}
$("#v3mec").onclick=showMec;
$("#v3showAll").onclick=()=>setHidden(V3.meshes,false);
segWire("v3lyrTab", v=>{ V3.lyrTab=v; renderChips3D(); });
function show3D(m, id){
  if(!init3D()) return;
  if(m && (m!==V3.m || !V3.group)) { load3D(m); document.querySelectorAll("#v3M button").forEach(b=>b.setAttribute("aria-pressed", b.dataset.v===m)); }
  else if(!V3.group) load3D(V3.m);
  if(id) select3D(id, true);
}
function go3D(id){ if($("#dlg").open) $("#dlg").close(); show("3d"); show3D(byId[id].m, id); }

segWire("v3M", v=>show3D(v));
function camOrbit(dx,dy){
  const c=V3.camera, tg=V3.controls.target, off=c.position.clone().sub(tg), s=new THREE.Spherical().setFromVector3(off);
  s.theta+=dx*0.12; s.phi=Math.min(Math.PI-0.02,Math.max(0.02,s.phi-dy*0.12));
  off.setFromSpherical(s); c.position.copy(tg).add(off); V3.controls.update(); V3.touched=true;
}
function camPan(dx,dy){
  const c=V3.camera, tg=V3.controls.target, dist=c.position.distanceTo(tg)*0.06;
  const right=new THREE.Vector3().setFromMatrixColumn(c.matrix,0), up=new THREE.Vector3().setFromMatrixColumn(c.matrix,1);
  const mv=right.multiplyScalar(dx*dist).add(up.multiplyScalar(dy*dist));
  c.position.add(mv); tg.add(mv); V3.controls.update(); V3.touched=true;
}
function camZoom(f){
  const c=V3.camera, tg=V3.controls.target, off=c.position.clone().sub(tg).multiplyScalar(f);
  const d=Math.min(V3.controls.maxDistance,Math.max(V3.controls.minDistance,off.length())); off.setLength(d);
  c.position.copy(tg).add(off); V3.controls.update(); V3.touched=true;
}
function camView(v){
  if(!V3.ready) return;
  const W=V3.W||2, H=V3.H||.85, tg=new THREE.Vector3(0,H*0.45,0), d=Math.max(W,H)*1.6;
  const dirs={front:[0,0.05,1], iso:[-0.45,0.42,0.9], top:[0,1,0.02], bottom:[0,-1,0.25], left:[-1,0.12,0.05], right:[1,0.12,0.05], back:[0,0.15,-1]};
  const dir=new THREE.Vector3(...dirs[v]).normalize();
  V3.controls.target.copy(tg); V3.camera.position.copy(tg).addScaledVector(dir,d); V3.controls.update(); V3.touched=true;
}
// mantener presionado = repetir
function holdRepeat(btn, fn){
  let timer=null, rep=null;
  const stop=()=>{ clearTimeout(timer); clearInterval(rep); timer=rep=null; };
  btn.addEventListener("pointerdown",e=>{ e.preventDefault(); fn(); timer=setTimeout(()=>{ rep=setInterval(fn,60); },300); });
  ["pointerup","pointerleave","pointercancel"].forEach(ev=>btn.addEventListener(ev,stop));
  btn.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); fn(); } });
}
document.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>camView(b.dataset.view));
$("#v3exp").oninput=e=>{ V3.explode=Number(e.target.value)/100; };
const tgl=(id,key,after)=>{ $(id).onclick=()=>{ V3[key]=!V3[key]; $(id).setAttribute("aria-pressed",V3[key]); look3D(); after&&after(); }; };
tgl("#v3open","open",()=>{ if(!V3.open) V3.openSet.clear(); AREAS[V3.m].filter(a=>a.drawer).forEach(a=>delete V3.pos[a.k]); renderDrawers3D(); }); tgl("#v3fronts","hideFronts"); tgl("#v3miss","missing",()=>{$("#v3missHint").hidden=!V3.missing;});
$("#v3reset").onclick=()=>V3.ready&&resetCam();
tgl("#v3oven","showOven",()=>{ if(!V3.showOven && /^__/.test(V3.sel||"")) select3D(null); });
