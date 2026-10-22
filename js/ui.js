/* Interfaz: checklist, ficha de pieza, pestañas, búsqueda por medidas, escaneo con Claude, despiece, planos. */
/* ---------- estado del checklist (db compartida, con respaldo local) ---------- */
let STATE = {};   // id -> {n, codes:[]}
let db = null;
const LS = "armado-cocina-tv-v1";
try{ STATE = JSON.parse(localStorage.getItem(LS)||"{}")||{}; }catch{}
const saveLocal = () => { try{ localStorage.setItem(LS, JSON.stringify(STATE)); }catch{} };
const cnt = id => Math.min(STATE[id]?.n||0, byId[id].q);
async function setCount(id, n, code){
  const x=byId[id]; n=Math.max(0,Math.min(x.q,n));
  const codes = [...(STATE[id]?.codes||[])];
  if(code && !codes.includes(code)) codes.push(code);
  STATE[id] = {n, codes}; saveLocal(); renderCounts();
  if(db){ try{ await db.collection("checklist").doc(id).set({n, codes}); }catch(e){ $("#syncNote").textContent="No se pudo guardar en línea; quedó guardado en este celular."; } }
}
function renderCounts(){
  const done=Object.fromEntries(MUEBLES.map(m=>[m,0])); P.forEach(x=>done[x.m]+=cnt(x.id));
  $("#counters").innerHTML = CHECK_M.map(m=>`<span class="ctr" title="${MUEBLE[m]}"><span class="mtag ${m}" style="padding:2px 6px">${ico(ICON[m])}</span>${done[m]}/${TOTAL[m]}</span>`).join("");
  const all=CHECK_M.reduce((s,m)=>s+done[m],0), tot=CHECK_M.reduce((s,m)=>s+TOTAL[m],0);
  $("#dockSum").textContent = `${all} de ${tot} piezas listas`;
  if(!$("#v-check").hidden) renderCheck();
  if(!$("#v-list").hidden) renderList();
  if(V3.ready && !$("#v-3d").hidden){ look3D(); renderInfo3D(); }
  return done;
}

/* ---------- tarjeta de pieza ---------- */
function bubblesFor(x){
  const its=items(x), all=(BUBBLES[x.p]||[]).filter(b=>its.includes(b[0]));
  const inR = b => b[1]>45 && b[2]>57;
  const front = /Puertas|Frentes/.test(x.g) || x.id==="c-cj-frente";
  let sel = front ? all.filter(inR) : all.filter(b=>!inR(b));
  if(!sel.length) sel = all;
  return sel;
}
function planHTML(x){
  return `<div class="plan"><img src="${PAGES[x.p]}" alt="Plano página ${x.p}">${bubblesFor(x).map(b=>`<span class="hl" style="left:${b[1]}%;top:${b[2]}%"></span>`).join("")}</div>`;
}
const CONF = {alta:["✓","Segura"],media:["!","Revisa"],baja:["?","Dudosa"]};
function pieceHTML(x, o={}){
  const c = cnt(x.id);
  return `<article class="piece">
    <div class="banner mbg ${x.m}">
      <div class="bico">${ico(ICON[x.m])}</div>
      <div><div class="lbl">Mueble</div><div class="mueble">${SHORT[x.m]}</div><div class="grp">${esc(x.g)}</div></div>
    </div>
    <div class="pbody">
      <div class="pname"><div class="lbl">Pieza</div><p class="n">${esc(x.n)}</p></div>
      ${o.conf?`<div class="conf ${o.conf}"><span class="sym">${CONF[o.conf][0]}</span><span>${CONF[o.conf][1]}${o.confText?`: ${esc(o.confText)}`:""}</span></div>`:""}
      <p class="what">${esc(x.w)}</p>
      <div class="facts">
        <div class="fact"><div class="k">Ítem plano</div><div class="v">${esc(x.it)}</div></div>
        <div class="fact"><div class="k">Cantidad</div><div class="v">×${x.q}</div></div>
        <div class="fact"><div class="k">${/^A/.test(x.p)?"Lámina":"Página"}</div><div class="v">${/^A/.test(x.p)?x.p.slice(1):x.p}</div></div>
        <div class="fact"><div class="k">Grosor</div><div class="v">${x.d[2]} mm</div></div>
      </div>
      ${specHTML(x)}
      <div class="mark" data-id="${x.id}">
        <span>Encontradas: <b>${c} de ${x.q}</b> ${c>=x.q?"· ✓ completas":""}</span>
        <span class="stepper"><button type="button" data-d="-1" aria-label="Quitar una">−</button><button type="button" data-d="1" aria-label="Sumar una">+</button></span>
      </div>
      ${o.fixable?`<button class="btn fixbtn" type="button" data-fix="1">✎ No es esta pieza · Corregir</button>`:""}
      ${o.alts?.length?`<div><div class="hint" style="margin-bottom:6px;font-weight:700">${o.fixable?"¿Es una de estas? Tócala para corregir":"También podría ser"}</div><div class="alts">${o.alts.map(a=>`<button class="altb" type="button" data-alt="${a.id}"><span>${mtag(a.m)} ${esc(a.n)}</span><span class="dims">${dimStr(a)}</span></button>`).join("")}</div></div>`:""}
      <div>
        <div class="plancap"><span>Dónde va: página ${x.p} · ítem ${esc(x.it)} (marcado en azul)</span><span class="row" style="gap:6px"><button class="btn sm info" type="button" data-go3d="${x.id}">${ico("i-cube")} Ver en 3D</button><button class="btn sm" type="button" data-zoom="${x.id}">${ico("i-zoom")} Ampliar</button></span></div>
        <div style="margin-top:6px">${planHTML(x)}</div>
      </div>
      ${o.extra?`<details><summary>Lo que leí en la etiqueta</summary><p class="hint" style="margin-top:8px">${esc(o.extra)}</p></details>`:""}
    </div>
  </article>`;
}
function wirePiece(root, rerender){
  root.querySelectorAll(".mark .stepper button").forEach(b=>b.onclick=async()=>{
    const id=b.closest(".mark").dataset.id; await setCount(id, cnt(id)+Number(b.dataset.d)); rerender();
  });
  root.querySelectorAll("[data-alt]").forEach(b=>b.onclick=()=>rerender(b.dataset.alt));
  root.querySelectorAll("[data-zoom]").forEach(b=>b.onclick=()=>openZoom(byId[b.dataset.zoom]));
  root.querySelectorAll("[data-fix]").forEach(b=>b.onclick=()=>openFixPicker());
  root.querySelectorAll("[data-go3d]").forEach(b=>b.onclick=()=>go3D(b.dataset.go3d));
  root.querySelectorAll("[data-area]").forEach(b=>b.onclick=()=>go3DArea(b.dataset.area));
}
function openPiece(id){
  const draw=(nid)=>{ if(nid) id=nid; $("#dlgBody").innerHTML=pieceHTML(byId[id]); wirePiece($("#dlgBody"), draw); };
  draw(); $("#dlg").showModal(); $("#dlgBody").parentElement.scrollTop=0;
}
function openZoom(x){
  $("#dlgBody").innerHTML=`<p class="hint">Desliza para moverte por el plano. Ítem ${esc(x.it)} marcado en azul.</p><div class="zoomwrap">${planHTML(x)}</div>`;
  if(!$("#dlg").open) $("#dlg").showModal();
  requestAnimationFrame(()=>{ const z=$("#dlgBody .zoomwrap"), b=bubblesFor(x)[0]; if(z&&b){ z.scrollLeft=z.scrollWidth*b[1]/100-z.clientWidth/2; z.scrollTop=z.scrollHeight*b[2]/100-z.clientHeight/2; }});
}
$("#dlgClose").onclick=()=>$("#dlg").close();
$("#dlg").addEventListener("click",e=>{ if(e.target===$("#dlg")) $("#dlg").close(); });

/* ---------- pestañas ---------- */
function show(v){
  document.querySelectorAll(".tab").forEach(t=>t.setAttribute("aria-selected", t.dataset.v===v));
  ["scan","3d","list","cut","plans","check"].forEach(k=>$("#v-"+k).hidden = k!==v);
  if(v==="cut") renderCut();
  if(v==="3d") show3D();
  if(v==="list") renderList(); if(v==="plans") renderPlans(); if(v==="check") renderCheck();
  try{ localStorage.setItem(LS+"-tab", v); }catch{}
  window.scrollTo({top:0});
}
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>show(t.dataset.v));

/* ---------- coincidencia por medidas ---------- */
function matchDims(m){
  const big=Math.max(m.a,m.b??0), small=m.b?Math.min(m.a,m.b):null;
  // las piezas cortadas se reconocen por la medida del plano (etiqueta) o por la medida real
  const score=(x,d)=>{ const L=Math.max(d[0],d[1]), W=Math.min(d[0],d[1]);
    let s = small==null ? Math.min(Math.abs(L-m.a),Math.abs(W-m.a)) : Math.abs(L-big)+Math.abs(W-small);
    if(m.t && d[2]!==m.t) s+=200; return s; };
  return P.filter(x=>!x.same).map(x=>({x, s: x.cut ? Math.min(score(x,x.d),score(x,x.cut)) : score(x,x.d)})).sort((p,q)=>p.s-q.s);
}
const NAME_HINTS=[["fondo","fondo"],["lat","lateral"],["test","testero"],["falso","frente falso"],["fr","frente"],["panel","frente visible"],["frente","frente"],["puerta","puerta"],["zoc","zócalo"],["divis","divis"],["base","base"],["respaldo","respaldo"],["entrep","entrepaño"],["prat","entrepaño"],["ref","refuerzo"],["soporte","soporte"]];
let FIXES={};  // firma de etiqueta -> id de pieza corregida a mano
try{ FIXES=JSON.parse(localStorage.getItem(LS+"-fixes")||"{}")||{}; }catch{}
function sigOf(et){
  const a=(Array.isArray(et?.medidas)?et.medidas:[]).map(v=>Math.round(Number(String(v).replace(",","."))));
  if(a.length<2||a.some(n=>!(n>0))) return null;
  a.sort((x,y)=>y-x);
  return `${a[0]}x${a[1]}-${String(et.item??"").replace(/\D/g,"")||"0"}`;
}
async function saveFix(sig, id){
  if(!sig) return; FIXES[sig]=id;
  try{ localStorage.setItem(LS+"-fixes", JSON.stringify(FIXES)); }catch{}
  if(db){ try{ await db.collection("fixes").doc(sig).set({id}); }catch{} }
}
function classifyLabel(et){
  const sig=sigOf(et);
  if(sig && byId[FIXES[sig]]){
    const piece=byId[FIXES[sig]];
    return {piece, conf:"alta", confText:"ya habías corregido esta etiqueta a mano", alts:[], extra:`Firma ${sig}`, exact:true, sig};
  }
  const r0=classifyLabel0(et); if(r0) r0.sig=sig; return r0;
}
function classifyLabel0(et){
  const sets=[];
  const toNums=a=>Array.isArray(a)?a.map(v=>Number(String(v).replace(",","."))).filter(n=>n>0):[];
  const m1=toNums(et?.medidas), m2=toNums(et?.medidas_dibujo);
  if(m1.length) sets.push(m1); if(m2.length && m2.join()!==m1.join()) sets.push(m2);
  if(!sets.length) return null;
  const tg = Number(et.grosor_mm)>0 ? Number(et.grosor_mm) : null;
  const item = et.item!=null ? String(et.item).replace(/\D/g,"") : "";
  const nm = String(et.nombre||"").toLowerCase();
  const itemOk = x => item && items(x).includes(item);
  const nameOk = x => NAME_HINTS.some(([k,v])=>nm.includes(k) && x.n.toLowerCase().includes(v));
  let best=null;
  for(const md of sets){
    const ranked=matchDims({a:md[0], b:md[1]??null, t:tg});
    const exact=ranked.filter(r=>r.s<=4).map(r=>r.x);
    if(exact.length){ best={md, exact, ranked}; break; }
    if(!best) best={md, exact, ranked};
  }
  const lbl = `Medidas ${best.md.join(" × ")}${tg?` × ${tg}`:""} mm${item?` · ítem (${item})`:""}${et.nombre?` · ${et.nombre}`:""}${et.codigo?` · código ${et.codigo}`:""}`;
  if(best.exact.length){
    const ex=best.exact;
    const piece = ex.find(x=>itemOk(x)&&nameOk(x)) || ex.find(itemOk) || ex.find(nameOk) || ex[0];
    const sure = ex.length===1 || itemOk(piece);
    return {piece, conf: sure?"alta":"media", confText: sure?"las medidas de la etiqueta coinciden con el plano":"otra pieza tiene las mismas medidas; mira el ítem del plano", alts: ex.filter(x=>x!==piece), extra: lbl, exact:true};
  }
  return {piece: best.ranked[0].x, conf:"baja", confText:"las medidas leídas no coinciden exacto con ninguna pieza", alts: best.ranked.slice(1,4).map(r=>r.x), extra: lbl, exact:false};
}

/* ---------- escaneo con Claude ---------- */
let sample=null, lastFile=null, diagTxt="";
const LABEL_PROMPT = `Foto de la etiqueta blanca de una pieza de mueble (puede estar rotada 90° o 180°). Formato de la etiqueta:
- Línea con el material, ej. "PELIKAN RH TIVOLI 1C CU 2.15X2.44X0.006": el último número es el grosor en metros (0.006 = 6 mm, 0.015 = 15 mm).
- Línea "1 / 1 de A x B": A y B son las medidas de la pieza en mm. ("1 / 1" NO es medida.)
- Un dibujo rectangular con un número en el borde de arriba y otro en el borde lateral (también son las medidas).
- Un número entre paréntesis, ej. "(5)": es el ítem del plano.
- Un código como "13222-FondoD1-13241": la palabra del medio es el nombre de la pieza.
- Código de barras y fecha: ignóralos.
Responde SOLO este JSON: {"medidas":[A,B],"medidas_dibujo":[arriba,lado],"grosor_mm":6,"item":"5","nombre":"FondoD1","codigo":"13222-FondoD1-13241"}
Usa null en lo que no se pueda leer. Si no hay etiqueta en la foto: {"medidas":null}`;
const CATALOG_TXT = P.filter(x=>!x.same).map(x=>`${x.id} | ${MUEBLE[x.m]} | ${x.g} | ${x.n} | ${x.d[0]}x${x.d[1]}x${x.d[2]} mm`).join("\n");
const DEEP_PROMPT = `Foto de UNA pieza de melamina de un mueble para armar. Dime cuál pieza del catálogo es.
Pistas: Cama abatible = kit de fábrica Tecnomobili IBIZA; sus piezas traen un código de 6 dígitos (ej. 208043) y el nombre en portugués (Lastro, Barra, Cabeceira, Costa, Tampo, Prateleira Nicho…). Armario = cuerpo Milán (madera oscura) con cantos claros; puertas y frentes de cajón Tivoli (claros) con cantos oscuros. Mueble Cocina = casi todo melamina clara tipo travertino (beige veteado). Mueble TV = estructura (base, laterales, divisiones, entrepaño, zócalo) en madera oscura café; frentes, puertas y cajones claros. Piezas de 6 mm = fondos/respaldos delgados. Si ves una etiqueta, sus medidas mandan. Si ves una cinta métrica, úsala.
Catálogo (id | mueble | grupo | pieza | medidas):
${CATALOG_TXT}
Responde SOLO JSON: {"id":"<id o null>","confianza":"alta|media|baja","por_que":"<1 frase>","alternativas":["<id>"]}`;

async function toJpeg(file, max=1500){
  try{
    const url=URL.createObjectURL(file);
    const img=await new Promise((ok,ko)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=ko;i.src=url;});
    const k=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
    const c=document.createElement("canvas"); c.width=Math.round(img.naturalWidth*k); c.height=Math.round(img.naturalHeight*k);
    c.getContext("2d").drawImage(img,0,0,c.width,c.height); URL.revokeObjectURL(url);
    return await new Promise(ok=>c.toBlob(b=>ok(b||file),"image/jpeg",0.9));
  }catch{ return file; }
}
function setSteps(list){
  $("#steps").innerHTML = list.map(([t,s])=>`<div class="step ${s}"><span class="b">${s==="done"?"✓":s==="on"?'<span class="spin">◌</span>':"·"}</span>${esc(t)}</div>`).join("");
}
const ERR = {not_granted:"No diste permiso para que la página use Claude. Puedes buscar por medidas.",rate_limited:"Muchas fotos seguidas. Espera un momento y vuelve a intentar.",image_rejected:"La foto no se pudo leer. Toma otra.",images_unavailable:"Esta vista no puede enviar fotos a Claude. Ábrela en el navegador del celular.",session_expired:"Tu sesión de Claude expiró. Vuelve a iniciar sesión."};

async function scan(file, mode="label"){
  show("scan"); $("#result").innerHTML=""; $("#progress").hidden=false; $("#afterBtns").hidden=true;
  $("#thumb").src=URL.createObjectURL(file);
  const t0=Date.now(); const secs=()=>Math.round((Date.now()-t0)/1000);
  setSteps([["Conectando con Claude","on"],["Leyendo la etiqueta",""],["Buscando en el plano",""]]);
  sample = sample || await samplePromise;
  if(!sample){ setSteps([["Claude no está disponible en esta vista","done"]]); $("#diag").textContent=diagTxt; renderNoMatch("No pude usar Claude aquí. Usa “Buscar por medidas” o abre la página en el navegador del celular."); return; }
  const img = await toJpeg(file, 1200);
  let tick;
  try{
    if(mode==="deep"){
      tick=setInterval(()=>setSteps([["Conectado","done"],[`Mirando la pieza completa… ${secs()} s`,"on"]]),1000);
      const out = await sample.json(DEEP_PROMPT, {images:[img], modelTier:"default"});
      const piece=byId[out?.id];
      if(!piece) return renderNoMatch(out?.por_que || "No la reconocí.");
      return renderScan({piece, conf:["alta","media","baja"].includes(out.confianza)?out.confianza:"baja", confText: out.por_que, alts:(out.alternativas||[]).map(i=>byId[i]).filter(a=>a&&a!==piece)}, null, secs());
    }
    tick=setInterval(()=>setSteps([["Conectado","done"],[`Leyendo la etiqueta… ${secs()} s`,"on"],["Buscando en el plano",""]]),1000);
    const careful = mode==="careful";
    if(careful){ clearInterval(tick); tick=setInterval(()=>setSteps([["Conectado","done"],[`Leyendo con más cuidado… ${secs()} s`,"on"],["Buscando en el plano",""]]),1000); }
    const et = await sample.json(LABEL_PROMPT, {images:[careful? await toJpeg(file,2000) : img], modelTier: careful?"default":"quick"});
    const r = classifyLabel(et);
    $("#careful").hidden = careful || (r && r.exact);
    if(!r){ $("#afterBtns").hidden=false; return renderNoMatch("No pude leer la etiqueta. Mejor escribe las medidas con “Ingresar medidas”, o toca “Leer con más cuidado”."); }
    if(!r.exact) $("#afterBtns").hidden=false;
    renderScan(r, et?.codigo||null, secs());
  }catch(e){
    $("#diag").textContent=`${diagTxt} · error: ${e?.code||"?"}`;
    $("#afterBtns").hidden=false;
    renderNoMatch((ERR[e?.code]||"No se pudo leer la foto. Toca “Volver a leer la foto”.")+(e?.code?` (${e.code})`:""));
  }finally{ clearInterval(tick); }
}
function renderNoMatch(msg){
  $("#progress").hidden=true;
  $("#result").innerHTML=`<div class="card"><div class="conf baja"><span class="sym">?</span><span>${esc(msg)}</span></div></div>`;
}
let lastScan=null;
async function renderScan(r, code, s){
  $("#progress").hidden=true;
  let counted="", countedId=null;
  if(r.conf!=="baja" && !r.example){
    const codes=STATE[r.piece.id]?.codes||[];
    if(code && codes.includes(code)) counted="Esta etiqueta ya estaba escaneada; no la conté otra vez.";
    else if(cnt(r.piece.id) < r.piece.q){ await setCount(r.piece.id, cnt(r.piece.id)+1, code); countedId=r.piece.id; counted=`Sumada al checklist (${cnt(r.piece.id)} de ${r.piece.q}).`; toast(`${SHORT[r.piece.m]} · ${r.piece.n} — sumada`, ()=>setCount(r.piece.id, cnt(r.piece.id)-1)); }
    else counted=`Ya tenías las ${r.piece.q} de esta pieza marcadas.`;
  }
  if(r.conf==="baja" && !r.example) counted="No la sumé al checklist porque no estoy seguro. Si es esta, toca +; si no, corrígela.";
  lastScan={...r, code, s, counted, countedId, fixable:true};
  addRecent(r.piece, r.example);
  drawScan();
}
function drawScan(nid){
  if(nid) return applyFix(nid);
  const r=lastScan;
  $("#result").innerHTML = pieceHTML(r.piece, r) + (r.counted||r.s!=null||r.example?`<p class="hint" style="margin-top:8px">${r.example&&!r.manual?"Ejemplo: no se cuenta en el checklist. ":""}${esc(r.counted||"")} ${r.s!=null?`Listo en ${r.s} s.`:""}</p>`:"");
  wirePiece($("#result"), (id)=>{ if(id) drawScan(id); else drawScan(); });
  window.scrollTo({top:0,behavior:"smooth"});
}
async function applyFix(id){
  const r=lastScan, x=byId[id]; if(!r||!x) return;
  if(!r.example){
    if(r.countedId && r.countedId!==id){
      const prev=STATE[r.countedId]||{n:0,codes:[]};
      STATE[r.countedId]={n:Math.max(0,(prev.n||0)-1), codes:(prev.codes||[]).filter(c=>c!==r.code)};
      await setCount(r.countedId, STATE[r.countedId].n);
    }
    let counted;
    if(r.countedId===id) counted="Ya estaba sumada.";
    else if(cnt(id)<x.q){ await setCount(id, cnt(id)+1, r.code); counted=`Corregida y sumada al checklist (${cnt(id)} de ${x.q}).`; }
    else counted=`Corregida. Ya tenías las ${x.q} de esta pieza marcadas.`;
    await saveFix(r.sig, id);
    lastScan={...r, piece:x, conf:"alta", confText:"corregida a mano"+(r.sig?"; la próxima vez esta etiqueta saldrá así":""), alts:[], countedId: cnt(id)>0?id:null, counted};
    toast(`Corregida: ${SHORT[x.m]} · ${x.n}`);
  } else lastScan={...r, piece:x, conf:null, alts:[], counted:""};
  RECENT[0]&&(RECENT[0].id=id); addRecent(x, r.example, true);
  if($("#dlg").open) $("#dlg").close();
  drawScan();
}
function openFixPicker(){
  const r=lastScan;
  const md=(r?.extra||"").match(/(\d+(?:[.,]\d+)?) × (\d+(?:[.,]\d+)?)/);
  const ref = md ? {a:Number(md[1].replace(",",".")), b:Number(md[2].replace(",","."))} : {a:r.piece.d[0], b:r.piece.d[1]};
  const order = matchDims(ref).map(o=>o.x).filter(x=>x!==r.piece);
  $("#dlgBody").innerHTML=`<div class="card"><h2>¿Qué pieza es en realidad?</h2>
    <p class="hint">Primero salen las de medidas más parecidas. Toca la correcta.</p>
    <div class="seg" role="group" aria-label="Mueble" id="fixM"><button type="button" data-v="all" aria-pressed="true">Todos</button><button type="button" data-v="cocina" aria-pressed="false">${ico("i-pot")}Cocina</button><button type="button" data-v="tv" aria-pressed="false">${ico("i-tv")}TV</button><button type="button" data-v="armario" aria-pressed="false">${ico("i-ward")}Armario</button><button type="button" data-v="cama" aria-pressed="false">${ico("i-bed")}Cama</button><button type="button" data-v="cama2" aria-pressed="false">${ico("i-bed")}Cama + pistones</button><button type="button" data-v="cama3" aria-pressed="false">${ico("i-bed")}Cama eléctrica</button><button type="button" data-v="cama4" aria-pressed="false">${ico("i-bed")}Cama vertical</button><button type="button" data-v="cama5" aria-pressed="false">${ico("i-bed")}Cama + escritorio</button></div>
    <input class="search" id="fixQ" type="search" placeholder="Buscar: lateral, 550, ítem 3…" aria-label="Buscar pieza correcta">
    <div class="plist" id="fixList"></div></div>`;
  let fm="all";
  const draw=()=>{
    const q=$("#fixQ").value.trim().toLowerCase();
    const rows=order.filter(x=>(fm==="all"||x.m===fm)&&(!q||`${x.n} ${x.g} ${x.d.join(" ")} ítem ${x.it} item ${x.it} ${MUEBLE[x.m]}`.toLowerCase().includes(q)));
    $("#fixList").innerHTML=rows.map(x=>`<button class="prow" type="button" data-pick="${x.id}"><span class="itm">${esc(x.it.replace(/ /g,""))}</span><span style="min-width:0"><span class="t">${esc(x.n)}</span><span class="s">${mtag(x.m)}<span>${esc(x.g)}</span><span class="dims">${dimStr(x)}</span></span></span><span class="r">Pág. ${x.p}</span></button>`).join("");
    $("#fixList").querySelectorAll("[data-pick]").forEach(b=>b.onclick=()=>applyFix(b.dataset.pick));
  };
  segWire("fixM", v=>{fm=v;draw();});
  $("#fixQ").oninput=draw; draw();
  if(!$("#dlg").open) $("#dlg").showModal();
}
const RECENT=[];
function addRecent(x, ex, replace){
  if(!replace){ RECENT.unshift({id:x.id, ex}); RECENT.splice(6); }
  $("#recentCard").hidden=false;
  $("#recent").innerHTML=RECENT.map(r=>{const p=byId[r.id];return `<button class="altb" type="button" data-open="${p.id}"><span>${mtag(p.m)} ${esc(p.n)}${r.ex?' <span class="hint">(ejemplo)</span>':""}</span><span class="dims">${dimStr(p)}</span></button>`}).join("");
  $("#recent").querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>openPiece(b.dataset.open));
}
let toastT;
function toast(msg, undo){
  const t=$("#toast"); t.hidden=false; t.innerHTML=`<span>${esc(msg)}</span>${undo?'<button type="button">Deshacer</button>':""}`;
  if(undo) t.querySelector("button").onclick=async()=>{ await undo(); t.hidden=true; if(lastScan){ lastScan.counted="Deshecho: no quedó sumada."; drawScan(); } };
  clearTimeout(toastT); toastT=setTimeout(()=>t.hidden=true, 5000);
}
function onPick(e){ const f=e.target.files?.[0]; if(!f) return; lastFile=f; e.target.value=""; scan(f); }
$("#cam1").onchange=onPick; $("#cam2").onchange=onPick;
$("#retry").onclick=()=>lastFile&&scan(lastFile);
$("#careful").onclick=()=>lastFile&&scan(lastFile,"careful");
$("#deep").onclick=()=>lastFile&&scan(lastFile,"deep");

/* ejemplos */
const EXAMPLES=[
  {t:"Tu etiqueta", et:{medidas:[532,370],grosor_mm:6,item:"5",nombre:"FondoD1",codigo:"13222-FondoD1-13241"}},
  {t:"Zócalo largo", et:{medidas:[2080,100],grosor_mm:15,item:"1",nombre:"Zocalo"}},
  {t:"Lateral grande", et:{medidas:[835,580],grosor_mm:15,item:"3",nombre:"LatIzq"}},
  {t:"Tira de 9 cm", et:{medidas:[578,90],grosor_mm:15,item:"1",nombre:"Testero"}},
];
$("#examples").innerHTML=EXAMPLES.map((e,i)=>`<button class="exb" type="button" data-ex="${i}"><b>${esc(e.t)}</b><span class="dims">${e.et.medidas.join(" × ")} · (${e.et.item}) · ${esc(e.et.nombre)}</span></button>`).join("");
$("#examples").querySelectorAll("[data-ex]").forEach(b=>b.onclick=()=>{ const r=classifyLabel(EXAMPLES[b.dataset.ex].et); r.example=true; renderScan(r,null,null); });

/* medidas manuales: el flujo principal */
let unit="mm";
try{ unit=localStorage.getItem(LS+"-unit")||"mm"; }catch{}
function openDims(){
  $("#dlgBody").innerHTML=`<div class="card">
    <h2>Medidas de la etiqueta</h2>
    <p class="hint">Copia los dos números de la línea “1 / 1 de <b>532</b> x <b>370</b>”. El ítem es el número entre paréntesis; es opcional pero ayuda cuando hay piezas iguales.</p>
    <form id="dimForm" class="row" style="align-items:end" autocomplete="off">
      <div class="field"><label for="m1">Medida 1</label><input id="m1" type="number" inputmode="decimal" step="any" placeholder="${unit==="mm"?"532":"53.2"}" enterkeyhint="next"></div>
      <div class="field"><label for="m2">Medida 2</label><input id="m2" type="number" inputmode="decimal" step="any" placeholder="${unit==="mm"?"370":"37"}" enterkeyhint="next"></div>
      <div class="field" style="flex:0 1 80px"><label for="m4">Ítem</label><input id="m4" type="number" inputmode="numeric" placeholder="5" enterkeyhint="search"></div>
      <div class="seg" role="group" aria-label="Unidad"><button type="button" id="uMm" aria-pressed="${unit==="mm"}">mm</button><button type="button" id="uCm" aria-pressed="${unit==="cm"}">cm</button></div>
      <button class="bigbtn" type="submit" style="width:100%">Buscar pieza</button>
    </form>
    <div id="dimLive" class="alts"></div>
  </div>`;
  if(!$("#dlg").open) $("#dlg").showModal();
  const read=()=>{ const k=unit==="cm"?10:1; return {a:parseFloat($("#m1").value)*k, b:parseFloat($("#m2").value)*k, item:$("#m4").value.trim()}; };
  const live=()=>{
    const v=read();
    if(!(v.a>0)){ $("#dimLive").innerHTML=""; return; }
    const r=classifyLabel({medidas:[v.a, v.b>0?v.b:null].filter(Boolean), item:v.item||null});
    const list=r?[r.piece,...r.alts].slice(0,4):[];
    $("#dimLive").innerHTML=`<div class="hint" style="font-weight:700">${r?.exact?"Coincide con:":"Lo más parecido:"}</div>`+list.map(x=>`<button class="altb" type="button" data-pickdim="${x.id}"><span>${mtag(x.m)} ${esc(x.n)}</span><span class="dims">${dimStr(x)}</span></button>`).join("");
    $("#dimLive").querySelectorAll("[data-pickdim]").forEach(b=>b.onclick=()=>finishDims(b.dataset.pickdim));
  };
  const setU=u=>{ unit=u; try{ localStorage.setItem(LS+"-unit",u); }catch{} $("#uMm").setAttribute("aria-pressed",u==="mm"); $("#uCm").setAttribute("aria-pressed",u==="cm"); $("#m1").placeholder=u==="mm"?"532":"53.2"; $("#m2").placeholder=u==="mm"?"370":"37"; live(); };
  $("#uMm").onclick=()=>setU("mm"); $("#uCm").onclick=()=>setU("cm");
  ["m1","m2","m4"].forEach(id=>$("#"+id).oninput=live);
  $("#m1").onkeydown=e=>{ if(e.key==="Enter"){ e.preventDefault(); $("#m2").focus(); } };
  $("#dimForm").onsubmit=e=>{ e.preventDefault(); finishDims(); };
  setTimeout(()=>$("#m1").focus(),50);
}
async function finishDims(pickId){
  const k=unit==="cm"?10:1, a=parseFloat($("#m1").value)*k, b=parseFloat($("#m2").value)*k, item=$("#m4").value.trim();
  if(!(a>0)){ $("#m1").focus(); return; }
  const et={medidas:[a, b>0?b:null].filter(Boolean), item:item||null};
  let r=classifyLabel(et);
  if(pickId && pickId!==r.piece.id){ const x=byId[pickId]; r={piece:x, conf:"alta", confText:"elegida de la lista", alts:[r.piece,...r.alts].filter(p=>p!==x).slice(0,3), extra:r.extra, exact:true, sig:r.sig}; }
  r.extra=`Medidas ${Math.round(a)}${b>0?` × ${Math.round(b)}`:""} mm${item?` · ítem (${item})`:""}`;
  $("#dlg").close(); show("scan");
  await renderScan(r, null, null);
}
document.querySelectorAll("[data-dims]").forEach(b=>b.onclick=openDims);

/* ---------- despiece ---------- */
let fM="all", fT="all";
function segWire(id, cb){ document.querySelectorAll(`#${id} button`).forEach(b=>b.onclick=()=>{ document.querySelectorAll(`#${id} button`).forEach(x=>x.setAttribute("aria-pressed",x===b)); cb(b.dataset.v); }); }
segWire("fM", v=>{fM=v;renderList();}); segWire("fT", v=>{fT=v;renderList();});
$("#q").oninput=()=>renderList();
$("#fA").onchange=e=>{ fA=e.target.value; renderList(); };
function stHTML(x){ const c=cnt(x.id); const g=c===0?"○":c<x.q?"◐":"●"; return `<span class="st ${c>=x.q?"done":""}"><span class="g">${g}</span>${c}/${x.q}</span>`; }
let fA="all";
function fillAreaSelect(){
  const ms=fM==="all"?CHECK_M:[fM];
  $("#fA").innerHTML=`<option value="all">Todos los conjuntos</option>`+ms.map(m=>`<optgroup label="${MUEBLE[m]}">${AREAS[m].map(a=>`<option value="${a.k}">${esc(a.n)}</option>`).join("")}</optgroup>`).join("");
  if(fA!=="all" && !ms.includes(AREA_BY_KEY[fA]?.m)) fA="all";
  $("#fA").value=fA;
}
function renderList(){
  fillAreaSelect();
  const q=$("#q").value.trim().toLowerCase();
  const inArea=fA==="all"?null:Object.fromEntries(piecesOfArea(fA).map(r=>[r.x.id,r.n]));
  const rows=P.filter(x=>(!inArea||inArea[x.id])&&(fM==="all"||x.m===fM)&&(fT==="all"||String(x.d[2])===fT)&&(!q||`${MUEBLE[x.m]} ${x.g} ${x.n} ${x.d.join(" ")} ${x.d.join("x")} ${x.ids||""} ${x.pl} ${x.stk} item ${x.it} ítem ${x.it} ${x.w}`.toLowerCase().includes(q)));
  $("#listCount").textContent=`${inArea?AREA_BY_KEY[fA].n+": ":""}${rows.length} tipos de pieza · ${rows.reduce((s,x)=>s+(inArea?inArea[x.id]:x.q),0)} piezas en total. Toca una para ver dónde va.`;
  $("#plist").innerHTML=rows.map(x=>`<button class="prow" type="button" data-id="${x.id}"><span class="itm">${esc(x.it.replace(/ /g,""))}</span><span style="min-width:0"><span class="t">${esc(x.n)}</span><span class="s">${mtag(x.m)}<span>Plano: ${esc(x.pl)}</span><span class="dims">${dimStr(x)}</span></span></span><span class="r">${stHTML(x)}<span>Pág. ${x.p}</span></span></button>`).join("") || `<p class="hint">Nada coincide con “${esc(q)}”.</p>`;
  $("#plist").querySelectorAll(".prow").forEach(b=>b.onclick=()=>openPiece(b.dataset.id));
}

/* ---------- planos ---------- */
let pM="cocina";
segWire("pM", v=>{pM=v;renderPlans();});
function renderPlans(){
  const pages=/^cama/.test(pM)?["B1","B2","B3","B4","B5","B6"]:[...new Set(P.filter(x=>x.m===pM).map(x=>x.p))];
  $("#plansBody").innerHTML = `<div class="card"><div class="row" style="justify-content:space-between"><h2>${MUEBLE[pM]}</h2>${mtag(pM)}</div><div class="hero"><img src="${HEROES[pM]}" alt="Vista del ${MUEBLE[pM]} armado"></div><p class="hint">${pM==="cama5"?"Diseño propio sobre la cama IBIZA: cama eléctrica (2 actuadores de 1500 N, mueble de 2070) con un escritorio de todo el ancho (189 × 50 cm) que cuelga de la cama y va guiado por 2 barras de acero (paralelogramo): nunca se inclina. Cerrada queda a 75 cm; al bajarla se mete debajo, a 11 cm del piso.":pM==="cama3"?"Diseño propio sobre la cama IBIZA: 2 actuadores lineales de 12 V y 900 N (uno por lado) la suben y la bajan con un interruptor. El mueble se ensancha 112 mm (56 por lado) porque el actuador abulta ~55 mm con el motor. Cambian 4 piezas; todo lo demás es del kit.":pM==="cama4"?"Diseño propio: la misma cama IBIZA pero vertical (gira sobre el lado corto, cabecera abajo). Mueble de 1534 × 2180 × 324 mm: necesita techo de 2,25 m o más y 2 m libres delante para abrirla. Se reutilizan la cama, la repisa, las divisiones, y se recortan la tapa, la base superior, el reverso y la trasera del nicho. Solo hay que cortar 2 laterales nuevos de 2165; los laterales del kit sobran. Ayuda con 2 pistones a gas.":pM==="cama2"?"Diseño propio sobre la cama IBIZA: el mueble se ensancha 60 mm (30 por lado) para meter un mecanismo de ayuda con 2 pistones a gas de 800 N. Cambian 4 piezas (tapa, base superior, reverso y trasera del nicho); laterales, divisiones y toda la cama quedan iguales. El manual sirve para todo lo demás.":pM==="cama"?"Cama abatible IBIZA (Tecnomobili CM-8043) · mueble de 1958 × 1705 × 324 mm · colchón de 1,40 × 1,90 · aguanta 240 kg · se arma en ~2 h entre 2 personas. Es un kit de fábrica: el despiece es el del manual y cada pieza trae su código de 6 dígitos.":pM==="armario"?"1800 × 2170 × 500 mm sobre patas de 6 cm · en la app: cuerpo Milán oscuro y puertas/frentes Tivoli claros, con cantos del color contrario · closet de 3 módulos (431,3 · 877,4 · 431,3) con 4 puertas; abajo 6 cajones con manija chaflán (los 2 del centro van en el hueco que el plano llama espacio chimenea). El plano no trae despiece: las piezas están inferidas. A la derecha lleva un módulo lateral de 28 cm (diseño propio) con 6 entrepaños de 25 cm de fondo y una puerta de piso a techo con espejo de cuerpo entero: el conjunto mide 2,08 m de ancho.":pM==="cocina"?"1940 × 850 × 580 mm · melamina clara · módulo izquierdo con puertas y cajón grande, columna de 4 cajones y hueco del horno a la derecha.":"2080 mm de largo · estructura oscura con frentes claros · 3 cajones a la izquierda, nicho y cajón grande al centro, 2 puertas a la derecha."}</p></div>` +
  pages.map(p=>{
    const ps=P.filter(x=>x.p===p);
    return `<div class="card" data-page="${p}"><div class="row" style="justify-content:space-between"><h3>${/^A/.test(p)?"Lámina "+p.slice(1):/^B/.test(p)?"Página "+p.slice(1)+" del manual":"Página "+p} · ${esc(PAGE_TITLE[p])}</h3><span class="hint">${ps.reduce((s,x)=>s+x.q,0)} piezas</span></div>
      <div class="chips" ${ps.length?"":"hidden"}>${ps.map(x=>`<button class="chip" type="button" aria-pressed="false" data-hl="${x.id}"><b>${esc(x.it.replace(/ /g,""))}</b>${esc(x.n)}</button>`).join("")}</div>
      <div class="planslot"><div class="plan"><img src="${PAGES[p]}" alt="Plano página ${p}" loading="lazy"></div></div>
      <p class="hint">Toca una pieza para marcarla en el plano. Tócala otra vez para ver su ficha.</p></div>`;
  }).join("");
  $("#plansBody").querySelectorAll("[data-hl]").forEach(b=>b.onclick=()=>{
    const card=b.closest("[data-page]"), x=byId[b.dataset.hl];
    if(b.getAttribute("aria-pressed")==="true"){ openPiece(x.id); return; }
    card.querySelectorAll("[data-hl]").forEach(c=>c.setAttribute("aria-pressed", c===b));
    card.querySelector(".planslot").innerHTML=planHTML(x);
  });
}

/* ---------- checklist ---------- */
function renderCheck(){
  const done=Object.fromEntries(MUEBLES.map(m=>[m,0])); P.forEach(x=>done[x.m]+=cnt(x.id));
  $("#progCards").innerHTML=CHECK_M.map(m=>{const pct=Math.round(done[m]/TOTAL[m]*100);return `<div class="pcard mbg ${m}"><div class="h"><span style="display:flex;gap:8px;align-items:center">${ico(ICON[m])}${MUEBLE[m]}</span><span class="num">${done[m]}/${TOTAL[m]}</span></div><div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div><span style="font-weight:700">${pct}% · faltan ${TOTAL[m]-done[m]}</span></div>`}).join("");
  let html="";
  for(const m of CHECK_M){
    html+=`<div class="row" style="justify-content:space-between;margin-top:10px"><h2 style="display:flex;gap:8px;align-items:center">${ico(ICON[m])}${MUEBLE[m]}</h2></div>`;
    const groups=[...new Set(P.filter(x=>x.m===m).map(x=>x.g))];
    for(const g of groups){
      html+=`<div class="grp-title">${esc(g)}</div>`;
      html+=P.filter(x=>x.m===m&&x.g===g).map(x=>{const c=cnt(x.id), full=c>=x.q;return `<div class="ck ${full?"full":""}"><div style="min-width:0"><button class="t" type="button" data-open="${x.id}">${full?"✓ ":""}${esc(x.n)}</button><div class="s">Ítem ${esc(x.it)} · <span class="dims">${dimStr(x)}</span> · ${full?"completa":`faltan ${x.q-c}`}</div></div><div class="stepper" data-id="${x.id}"><button type="button" data-d="-1" aria-label="Quitar una de ${esc(x.n)}">−</button><span class="c">${c}/${x.q}</span><button type="button" data-d="1" aria-label="Sumar una de ${esc(x.n)}">+</button></div></div>`}).join("");
    }
  }
  $("#checkBody").innerHTML=html;
  $("#checkBody").querySelectorAll(".stepper button").forEach(b=>b.onclick=()=>{const id=b.parentElement.dataset.id; setCount(id,cnt(id)+Number(b.dataset.d));});
  $("#checkBody").querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>openPiece(b.dataset.open));
}
$("#resetBtn").onclick=()=>{
  $("#resetBox").innerHTML=`<span style="font-weight:700">¿Seguro? Se borra todo el conteo.</span><span class="row"><button class="btn sm" id="rNo" type="button">Cancelar</button><button class="btn sm info" id="rYes" type="button">Sí, reiniciar</button></span>`;
  $("#rNo").onclick=()=>location.reload();
  $("#rYes").onclick=async()=>{ for(const x of P){ if(STATE[x.id]?.n||STATE[x.id]?.codes?.length){ STATE[x.id]={n:0,codes:[]}; if(db){ try{ await db.collection("checklist").doc(x.id).set({n:0,codes:[]}); }catch{} } } } saveLocal(); renderCounts(); renderCheck(); $("#resetBox").innerHTML=`<span class="hint">Checklist reiniciado.</span>`; };
};
