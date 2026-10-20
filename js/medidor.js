/* Medidor ortogonal en el visor 3D. */
/* ---------- medidor ortogonal ----------
   Toca dos cosas: esquinas o caras. Cerca de una esquina (≈18 px) se pega a la esquina; si no, toma la cara.
   · esquina–esquina: distancia en planta (ancho y fondo), sin contar la altura.
   · si hay una cara: distancia perpendicular a esa cara (ancho, alto o fondo según hacia dónde mire). */
const MEAS={on:false, picks:[], group:null, sized:[], labels:[]};
function measLabelsClear(){ MEAS.labels.forEach(L=>L.el.remove()); MEAS.labels=[]; }
const AXN={x:"ancho (izq–der)", y:"alto", z:"fondo (frente–atrás)"};
function boxCornersWorld(o){
  const g=o.geometry; if(!g.boundingBox) g.computeBoundingBox(); const bb=g.boundingBox, out=[];
  for(const x of [bb.min.x,bb.max.x]) for(const y of [bb.min.y,bb.max.y]) for(const z of [bb.min.z,bb.max.z]) out.push(new THREE.Vector3(x,y,z).applyMatrix4(o.matrixWorld));
  return out;
}
function toScreen(v){ const r=V3.renderer.domElement.getBoundingClientRect(), p=v.clone().project(V3.camera); return {x:(p.x+1)/2*r.width, y:(1-p.y)/2*r.height}; }
function faceQuad(o, nLocal){  // las 4 esquinas de la cara de la caja que mira hacia nLocal, en coordenadas del mundo
  if(!o.geometry.boundingBox) o.geometry.computeBoundingBox();
  const bb=o.geometry.boundingBox, ax=Math.abs(nLocal.x)>.5?"x":Math.abs(nLocal.y)>.5?"y":"z", s=nLocal[ax]>0?"max":"min";
  const others=["x","y","z"].filter(a=>a!==ax), pts=[];
  for(const [i,j] of [[0,0],[1,0],[1,1],[0,1]]){ const v=new THREE.Vector3(); v[ax]=bb[s][ax]; v[others[0]]=(i?bb.max:bb.min)[others[0]]; v[others[1]]=(j?bb.max:bb.min)[others[1]]; pts.push(v.applyMatrix4(o.matrixWorld)); }
  return pts;
}
function segDist2D(p,a,b){ const vx=b.x-a.x, vy=b.y-a.y, L=vx*vx+vy*vy; let u=L?((p.x-a.x)*vx+(p.y-a.y)*vy)/L:0; u=Math.max(0,Math.min(1,u)); return {d:Math.hypot(p.x-(a.x+u*vx), p.y-(a.y+u*vy)), u}; }
// Qué se toma al tocar. "auto": esquina o arista solo si tocas muy cerca de una de la cara tocada
// y esa cara se ve grande; si no, la cara. Los otros modos fuerzan el tipo.
function measPickFrom(hit, sx, sy){
  const o=hit.object; o.updateMatrixWorld();
  const nLocal=hit.face.normal.clone(), n=nLocal.clone().transformDirection(o.matrixWorld).normalize();
  const quad=faceQuad(o,nLocal), qs=quad.map(toScreen), mode=MEAS.mode||"auto";
  const face={type:"face", p:hit.point.clone(), n, quad};
  if(mode==="face") return face;
  let ci=0, cd=1e9; qs.forEach((s,i)=>{ const d=Math.hypot(s.x-sx,s.y-sy); if(d<cd){ cd=d; ci=i; } });
  let ei=0, ed=1e9; for(let i=0;i<4;i++){ const r=segDist2D({x:sx,y:sy}, qs[i], qs[(i+1)%4]); if(r.d<ed){ ed=r.d; ei=i; } }
  const edgeOf=i=>{ const a=quad[i], b=quad[(i+1)%4], dir=b.clone().sub(a).normalize(), tt=Math.max(0,Math.min(a.distanceTo(b), hit.point.clone().sub(a).dot(dir)));
    return {type:"edge", a, b, dir, p:a.clone().add(dir.clone().multiplyScalar(tt))}; };
  if(mode==="corner") return {type:"corner", p:quad[ci]};
  if(mode==="edge") return edgeOf(ei);
  const side=Math.min(...[0,1].map(i=>Math.hypot(qs[i].x-qs[i+1].x, qs[i].y-qs[i+1].y)), Math.hypot(qs[3].x-qs[0].x, qs[3].y-qs[0].y));
  if(side<40) return face;               // cara chica en pantalla (canto de un tablero): se toma la cara
  if(cd<=12) return {type:"corner", p:quad[ci]};
  if(ed<=9) return edgeOf(ei);
  return face;
}
function measClear(){
  if(MEAS.group){ V3.scene.remove(MEAS.group); MEAS.group.traverse(o=>{ o.geometry?.dispose(); if(o.material){ o.material.map?.dispose(); o.material.dispose(); } }); }
  MEAS.group=null; MEAS.dimGroup=null; MEAS.target=null; MEAS.res=null; MEAS.picks=[]; MEAS.sized=[]; measLabelsClear();
}
function measMat(color,op=1){ return new THREE.MeshBasicMaterial({color, transparent:true, opacity:op, depthTest:false, depthWrite:false}); }
function measAdd(obj,ord){ obj.renderOrder=ord; (MEAS.target||MEAS.group).add(obj); return obj; }
// segmento de grosor constante en pantalla (px), recalculado en cada cuadro
function measSeg(a,b,color,px,op,ord){
  const len=a.distanceTo(b); if(len<1e-5) return;
  const m=measAdd(new THREE.Mesh(new THREE.CylinderGeometry(1,1,len,8,1,true), measMat(color,op)), ord);
  m.position.copy(a).add(b).multiplyScalar(.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), b.clone().sub(a).normalize());
  MEAS.sized.push({o:m, px, kind:"seg"});
}
let _ringTex=null;
function ringTex(){
  if(_ringTex) return _ringTex;
  const c=document.createElement("canvas"); c.width=c.height=64; const x=c.getContext("2d");
  x.beginPath(); x.arc(32,32,22,0,Math.PI*2); x.fillStyle="#ffffff"; x.fill(); x.lineWidth=9; x.strokeStyle="#16181c"; x.stroke();
  x.beginPath(); x.arc(32,32,7,0,Math.PI*2); x.fillStyle="#ffb020"; x.fill();
  return _ringTex=new THREE.CanvasTexture(c);
}
function measDot(p){ const s=measAdd(new THREE.Sprite(new THREE.SpriteMaterial({map:ringTex(), depthTest:false, depthWrite:false, transparent:true})), 1010); s.position.copy(p); MEAS.sized.push({o:s, px:11, kind:"dot"}); }
function measFace(q){
  const g=new THREE.BufferGeometry().setFromPoints([q[0],q[1],q[2],q[0],q[2],q[3]]);
  measAdd(new THREE.Mesh(g, new THREE.MeshBasicMaterial({color:0xffb020, transparent:true, opacity:.16, side:THREE.DoubleSide, depthTest:false, depthWrite:false})), 1004);
  for(let i=0;i<4;i++){ measSeg(q[i],q[(i+1)%4],0xffb020,1.4,.9,1005); }
}
// línea de cota con remates perpendiculares
function measDim(a,b,up,text){
  const dir=b.clone().sub(a).normalize();
  let side=new THREE.Vector3().crossVectors(dir, up||new THREE.Vector3(0,1,0)); if(side.lengthSq()<1e-6) side=new THREE.Vector3().crossVectors(dir,new THREE.Vector3(1,0,0)); side.normalize();
  measSeg(a,b,0x0d0f12,4,.55,1006);          // halo oscuro fino
  measSeg(a,b,0xffb020,1.8,1,1007);          // línea ámbar
  for(const p of [a,b]){ const t=side.clone().multiplyScalar(0.018); measSeg(p.clone().sub(t),p.clone().add(t),0xffb020,1.8,1,1007); }
  if(text){ const el=document.createElement("div"); el.className="mlabel"; el.textContent=text; document.querySelector(".v3wrap").appendChild(el); MEAS.labels.push({el, mid:a.clone().add(b).multiplyScalar(.5)}); }
}
function measFrame(){
  if(!MEAS.group) return;
  const cam=V3.camera, H=V3.renderer.domElement.clientHeight||400, k=2*Math.tan(cam.fov*Math.PI/360)/H;
  for(const s of MEAS.sized){ const d=cam.position.distanceTo(s.o.position), w=d*k*s.px;
    if(s.kind==="seg"){ s.o.scale.x=w/2; s.o.scale.z=w/2; } else s.o.scale.set(w,w,1); }
  for(const L of MEAS.labels){ const p=toScreen(L.mid); L.el.style.left=p.x+"px"; L.el.style.top=p.y+"px"; }
}
const fmtCm = v => (Math.round(v*10)/10).toFixed(1).replace(".",",");
function axisOf(n){ const a={x:Math.abs(n.x),y:Math.abs(n.y),z:Math.abs(n.z)}; return a.x>=a.y&&a.x>=a.z?"x":a.y>=a.z?"y":"z"; }
function measPick(hit, sx, sy){
  if(!MEAS.group || MEAS.picks.length>=2){ measClear(); MEAS.group=new THREE.Group(); V3.scene.add(MEAS.group); }
  const pk=measPickFrom(hit, sx, sy); MEAS.picks.push(pk);
  if(pk.type==="face") measFace(pk.quad);
  if(pk.type==="edge"){ measSeg(pk.a,pk.b,0x0d0f12,4,.45,1005); measSeg(pk.a,pk.b,0xffb020,2.2,1,1006); }
  measDot(pk.p);
  if(MEAS.picks.length===2){ measCompute(); measDrawDim(); }
  measShow();
}
function perpToLine(P, E){ const w=P.clone().sub(E.p); return w.sub(E.dir.clone().multiplyScalar(w.dot(E.dir))); }  // vector de la línea E al punto P, perpendicular a E
const AXSHORT={x:"Ancho",y:"Alto",z:"Fondo"};
const MODES=[["auto","Auto"],["face","Caras"],["edge","Aristas"],["corner","Esquinas"]];
const MODE_HELP={auto:"Toca en medio de una cara para tomar la cara; justo sobre un borde o una esquina para pegarte a ellos.", face:"Cada toque toma la cara que tocas (también los cantos de los tableros). Mide la distancia perpendicular entre caras.", edge:"Cada toque se pega a la arista (borde) más cercana de la cara tocada.", corner:"Cada toque se pega a la esquina más cercana de la cara tocada."};
function modeSel(){ return `<span class="axsel" role="group" aria-label="Qué tomar al tocar"><span class="dims" style="align-self:center">Tomar:</span>${MODES.map(([k,n])=>`<button type="button" class="axb" data-mode="${k}" aria-pressed="${(MEAS.mode||"auto")===k}">${n}</button>`).join("")}</span>`; }
function wireMode(root){ root.querySelectorAll("[data-mode]").forEach(b=>b.onclick=e=>{ e.stopPropagation(); MEAS.mode=b.dataset.mode; try{ localStorage.setItem(LS+"-measmode",MEAS.mode); }catch{} measShow(); }); }
try{ MEAS.mode=localStorage.getItem(LS+"-measmode")||"auto"; }catch{}
// Siempre se mide en UN eje (ancho, alto o fondo): nunca en diagonal.
function measCompute(){
  const [A,B]=MEAS.picks; let from, v, kind, noY=false;
  const E = A.type==="edge"?A : B.type==="edge"?B : null, other = E===A?B:A;
  if(A.type==="face" || B.type==="face"){
    const F=A.type==="face"?A:B, O=F===A?B:A, n=F.n, d=O.p.clone().sub(F.p).dot(n);
    from=O.p.clone().sub(n.clone().multiplyScalar(d)); v=n.clone().multiplyScalar(d);
    kind = A.type==="face"&&B.type==="face" ? "Entre caras" : O.type==="edge" ? "De arista a cara" : "De esquina a cara";
    if(Math.abs(d)<0.0005){ MEAS.res={zero:true}; return; }
  } else if(E){
    v=perpToLine(other.p,E); from=other.p.clone().sub(v);
    kind = other.type==="edge" ? "Entre aristas" : "De arista a esquina";
  } else {
    from=A.p.clone(); v=B.p.clone().sub(A.p); kind="Entre esquinas";
  }
  const c={x:Math.abs(v.x)*100, y:Math.abs(v.y)*100, z:Math.abs(v.z)*100};
  MEAS.res={from, v, kind, c, show:{x:c.x>=0.05, y:c.y>=0.05, z:c.z>=0.05}};
}
function measDrawDim(){
  const R=MEAS.res; if(!R || R.zero) return;
  if(MEAS.dimGroup){ MEAS.group.remove(MEAS.dimGroup); MEAS.sized=MEAS.sized.filter(s=>s.o.parent!==MEAS.dimGroup); MEAS.dimGroup.traverse(o=>{ o.geometry?.dispose(); o.material?.dispose?.(); }); }
  measLabelsClear();
  MEAS.dimGroup=new THREE.Group(); MEAS.group.add(MEAS.dimGroup); MEAS.target=MEAS.dimGroup;
  // de un punto al otro por los tres ejes: ancho, luego fondo, luego alto (como una escuadra)
  let cur=R.from.clone();
  for(const ax of ["x","z","y"]){
    const step=new THREE.Vector3(); step[ax]=R.v[ax]; const nxt=cur.clone().add(step);
    if(R.c[ax]>=0.05){
      if(R.show[ax]) measDim(cur, nxt, ax==="y"?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0), `${AXSHORT[ax]} ${fmtCm(R.c[ax])} cm`);
      else { const n=Math.max(2,Math.round(cur.distanceTo(nxt)/0.02)); for(let i=0;i<n;i+=2) measSeg(cur.clone().lerp(nxt,i/n), cur.clone().lerp(nxt,Math.min(1,(i+1)/n)), 0x0d0f12, 1.1, .45, 1006); }
    }
    cur=nxt;
  }
  MEAS.target=null; measFrame();
}
function measShow(){
  const tag=$("#v3tag"); tag.hidden=false; tag.onclick=null;
  const moved = V3.explode>0 || V3.open || V3.openSet.size || V3.doorSet.size;
  if(MEAS.picks.length<2){
    tag.innerHTML=`<span class="measres" style="gap:6px"><b>${MEAS.picks.length? "Toca el segundo punto" : "Toca el primer punto"}</b>${modeSel()}<span class="dims mhelp">${MODE_HELP[MEAS.mode||"auto"]}</span></span>`;
    wireMode(tag);
    return;
  }
  const R=MEAS.res;
  if(R.zero){ tag.innerHTML=`<span class="measres"><b>Están en el mismo plano</b><span class="dims">Para medir el ancho o el alto de una cara, toca sus dos aristas (los bordes).</span></span>`; return; }
  tag.innerHTML=`<span class="measres" style="gap:6px">
    <span class="dims"><b style="font:700 .95rem var(--body)">${R.kind}</b><span class="mhelp"> · las tres distancias rectas; toca una para mostrarla u ocultarla</span></span>
    <span class="axsel">${["x","y","z"].map(a=>`<button type="button" class="axb" data-ax="${a}" aria-pressed="${R.c[a]>=0.05&&R.show[a]}" ${R.c[a]<0.05?"disabled":""}>${R.c[a]>=0.05&&R.show[a]?"✓ ":""}${AXSHORT[a]} <b>${fmtCm(R.c[a])}</b></button>`).join("")}</span>
    ${moved?`<span class="dims">⚠ Hay piezas separadas o cajones/puertas abiertos: mide cómo se ven ahora.</span>`:""}
    <span class="mhelp">${modeSel()}</span></span>`;
  wireMode(tag);
  tag.querySelectorAll("[data-ax]").forEach(b=>b.onclick=e=>{ e.stopPropagation(); const a=b.dataset.ax; R.show[a]=!R.show[a]; measDrawDim(); measShow(); });
}
function setMeasure(on){
  MEAS.on=on; ["#measBtn","#measBtn2"].forEach(s=>$(s).setAttribute("aria-pressed",on));
  if(on){ select3D(null); measShow(); } else { measClear(); renderInfo3D(); }
  renderBar3D();
}
$("#measBtn").onclick=()=>setMeasure(!MEAS.on);
$("#measBtn2").onclick=()=>setMeasure(!MEAS.on);
