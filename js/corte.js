/* Pestaña Corte: optimización en guillotina, revisión de holguras y costos. */
/* ---------- optimización de corte (guillotina) ---------- */
// pieces: [{id,L,W,key}] en mm (L va a lo largo de la veta). Devuelve {sheets:[{parts,free}], ...}
function packGuillotine(pieces, cfg, order, split, fit){
  const UW=cfg.BW-2*cfg.trim, UH=cfg.BH-2*cfg.trim, k=cfg.kerf;
  const sheets=[];
  const newSheet=()=>{ const s={parts:[], free:[{x:0,y:0,w:UW,h:UH}]}; sheets.push(s); return s; };
  const score=(f,w,h)=> fit==="bssf" ? Math.min(f.w-w,f.h-h)*1e6+Math.max(f.w-w,f.h-h)
                       : fit==="blsf" ? Math.max(f.w-w,f.h-h)*1e6+Math.min(f.w-w,f.h-h)
                       : (f.w*f.h-w*h)*1e3+Math.min(f.w-w,f.h-h);
  for(const p of order(pieces)){
    let best=null;
    const opts=[[p.L,p.W,false]]; if(cfg.rot && p.L!==p.W) opts.push([p.W,p.L,true]);
    for(let si=0; si<sheets.length; si++){
      const s=sheets[si];
      for(let fi=0; fi<s.free.length; fi++){ const f=s.free[fi];
        for(const [w,h,r] of opts){ if(w<=f.w+1e-6 && h<=f.h+1e-6){ const sc=score(f,w,h)+si*1e12; if(!best||sc<best.sc) best={sc,si,fi,w,h,r}; } }
      }
    }
    if(!best){ const s=newSheet(), f=s.free[0]; let ok=null;
      for(const [w,h,r] of opts) if(w<=f.w && h<=f.h){ ok={si:sheets.length-1,fi:0,w,h,r}; break; }
      if(!ok) return null;   // no cabe en un tablero
      best=ok; }
    const s=sheets[best.si], f=s.free.splice(best.fi,1)[0], {w,h}=best;
    s.parts.push({id:p.id, key:p.key, x:f.x, y:f.y, w, h, rot:best.r});
    const rw=f.w-w-k, rh=f.h-h-k;   // sobrantes a la derecha y arriba, después del disco
    let horiz;   // true: el corte largo va a lo ancho (franja de arriba ocupa todo el ancho)
    if(split==="sla") horiz = rw < rh;          // shorter leftover axis
    else if(split==="lla") horiz = rw >= rh;
    else if(split==="minas") horiz = (rw*h) < (w*rh) ? false : true;
    else if(split==="maxas") horiz = (rw*h) >= (w*rh) ? false : true;
    else horiz = split==="h";
    const A = horiz ? {x:f.x+w+k, y:f.y, w:rw, h:h} : {x:f.x+w+k, y:f.y, w:rw, h:f.h};
    const B = horiz ? {x:f.x, y:f.y+h+k, w:f.w, h:rh} : {x:f.x, y:f.y+h+k, w:w, h:rh};
    [A,B].forEach(r=>{ if(r.w>=cfg.minFree && r.h>=cfg.minFree) s.free.push(r); });
  }
  return sheets;
}
function optimizeCut(pieces, cfg){
  if(!pieces.length) return {sheets:[]};
  const by=f=>ps=>[...ps].sort((a,b)=>f(b)-f(a)||b.L-a.L||(a.id<b.id?-1:1));
  const orders=[by(p=>p.L*p.W), by(p=>Math.max(p.L,p.W)), by(p=>p.L), by(p=>p.W), by(p=>p.L+p.W), by(p=>Math.min(p.L,p.W))];
  let seed=12345; const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  for(let i=0;i<cfg.iters;i++){ const j=i%3; orders.push(ps=>{ const base=orders[j](ps); for(let a=0;a<base.length-1;a++) if(rnd()<.25){ const b=a+1+Math.floor(rnd()*Math.min(4,base.length-a-1)); [base[a],base[b]]=[base[b],base[a]]; } return base; }); }
  const splits=["sla","lla","minas","maxas","h","v"], fits=["baf","bssf","blsf"];
  let best=null, bestSc=Infinity;
  const UA=(cfg.BW-2*cfg.trim)*(cfg.BH-2*cfg.trim);
  for(const o of orders) for(const sp of splits) for(const ft of fits){
    const sh=packGuillotine(pieces,cfg,o,sp,ft); if(!sh) return {error:true};
    const used=sh.map(s=>s.parts.reduce((a,p)=>a+p.w*p.h,0));
    // menos tableros; luego, el último tablero lo más vacío posible (sobrante grande); luego sobrante más grande
    const big=Math.max(0,...sh[sh.length-1].free.map(f=>f.w*f.h));
    const sc=sh.length*1e3 + used[used.length-1]/UA*100 - big/UA;
    if(sc<bestSc){ bestSc=sc; best=sh; }
  }
  return {sheets:best};
}
const CUT = {m:"armario", BW:2440, BH:1830, kerf:4, trim:10, veta:true, sep:{}, fondos:false};
try{ Object.assign(CUT, JSON.parse(localStorage.getItem(LS+"-cut")||"{}")); }catch{}
const saveCut=()=>{ try{ localStorage.setItem(LS+"-cut", JSON.stringify(CUT)); }catch{} };
const MATN = {
  cama:{cuerpo:"MDP 15 mm", frente:"MDP 15 mm", fondo:"Trasera 3 mm", junto:"MDP 15 mm"},
  cama5:{cuerpo:"Tablero 15 mm (color del kit)", frente:"Tablero 15 mm", fondo:"Trasera 3 mm", junto:"Tablero 15 mm (color del kit)"},
  cama3:{cuerpo:"Tablero 15 mm (color del kit)", frente:"Tablero 15 mm", fondo:"Trasera 3 mm", junto:"Tablero 15 mm (color del kit)"},
  cama4:{cuerpo:"Tablero 15 mm (color del kit)", frente:"Tablero 15 mm", fondo:"Trasera 3 mm", junto:"Tablero 15 mm (color del kit)"},
  cama2:{cuerpo:"Tablero 15 mm (color del kit)", frente:"Tablero 15 mm", fondo:"Trasera 3 mm", junto:"Tablero 15 mm (color del kit)"},
  armario:{cuerpo:"Milán (oscuro)", frente:"Tivoli (claro)", fondo:"Fondos 6 mm", junto:"Tablero 15 mm"},
  cocina:{cuerpo:"Cuerpo", frente:"Frentes y puertas", fondo:"Fondos 6 mm", junto:"Tablero 15 mm (cuerpo y frentes)"},
  tv:{cuerpo:"Cuerpo (oscuro)", frente:"Frentes y puertas (claro)", fondo:"Fondos 6 mm", junto:"Tablero 15 mm (cuerpo y frentes)"} };
// Material por pieza (cocina, TV y armario). La elección vive en este navegador: MATSEL[id de pieza] = clave.
const MATERIALES = {
  milan:{n:"Milán (oscuro)", c:"#5a4030"},
  tivoli:{n:"Tivoli (claro)", c:"#ece2cf"},
  wengue:{n:"Wengue (muy oscuro, Homecenter)", c:"#33261d"},
  t6:{n:"Fondos 6 mm", c:"#c9bda6"}
};
const MAT_ELEGIBLES = ["milan","tivoli","wengue"];
let MATSEL = {};
try{ MATSEL = JSON.parse(localStorage.getItem(LS+"-mat")||"{}")||{}; }catch{}
const canPickMat = x => !!x && (["cocina","tv","armario"].includes(x.m) || !!ARM_V[x.m]) && !x.vidrio && (x.cut||x.d)[2]>6;
// material por defecto: el del diseño (frentes y cajas según el color de cada mueble), o todo el mismo si los frentes no van aparte
function defMat(x){
  if((x.cut||x.d)[2]<=6) return "t6";
  const body = x.m==="cocina" ? "tivoli" : "milan";
  if(x.m==="cocina" || !cutSep(x.m)) return body;
  if(isFrontPc(x)) return "tivoli";
  if(/caj/i.test(x.g) && x.id!=="a-supl"){ const w=WOOD[x.m]; return Math.abs(cutLum(w.box)-cutLum(w.front)) < Math.abs(cutLum(w.box)-cutLum(w.carc)) ? "tivoli" : "milan"; }
  return "milan";
}
const matOf = x => (canPickMat(x) && MATSEL[x.id]) || defMat(x);
function setMat(id, k){
  if(k) MATSEL[id]=k; else delete MATSEL[id];
  try{ localStorage.setItem(LS+"-mat", JSON.stringify(MATSEL)); }catch{}
  if(V3.ready && V3.group) look3D();
  if(!$("#v-cut").hidden) renderCut();
}
function matPickerHTML(x){
  if(!canPickMat(x)) return "";
  const cur=matOf(x), own=!!MATSEL[x.id];
  return `<div class="matpick"><div class="lbl">Material / color${x.q>1?` (las ${x.q})`:""}</div>
    <div class="seg" role="group" aria-label="Material de ${esc(x.n)}">${MAT_ELEGIBLES.map(k=>`<button type="button" data-mat="${k}" data-mat-id="${x.id}" aria-pressed="${cur===k}"><span class="sw" style="--f:${MATERIALES[k].c}"></span>${esc(MATERIALES[k].n.split(" (")[0])}</button>`).join("")}</div>
    <p class="hint">${own?`Cambiado por ti · <button class="linkbtn" type="button" data-mat="" data-mat-id="${x.id}">volver al del diseño (${esc(MATERIALES[defMat(x)].n.split(" (")[0])})</button>`:"Es el del diseño."} Cambia el color en el 3D, el tablero en Corte y el costo.</p></div>`;
}
function wireMat(root, after){ root.querySelectorAll("[data-mat-id]").forEach(b=>b.onclick=()=>{ setMat(b.dataset.matId, b.dataset.mat); after&&after(); }); }
const cutLum = hex => { const n=parseInt(hex.slice(1),16); return ((n>>16)*.3+((n>>8)&255)*.59+(n&255)*.11)/255; };
const cutSep = m => CUT.sep[m] ?? Math.abs(cutLum(WOOD[m].carc)-cutLum(WOOD[m].front))>.15;
const isFrontPc = x => /puerta|frente|panel|-cbf$|-ccf$|-cif$/.test(x.id);
function cutMat(x){
  if(canPickMat(x)) return matOf(x);   // cocina, TV y armario: se agrupa por material
  const d=x.cut||x.d; if(d[2]<=6) return "fondo";
  if(!cutSep(x.m)) return "cuerpo";
  if(isFrontPc(x)) return "frente";
  if(/caj/i.test(x.g) && x.id!=="a-supl"){ const w=WOOD[x.m]; return Math.abs(cutLum(w.box)-cutLum(w.front)) < Math.abs(cutLum(w.box)-cutLum(w.carc)) ? "frente" : "cuerpo"; }
  return "cuerpo";
}
const matName = (m,k) => MATERIALES[k] ? MATERIALES[k].n : k==="cuerpo" && !cutSep(m) ? MATN[m].junto : MATN[m][k];
const matFill = (m,k) => MATERIALES[k] ? MATERIALES[k].c : k==="fondo" ? WOOD[m].thin : k==="frente" ? WOOD[m].front : WOOD[m].carc;
const isThin = k => k==="fondo" || k==="t6";
const cm = mm => fmt(Math.round(mm)/10);
const LAST_CUT = {};

function boardSVG(sh, m, k, cfg){
  const {BW,BH,trim:t}=cfg, fill=matFill(m,k), ink=cutLum(fill)<.45?"#fff6ea":"#1b140e", edge=cutLum(fill)<.45?"#ece2cf":"#4a3426";
  const pid="h"+m+k;
  let s=`<svg class="board" viewBox="-12 -12 ${BW+24} ${BH+24}" role="img" aria-label="Tablero de ${cm(BW)} por ${cm(BH)} cm con ${sh.parts.length} piezas">
  <defs><pattern id="${pid}" width="44" height="44" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="44" height="44" fill="var(--bg2)"/><path d="M0 0v44" stroke="var(--line)" stroke-width="12"/></pattern></defs>
  <rect x="0" y="0" width="${BW}" height="${BH}" fill="url(#${pid})" stroke="var(--muted)" stroke-width="6"/>`;
  if(t>0) s+=`<rect x="${t}" y="${t}" width="${BW-2*t}" height="${BH-2*t}" fill="none" stroke="var(--muted)" stroke-width="3" stroke-dasharray="18 14"/>`;
  sh.free.filter(f=>f.w>=380&&f.h>=110).forEach(f=>{
    const fs=Math.min(64,f.h*.45,f.w/7.5);
    s+=`<text x="${t+f.x+f.w/2}" y="${t+f.y+f.h/2}" class="fr" font-size="${fs}">sobra ${cm(f.w)} × ${cm(f.h)}</text>`;
  });
  sh.parts.forEach((p,i)=>{
    const x=t+p.x, y=t+p.y, n=i+1, big=Math.min(120,p.h*.62,p.w*.42), x0=byId[p.id];
    const showDims = p.w>=430 && p.h>=170;
    s+=`<g class="pc" data-id="${p.id}" tabindex="0" role="button" aria-label="${n}: ${esc(x0.n)}, ${fmt(p.w)} por ${fmt(p.h)} mm${p.rot?", girada":""}">
      <rect x="${x}" y="${y}" width="${p.w}" height="${p.h}" fill="${fill}" stroke="${edge}" stroke-width="5"/>
      <text x="${x+p.w/2}" y="${y+p.h/2-(showDims?big*.32:0)}" fill="${ink}" font-size="${big}" class="pn">${n}${p.rot?"↻":""}</text>
      ${showDims?`<text x="${x+p.w/2}" y="${y+p.h/2+big*.55}" fill="${ink}" font-size="${Math.min(58,p.w/9)}" class="pd">${fmt(p.w)} × ${fmt(p.h)}</text>`:""}
    </g>`;
  });
  return s+`</svg>`;
}

/* ---------- revisión del diseño (holguras y reglas de corte) ---------- */
const HOLGURA={min:2, ok:3, riel:12.7, rielTol:1};
function reviewDesign(m){
  const L=buildModel(m).filter(s=>!s.sub), out=[]; L.forEach((s,i)=>s.uid=i);
  const ov=(a,b,i)=>Math.min(a[i+1],b[i+1])-Math.max(a[i],b[i]);
  const nm=s=>byId[s.id].n;
  // 1. luz entre frentes/puertas y lo que tienen al lado (en el mismo plano)
  const F=L.filter(s=>s.front), seen=new Set();
  F.filter(f=>!f.side).forEach(f=>L.forEach(q=>{   // la puerta lateral tapa los cantos del módulo: se revisa aparte
    if(q===f || q.side || (q.g && q.g===f.g) || ov(f.b,q.b,4)<=0.5) return;
    if(q.front && seen.has(q.uid+"|"+f.uid)) return;
    const k=f.uid+"|"+q.uid; seen.add(k);
    for(const [ax,o] of [[0,2],[2,0]]){
      if(ov(f.b,q.b,o)<=1) continue;
      const g=Math.max(q.b[ax]-f.b[ax+1], f.b[ax]-q.b[ax+1]);
      if(g>=10 || g<-30) continue;
      const lado=ax===0?"de lado":"arriba/abajo";
      if(g<HOLGURA.min) out.push({lv:g<=0.5?"err":"warn", t:"luz", a:f.id, b:q.id,
        msg:`${nm(f)} y ${nm(q)} (${lado}): ${g<=0?"se tocan":"luz de "+fmt(Math.round(g*10)/10)+" mm"}. Mínimo ${HOLGURA.min} mm, ideal ${HOLGURA.ok}.`});
    }
  }));
  // 2. cajones: espacio para el riel a cada lado de la caja
  const groups=[...new Set(L.filter(s=>s.g&&!s.front).map(s=>s.g))];
  groups.forEach(g=>{
    const box=L.filter(s=>s.g===g && !s.front && !/fondo|-cbo|-cio|-cco/.test(s.id)); if(!box.length) return;
    const b=[0,1,2,3,4,5].map(i=>i%2?Math.max(...box.map(s=>s.b[i])):Math.min(...box.map(s=>s.b[i])));
    const st=L.filter(s=>!s.g && !s.front && ov(s.b,b,2)>1 && ov(s.b,b,4)>1);
    const left=Math.max(...st.filter(s=>s.b[1]<=b[0]+.5).map(s=>s.b[1])), right=Math.min(...st.filter(s=>s.b[0]>=b[1]-.5).map(s=>s.b[0]));
    if(!isFinite(left)||!isFinite(right)) return;
    const gl=b[0]-left, gr=right-b[1], name=byId[box[0].id].g;
    if(Math.abs(gl-HOLGURA.riel)>HOLGURA.rielTol || Math.abs(gr-HOLGURA.riel)>HOLGURA.rielTol)
      out.push({lv:Math.min(gl,gr)<HOLGURA.riel-2?"err":"warn", t:"riel", a:box[0].id,
        msg:`${name} (${g}): queda ${fmt(Math.round(gl*10)/10)} mm a la izquierda y ${fmt(Math.round(gr*10)/10)} mm a la derecha para el riel. El riel telescópico pide ${fmt(HOLGURA.riel)} mm por lado (caja = hueco − ${fmt(HOLGURA.riel*2)}).`});
  });
  // 3. reglas de corte de Madecentro
  P.filter(x=>x.m===m).forEach(x=>{ const d=x.cut||x.d, a=Math.max(d[0],d[1]), b=Math.min(d[0],d[1]);
    if(a<200 && b<200) out.push({lv:"warn", t:"corte", a:x.id, msg:`${x.n} (${fmt(a)} × ${fmt(b)}): Madecentro no corta piezas menores de 20 × 20 cm.`});
    else if(b<=70 && a<500) out.push({lv:"warn", t:"corte", a:x.id, msg:`${x.n} (${fmt(a)} × ${fmt(b)}): Madecentro solo corta tiras de 7 cm si son largas (50 cm o más).`});
  });
  const agg=new Map(); out.forEach(o=>{ const k=o.msg; if(agg.has(k)) agg.get(k).n++; else agg.set(k,{...o,n:1}); });
  return [...agg.values()].map(o=>({...o, msg:o.n>1?`${o.msg} (pasa ${o.n} veces)`:o.msg}));
}
const CORTADO={cocina:"ya está cortado", tv:"ya está cortado", cama:"viene cortado de fábrica (kit Tecnomobili)"};
function reviewHTML(m){
  const r=reviewDesign(m), cut=CORTADO[m];
  const ic={err:"✕",warn:"!"}, word={err:"Error",warn:"Revisar"};
  return `<div class="card review">
    <h3 class="cuth">${r.length?"!":"✓"} Revisión antes de cortar</h3>
    <p class="hint">Reglas: ${HOLGURA.ok} mm de luz entre puertas y frentes (mínimo ${HOLGURA.min}); cajón = hueco − ${fmt(HOLGURA.riel*2)} mm por los rieles; disco de ${fmt(CUT.kerf)} mm entre cortes; Madecentro no corta piezas menores de 20 × 20 cm ni tiras de 7 cm de menos de 50 cm.</p>
    ${r.length?`<ul class="revlist">${r.map(o=>`<li class="${o.lv}"><span class="rv">${ic[o.lv]} ${word[o.lv]}</span><span>${esc(o.msg)}</span></li>`).join("")}</ul>`:`<p><b>✓ Todo bien:</b> las luces entre puertas y frentes, los rieles de los cajones y los tamaños de corte cumplen.</p>`}
    ${cut&&r.length?`<p class="hint"><b>Este mueble ${cut}:</b> no se corrige; queda como referencia para no repetirlo.</p>`:""}
  </div>`;
}
/* ---------- costo aproximado (cotización Madecentro del 29 sep 2026: cocina + TV) ---------- */
const COT = {
  fecha:"29 sep 2026", total:3015618, tablero:"2,15 × 2,44 m",
  // lo que se pagó por material: el tablero y, aparte, cantos + servicios (corte, enchape, ranuras, perforación, calado, cenefa)
  mat:{
    milan:{n:"Pelikano Milán 15 mm", s:"Milán", board:515749.77, q:1, extra:19640.72+5354.31+41030.31+2.34+12236.44+2998.80},
    tivoli:{n:"Pelikan RH Tivoli 2 caras 15 mm", s:"Tivoli 15 mm", board:1185665.28/2, q:2, extra:17214.06+42423.96+78941.24+5354.31+8149.80+87473.44+72950.06+2.34+68174.43+7456.16+27943.20},
    t6:{n:"Pelikan RH Tivoli 1 cara 6 mm", s:"Tivoli 6 mm", board:326975.31, q:1, extra:2.34+2.34},
    wengue:{n:"Vesto Wengue 15 mm (Homecenter)", s:"Wengue", board:215900, q:0, extra:0}   // precio de Homecenter; cantos con la tarifa del Milán
  },
  hw:{ r400:{n:"Riel push to open 45 × 400", q:4, v:113737.42, m:"tv"}, r550:{n:"Riel push to open 45 × 550", q:6, v:226967.15, m:"cocina"},
       push:{n:"Dispositivos push to open (160 y 237)", q:5, v:3631.59+12362.39, m:"mitad"}, bis:{n:"Bisagras 897 clip 35 mm", q:4, v:40579.57+21299.69+21299.69, m:"mitad"} },
  flete:50000
};
// material de cada pieza según el color: TV cuerpo = Milán; cocina toda en Tivoli; fondos 6 mm
function costMat(x){ if(x.vidrio) return null; if(x.d[2]===6) return "t6"; if(x.m==="cocina") return "tivoli"; return isFrontPc(x) || (/caj/i.test(x.g) && x.id!=="a-supl" && x.m==="tv") ? "tivoli" : "milan"; }
function costArea(m,k){ return P.filter(x=>x.m===m && costMat(x)===k).reduce((a,x)=>a+x.d[0]*x.d[1]*x.q,0)/1e6; }
const pesos = v => "$"+Math.round(v).toLocaleString("es-CO");
function costReal(m){
  const rows=[]; let mat=0;
  for(const [k,g] of Object.entries(COT.mat)){ const a=costArea(m,k), all=costArea("cocina",k)+costArea("tv",k); if(!a) continue;
    const sh=a/all, b=g.board*g.q*sh, e=g.extra*sh; mat+=b+e;
    rows.push([`${g.n}`, `${fmt((a).toFixed(2))} m² de piezas${sh<1?` · ${Math.round(sh*100)} % de lo comprado`:""}`, b], [`Cantos y servicios · ${g.s}`, "corte, enchape, ranuras…", e]); }
  const hw=[]; Object.values(COT.hw).forEach(h=>{ if(h.m===m) hw.push([h.n, `${h.q} u.`, h.v]); else if(h.m==="mitad") hw.push([h.n, "la mitad (no sé cuáles van en cada mueble)", h.v/2]); });
  const matAll=["cocina","tv"].reduce((a,mm)=>a+Object.entries(COT.mat).reduce((s,[k,g])=>{ const ar=costArea(mm,k), all=costArea("cocina",k)+costArea("tv",k); return s+(ar?(g.board*g.q+g.extra)*ar/all:0); },0),0);
  const fl=COT.flete*mat/matAll;
  return {rows, hw, flete:fl, sin:mat+fl, con:mat+fl+hw.reduce((a,r)=>a+r[2],0)};
}
// Usa los mismos tableros que muestra la pestaña (tamaño, veta, frentes aparte, fondos). El precio de la cotización es
// por tablero de 2,15 × 2,44: con otro tamaño se ajusta por área.
// bisagras por alto (5 si pasa de 1,9 m), un par de rieles por cajón, ganchos y tubos: del modelo actual
function armHwCount(m){
  const L=buildModel(m).filter(s=>!s.sub), isGlass=s=>!!byId[s.id]?.vidrio, hw=buildArmHw(m);
  const doors=[...new Set(L.filter(s=>s.door && !isGlass(s)).map(s=>s.door))].map(k=>L.find(s=>s.door===k && !isGlass(s)));
  return {puertas:doors.length, bis:doors.reduce((a,s)=>{ const h=s.b[3]-s.b[2]; return a+(h>=1900?5:h>=1500?4:h>=900?3:2); },0),
    rieles:AREAS[m].filter(a=>a.drawer).length, ganchos:hw.filter(p=>/gancho/.test(p.n)).length/3, tubos:hw.filter(p=>/tubo/.test(p.n)).length};
}
function costArmario(res, cfg, m="armario"){
  const ref=2440*2150, f=(cfg.BW*cfg.BH)/ref, rows=[]; let mat=0;
  const rateOf=k=>k==="wengue" ? rateOf("milan") : COT.mat[k].extra/(costArea("cocina",k)+costArea("tv",k));
  for(const x of res){
    const key = COT.mat[x.k] ? x.k : x.k==="fondo" ? "t6" : x.k==="frente" ? "tivoli" : "milan", c=COT.mat[key], price=c.board*f, a=x.area/1e6, rate=rateOf(key);
    const name = c.n;
    rows.push([name, `${x.n} tablero${x.n>1?"s":""} de ${cm(cfg.BW)} × ${cm(cfg.BH)} cm × ${pesos(price)}${f!==1?` (precio de 2,15 × 2,44 ajustado por área)`:""}`, x.n*price],
              [`Cantos y servicios · ${c.s}`, `${fmt(a.toFixed(2))} m² × ${pesos(rate)}/m², lo que costó por m² en la cocina y el TV`, a*rate]);
    mat+=x.n*price+a*rate;
  }
  const rU=(COT.hw.r400.v/4 + COT.hw.r550.v/6)/2, bU=COT.hw.bis.v/COT.hw.bis.q;
  // herrajes contados del diseño actual: puertas → bisagras (4 si mide más de 1,5 m), cajones → pares de rieles, ganchos y espejos
  const H=armHwCount(m), nBis=H.bis, nRiel=H.rieles, nHook=H.ganchos, doors={length:H.puertas};
  const hw=[["Rieles push to open de 45 cm", `${nRiel} pares, uno por cajón × ${pesos(rU)} (entre el de 40 y el de 55)`, nRiel*rU],
            ["Bisagras 897 clip 35 mm", `${nBis} para ${doors.length} puertas (5 en las de piso a techo, 4 en las de más de 1,5 m) × ${pesos(bU)}`, nBis*bU],
            ...(nHook?[["Ganchos", `${nHook} para sombreros y bolsos (no estaban en la cotización)`, null]]:[]),
            ...P.filter(x=>x.m===m&&x.vidrio).map(x=>[x.n, `${x.d[0]/10} × ${x.d[1]/10} cm en vidriería (no estaba en la cotización)`, null])];
  return {rows, hw, flete:COT.flete, sin:mat+COT.flete, con:mat+COT.flete+hw.reduce((a,r)=>a+(r[2]||0),0), est:1, falta:hw.filter(r=>r[2]==null).map(r=>r[0].toLowerCase())};
}
function costHTML(m, res, cfg){
  if(/^cama[2-5]$/.test(m)){
    const nu=P.filter(x=>x.m===m&&x.nueva), a=nu.filter(x=>x.d[2]===15).reduce((s,x)=>s+x.d[0]*x.d[1]*x.q,0)/1e6, rate=COT.mat.tivoli.extra/(costArea("cocina","tivoli")+costArea("tv","tivoli"));
    const rec=P.filter(x=>x.m===m&&x.recorte);
    const tr=r=>`<div class="srow"><span class="k">${esc(r[0])}</span><span class="v"><b>${r[2]}</b> <span class="hint">${esc(r[1])}</span></span></div>`;
    const mech = m==="cama5" ? [["2 actuadores lineales","12 V, 1500 N, carrera 300 mm, 405–705 mm (con el escritorio harían falta ~860 N: el de 900 N queda sin margen)","cotizar"],["Fuente 12 V 10 A + fusible + interruptor","igual que la cama eléctrica","cotizar"],["Marco y paralelogramo","marco de tubo negro 40 × 20, 2 postes, 2 barras de acero 40 × 6 de 592 mm entre centros, 2 bisagras con pasador Ø12, 2 soportes al piso con chazo, bujes de nylon","cotizar"]] : m==="cama2" ? [["2 pistones a gas","800 N, 560 mm ojo a ojo, carrera 200, con rótulas M8 (AUTOHAUX 22\")","cotizar"]]
      : m==="cama3" ? [["2 actuadores lineales","12 V, 900 N, carrera 300 mm (el de Temu: ~$200.282–$230.357 c/u)", pesos(2*200282)+" – "+pesos(2*230357)],["Fuente 12 V 10 A + fusible","fuente conmutada para tira LED / CCTV","cotizar"],["Interruptor","balancín DPDT (ON)-OFF-(ON) de mantener, cable 1,5 mm²","cotizar"]]
      : [["2 pistones a gas","~1400–1500 N, ~750 mm ojo a ojo, carrera ≥ 150, con rótulas M8","cotizar"]];
    return `<div class="card cost"><h3 class="cuth">$ Costo aprox. de la modificación</h3><div class="spec">
      ${tr(["Tablero 15 mm","1 tablero de 2,15 × 2,44 para: "+nu.filter(x=>x.d[2]===15).map(x=>x.n.split(" (")[0].replace(/ NUEV[OA]/,"")).join(", ")+" (precio de la cotización: Milán–Tivoli)", pesos(COT.mat.milan.board)+" – "+pesos(COT.mat.tivoli.board)])}
      ${tr(["Cantos y servicios", fmt(a.toFixed(2))+" m² × "+pesos(rate)+"/m²", pesos(a*rate)])}
      ${nu.some(x=>x.d[2]===3)?tr(["Trasera de 3 mm",nu.find(x=>x.d[2]===3).d.slice(0,2).join(" × ")+": retazo de fondo, pídelo aparte","cotizar"]):""}
      ${rec.length?tr(["Recortes de piezas que ya tienes",rec.map(x=>x.n.split(" (")[0]+" → "+x.d[0]).join(" · ")+". Corte recto con sierra y guía, o en un taller.","—"]):""}
      ${mech.map(tr).join("")}
      ${tr(["Herrajes del mecanismo","2 placas de acero de 4 mm por dentro + 2 contraplacas por fuera, 2 brazos, 2 escuadras bajo la cama, 2 ejes Ø20 con buje, 4 rótulas o pasadores, pernos M8 pasantes con arandela (taller de metalmecánica)","cotizar"])}
    </div><p class="hint">El kit original ya lo tienes: esto es solo lo que se agrega o cambia.${m==="cama4"?" Los 2 laterales del kit (1690) sobran: sirven para repisas u otro mueble.":""}</p></div>`; }
  if(m==="cama") return `<div class="card cost"><h3 class="cuth">$ Costo</h3><p class="hint">La cama es un kit de fábrica (Tecnomobili IBIZA): su costo es el precio de la caja, no se calcula por tableros. Esto de abajo sirve como referencia si algún día la quisieras mandar a hacer en melamina.</p></div>`;
  const c = (m==="armario"||ARM_V[m]) ? costArmario(res, cfg, m) : costReal(m);
  const tr=r=>`<div class="srow"><span class="k">${esc(r[0])}</span><span class="v"><b class="mono">${r[2]==null?"cotizar":pesos(r[2])}</b> <span class="hint">${esc(r[1])}</span></span></div>`;
  return `<div class="card cost">
    <h3 class="cuth">$ Costo aprox. ${c.est?"estimado":""}</h3>
    <div class="cutstats">
      <div><span class="k">Sin herrajes</span><span class="v">${pesos(c.sin)}</span></div>
      <div><span class="k">Con herrajes</span><span class="v">${pesos(c.con)}</span></div>
    </div>
    <div class="spec">${c.rows.filter(r=>r[2]>=100).map(tr).join("")}
      ${tr(["Acarreo", c.est?"un viaje, como en la cotización":"repartido según lo que pesa cada mueble en la cotización", c.flete])}
      <div class="srow"><span class="k" style="font-weight:800">Herrajes</span><span class="v hint">solo cuentan en "con herrajes"</span></div>
      ${c.hw.map(tr).join("")}</div>
    <p class="hint">${c.est
      ? `Estimado con los precios de la cotización de Madecentro del ${COT.fecha}, con IVA y descuentos, sobre los mismos tableros de abajo: cambia con el tamaño de tablero, la veta, los frentes aparte y los fondos. ${CUT.fondos?"Incluye":"Sin"} los fondos de 6 mm.${c.falta?.length?` El total no incluye ${c.falta.join(" ni ")} (dicen "cotizar").`:""} No incluye tubos de colgar, soportes ni patas (no estaban en la cotización).`
      : `Sale de la cotización de Madecentro del ${COT.fecha} (${pesos(COT.total)} por cocina + TV, con IVA y descuentos). Cada tablero se reparte según el área de piezas de cada mueble; bisagras y push to open, a partes iguales.`}</p>
  </div>`;
}
function renderCut(){
  const m=CUT.m;
  document.querySelectorAll("#cM button").forEach(b=>b.setAttribute("aria-pressed", b.dataset.v===m));
  [["cBW",CUT.BW/10],["cBH",CUT.BH/10],["cK",CUT.kerf],["cT",CUT.trim]].forEach(([id,v])=>{ if(document.activeElement!==$("#"+id)) $("#"+id).value=fmt(v); });
  $("#cVeta").setAttribute("aria-pressed", CUT.veta);
  $("#cSep").setAttribute("aria-pressed", cutSep(m));
  $("#cFondos").setAttribute("aria-pressed", CUT.fondos);
  $("#cFondos").hidden = !P.some(x=>x.m===m&&!x.vidrio&&(x.cut||x.d)[2]<=6);   // el armario ya no tiene piezas delgadas
  document.querySelectorAll("[data-bsz]").forEach(b=>b.setAttribute("aria-pressed", b.dataset.bsz===`${Math.max(CUT.BW,CUT.BH)}x${Math.min(CUT.BW,CUT.BH)}`));
  const cfg={BW:Math.max(CUT.BW,CUT.BH), BH:Math.min(CUT.BW,CUT.BH), kerf:CUT.kerf, trim:CUT.trim, rot:!CUT.veta, minFree:30, iters:60};
  const groups={};
  P.filter(x=>x.m===m && !x.same && !x.recorte && !x.vidrio).forEach(x=>{ const d=x.cut||x.d, k=cutMat(x);
    for(let i=0;i<x.q;i++) (groups[k]=groups[k]||[]).push({id:x.id, L:d[0], W:d[1]}); });
  const order=["milan","wengue","tivoli","cuerpo","frente","t6","fondo"].filter(k=>groups[k] && (!isThin(k)||CUT.fondos));
  const UA=cfg.BW*cfg.BH;
  const res=order.map(k=>{ const ps=groups[k], r=optimizeCut(ps,cfg), area=ps.reduce((a,p)=>a+p.L*p.W,0);
    return {k, ps, r, area, n:r.sheets?.length||0, thick:isThin(k)?(/^cama/.test(m)?3:6):15}; });
  LAST_CUT.m=m; LAST_CUT.res=res; LAST_CUT.cfg=cfg;
  const bad=res.find(x=>x.r.error);
  if(bad){ $("#cutBody").innerHTML=`<div class="card"><p><b>! Hay piezas que no caben en un tablero de ${cm(cfg.BW)} × ${cm(cfg.BH)} cm</b> con ese refilado${CUT.veta?" y respetando la veta":""}. Revisa las medidas del tablero.</p></div>`; return; }
  const tot=res.reduce((a,x)=>a+x.n,0), aP=res.reduce((a,x)=>a+x.area,0), aB=tot*UA;
  const m2=v=>fmt((v/1e6).toFixed(2));
  let h=reviewHTML(m)+`<div class="card cutsum">
    <div class="cutbig"><span class="num">${tot}</span><span>${tot===1?"tablero":"tableros"} de ${cm(cfg.BW)} × ${cm(cfg.BH)} cm<small>${mtag(m)} · ${res.reduce((a,x)=>a+x.ps.length,0)} piezas${CUT.fondos||!P.some(x=>x.m===m&&!x.vidrio&&(x.cut||x.d)[2]<=6)?"":" · sin fondos de 6 mm"}</small></span></div>
    <div class="cutmats">${res.map(x=>`<div class="cutmat"><span class="sw ${x.k}" style="--f:${matFill(m,x.k)}"></span><b>${x.n} ×</b> ${esc(matName(m,x.k))} <span class="hint">${x.thick} mm</span></div>`).join("")}</div>
    <div class="cutstats">
      <div><span class="k">Área de piezas</span><span class="v">${m2(aP)} m²</span></div>
      <div><span class="k">Área comprada</span><span class="v">${m2(aB)} m²</span></div>
      <div><span class="k">Aprovechamiento</span><span class="v">${Math.round(aP/aB*100)} %</span></div>
      <div><span class="k">Sobrante + aserrín</span><span class="v">${m2(aB-aP)} m²</span></div>
    </div>
    <p class="hint">Medidas reales de cada pieza (las recortadas, con su medida final). Disco de ${fmt(CUT.kerf)} mm, refilado de ${fmt(CUT.trim)} mm por lado${CUT.veta?", y el largo de cada pieza va a lo largo del tablero (veta)":", piezas giradas cuando conviene (↻)"}. Toca una pieza para ver qué es.</p>
  </div>`;
  res.forEach(x=>{
    const cnt=x.ps.length, min=x.area/UA;
    h+=`<div class="card cutgrp">
      <div class="row" style="justify-content:space-between">
        <h3 class="cuth"><span class="sw ${x.k}" style="--f:${matFill(m,x.k)}"></span>${esc(matName(m,x.k))} · ${x.thick} mm</h3>
        <button class="btn sm" type="button" data-copy="${x.k}">Lista para pedir</button>
      </div>
      <p class="hint">${cnt} piezas · ${m2(x.area)} m² · ${x.n} tablero${x.n>1?"s":""} (el mínimo posible sería ${fmt(min.toFixed(2))}) · aprovechamiento ${Math.round(x.area/(x.n*UA)*100)} %</p>`;
    x.r.sheets.forEach((sh,i)=>{
      const used=sh.parts.reduce((a,p)=>a+p.w*p.h,0);
      h+=`<div class="sheet"><div class="row sheeth"><b>Tablero ${i+1} de ${x.n}</b><span class="hint">${sh.parts.length} piezas · ${Math.round(used/UA*100)} % usado</span>${CUT.veta?`<span class="hint veta">veta ⟷</span>`:""}</div>
        <div class="boardwrap">${boardSVG(sh,m,x.k,cfg)}</div>
        <ol class="cutlist">${sh.parts.map((p,j)=>`<li><button type="button" data-id="${p.id}"><span class="cn">${j+1}${p.rot?"↻":""}</span><span class="cname">${esc(byId[p.id].n)}</span><span class="cdim">${fmt(p.rot?p.h:p.w)} × ${fmt(p.rot?p.w:p.h)}</span></button></li>`).join("")}</ol>
      </div>`;
    });
    h+=`</div>`;
  });
  h=h.replace('<div class="card cutgrp">', costHTML(m, res, cfg)+'<div class="card cutgrp">');
  const pick=P.filter(x=>x.m===m && canPickMat(x));
  if(pick.length){ const own=pick.filter(x=>MATSEL[x.id]).length;
    h=h.replace('<div class="card cutgrp">', `<details class="card matlist" ${CUT.matOpen?"open":""}><summary>Material por pieza ${own?`· ${own} cambiada${own>1?"s":""} por ti`:""}</summary>
      <p class="hint">Escoge el material de cada pieza: el corte, los tableros y el costo se recalculan. Se guarda en este navegador.</p>
      ${[...new Set(pick.map(x=>x.g))].map(g=>`<div class="grp-title">${esc(g)}</div>`+pick.filter(x=>x.g===g).map(x=>`<label class="matrow"><span class="sw" style="--f:${MATERIALES[matOf(x)].c}"></span><span class="mn">${esc(x.n)} ×${x.q}${MATSEL[x.id]?" <b>· tuyo</b>":""}</span>
        <select data-msel="${x.id}" aria-label="Material de ${esc(x.n)}">${MAT_ELEGIBLES.map(k=>`<option value="${k}" ${matOf(x)===k?"selected":""}>${esc(MATERIALES[k].n)}</option>`).join("")}</select></label>`).join("")).join("")}
      ${own?`<button class="btn sm" type="button" id="matReset">Volver todo al diseño</button>`:""}
    </details><div class="card cutgrp">`);
  }
  $("#cutBody").innerHTML=h;
  $("#cutBody").querySelectorAll("[data-id]").forEach(el=>{ el.onclick=()=>openPiece(el.dataset.id); if(el.tagName==="g") el.onkeydown=e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); openPiece(el.dataset.id); } }; });
  $("#cutBody").querySelectorAll("[data-copy]").forEach(b=>b.onclick=()=>cutCopy(b.dataset.copy));
  const ml=$("#cutBody .matlist"); if(ml){ ml.ontoggle=()=>{ CUT.matOpen=ml.open; };
    ml.querySelectorAll("[data-msel]").forEach(s=>s.onchange=()=>{ const x=byId[s.dataset.msel]; setMat(x.id, s.value===defMat(x)?"":s.value); });
    $("#matReset")?.addEventListener("click",()=>{ P.filter(x=>x.m===m).forEach(x=>delete MATSEL[x.id]); setMat("__", ""); }); }
}
function cutCopy(k){
  const {m,res,cfg}=LAST_CUT, x=res.find(r=>r.k===k); if(!x) return;
  const rows={}; x.ps.forEach(p=>{ const key=p.id; rows[key]=rows[key]||{p,q:0}; rows[key].q++; });
  const txt=`${SHORT[m]} — ${matName(m,k)} ${x.thick} mm — tablero ${cfg.BW} × ${cfg.BH} mm — ${x.n} tablero${x.n>1?"s":""}\n`+
    `Cant  Largo × Ancho (mm)  Pieza\n`+
    Object.values(rows).sort((a,b)=>b.p.L*b.p.W-a.p.L*a.p.W).map(r=>`${String(r.q).padEnd(5)} ${(fmt(r.p.L)+" × "+fmt(r.p.W)).padEnd(19)} ${byId[r.p.id].n}`).join("\n")+
    (CUT.veta?"\n(El largo va en el sentido de la veta)":"");
  $("#dlgBody").innerHTML=`<h3 style="margin:0">Lista para pedir · ${esc(matName(m,k))}</h3><pre class="cutpre">${esc(txt)}</pre><div class="row"><button class="btn info" type="button" id="cutCp">Copiar</button><span class="hint" id="cutCpMsg"></span></div>`;
  $("#cutCp").onclick=async()=>{ try{ await navigator.clipboard.writeText(txt); $("#cutCpMsg").textContent="✓ Copiada"; }catch{ const r=document.createRange(); r.selectNodeContents($("#dlgBody .cutpre")); const s=getSelection(); s.removeAllRanges(); s.addRange(r); $("#cutCpMsg").textContent="Seleccionada: usa Copiar del celular"; } };
  if(!$("#dlg").open) $("#dlg").showModal();
}
segWire("cM", v=>{ CUT.m=v; saveCut(); renderCut(); });
let cutT=null;
[["cBW","BW",10],["cBH","BH",10],["cK","kerf",1],["cT","trim",1]].forEach(([id,key,mul])=>{
  $("#"+id).oninput=e=>{ const v=parseFloat(String(e.target.value).replace(",", ".")); if(!(v>=0)) return;
    CUT[key]=v*mul; if((key==="BW"||key==="BH") && CUT[key]<500) return; saveCut(); clearTimeout(cutT); cutT=setTimeout(renderCut,350); };
});
document.querySelectorAll("[data-bsz]").forEach(b=>b.onclick=()=>{ const [w,hh]=b.dataset.bsz.split("x").map(Number); CUT.BW=w; CUT.BH=hh; saveCut(); renderCut(); });
$("#cVeta").onclick=()=>{ CUT.veta=!CUT.veta; saveCut(); renderCut(); };
$("#cFondos").onclick=()=>{ CUT.fondos=!CUT.fondos; saveCut(); renderCut(); };
$("#cSep").onclick=()=>{ CUT.sep[CUT.m]=!cutSep(CUT.m); saveCut(); renderCut(); };
