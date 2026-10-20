/* Arranque: estado inicial, conexión con Claude (sample) y base compartida (db). */
/* ---------- arranque ---------- */
renderCounts();
try{ const t=localStorage.getItem(LS+"-tab"); if(t && $("#v-"+t)) show(t); }catch{}
const samplePromise=(async()=>{
  if(!window.claude?.use){ diagTxt="Sin conexión con Claude (página abierta fuera de claude.ai)"; $("#diag").textContent=diagTxt; return null; }
  const s=await window.claude.use("sample").catch(()=>null);
  if(!s){ diagTxt="Claude no disponible en esta vista"; $("#diag").textContent=diagTxt; return null; }
  const lim=await s.limits().catch(()=>null);
  diagTxt = lim?.images ? "Claude listo para leer etiquetas" : "Claude listo (esta vista no reporta soporte de fotos)";
  $("#diag").textContent=diagTxt; sample=s; return s;
})();
(async()=>{
  if(!window.claude?.use){ $("#syncNote").textContent="El conteo se guarda en este celular."; return; }
  const d=await window.claude.use("db").catch(()=>null);
  if(!d){ $("#syncNote").textContent="El conteo se guarda en este celular."; return; }
  db=d;
  db.collection("fixes").onSnapshot(snap=>{ snap.docs.forEach(doc=>{ const v=doc.data(); if(byId[v?.id]) FIXES[doc.id]=v.id; }); try{ localStorage.setItem(LS+"-fixes", JSON.stringify(FIXES)); }catch{} }, ()=>{});
  db.collection("checklist").onSnapshot(snap=>{
    const remote={}; snap.docs.forEach(doc=>{ const v=doc.data(); if(byId[doc.id]) remote[doc.id]={n:Number(v?.n)||0, codes:Array.isArray(v?.codes)?v.codes:[]}; });
    // Primera vez: si en este celular había conteo y en línea no, se sube.
    if(snap.empty && Object.keys(STATE).length){ Object.entries(STATE).forEach(([id,v])=>{ if(byId[id]&&v.n) db.collection("checklist").doc(id).set({n:v.n,codes:v.codes||[]}).catch(()=>{}); }); return; }
    STATE=remote; saveLocal(); renderCounts();
    $("#syncNote").textContent="El conteo se guarda en línea: lo ven todos los que abran esta página.";
  }, ()=>{ $("#syncNote").textContent="Sin conexión al guardado en línea; el conteo queda en este celular."; });
})();
