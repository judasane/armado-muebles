/* Modelo geométrico (sin three.js): conjuntos, CAMA_CFG, buildModel, herrajes, mecanismos y escritorio. */
/* ---------- conjuntos (áreas del mueble) ---------- */
// Camas: casco (ancho W), corrimiento X de la cama, prefijo de las piezas, vertical o no y mecanismo.
const CAMA_CFG = {cama:{pre:"m-",W:1958,X:0}, cama2:{pre:"q-",W:2018,X:30}, cama3:{pre:"e-",W:2070,X:56}, cama4:{pre:"v-",W:1534,X:49,vert:1}, cama5:{pre:"f-",W:2070,X:56,desk:1}};
const AREAS = {
  cocina: [
    {k:"cj0", n:"Cajón 1 de la columna (abajo)", t:s=>s.g==="cj0", drawer:1},
    {k:"cj1", n:"Cajón 2 de la columna", t:s=>s.g==="cj1", drawer:1},
    {k:"cj2", n:"Cajón 3 de la columna", t:s=>s.g==="cj2", drawer:1},
    {k:"cj3", n:"Cajón 4 de la columna (arriba, el de 150)", t:s=>s.g==="cj3", drawer:1},
    {k:"cg", n:"Cajón grande (abajo a la izquierda)", t:s=>s.g==="cg", drawer:1},
    {k:"cb", n:"Cajón bajo (encima del horno)", t:s=>s.g==="cb", drawer:1},
    {k:"c-izq", n:"Módulo izquierdo: puertas y cajón grande", t:s=>s.g==="cg"||["c-puerta1","c-puerta2","c-compbase"].includes(s.id)},
    {k:"c-col", n:"Columna de 4 cajones", t:s=>/^cj/.test(s.g||"")},
    {k:"c-horno", n:"Módulo del horno", t:s=>s.g==="cb"||["c-divref","c-compref660","c-compref565","c-entrepano","c-latder"].includes(s.id)},
    {k:"c-est", n:"Estructura (cuerpo del mueble)", t:s=>["c-base","c-latizq","c-latder","c-divisor","c-refuerzo","c-compbase","c-divref","c-compref660","c-compref565","c-entrepano"].includes(s.id)},
    {k:"c-front", n:"Frentes y puertas", t:s=>!!s.front},
  ],
  armario: [
    {k:"ab0", n:"Cajón de abajo izquierdo (abajo)", t:s=>s.g==="ab0", drawer:1},
    {k:"ab1", n:"Cajón de abajo izquierdo (arriba)", t:s=>s.g==="ab1", drawer:1},
    {k:"ab2", n:"Cajón de abajo derecho (abajo)", t:s=>s.g==="ab2", drawer:1},
    {k:"ab3", n:"Cajón de abajo derecho (arriba)", t:s=>s.g==="ab3", drawer:1},
    {k:"ab4", n:"Cajón de abajo central (abajo)", t:s=>s.g==="ab4", drawer:1},
    {k:"ab5", n:"Cajón de abajo central (arriba)", t:s=>s.g==="ab5", drawer:1},
    {k:"ai0", n:"Cajón interior 1 (abajo)", t:s=>s.g==="ai0", drawer:1},
    {k:"ai1", n:"Cajón interior 2", t:s=>s.g==="ai1", drawer:1},
    {k:"ai2", n:"Cajón interior 3 (arriba)", t:s=>s.g==="ai2", drawer:1},
    {k:"a-izq", n:"Módulo izquierdo (colgar)", t:s=>s.zone==="izq"},
    {k:"a-cen", n:"Módulo central (colgar)", t:s=>s.zone==="cen"},
    {k:"a-der", n:"Módulo derecho (repisas y cajones)", t:s=>s.zone==="der"},
    {k:"a-bajo", n:"Parte baja: 6 cajones", t:s=>s.zone==="bajo"},
    {k:"a-est", n:"Estructura (cuerpo del armario)", t:s=>s.zone==="est"},
    {k:"a-lat", n:"Módulo lateral con espejo (derecha)", t:s=>s.zone==="lat"},
    {k:"a-front", n:"Puertas y frentes", t:s=>!!s.front},
  ],
  cama2: [
    {k:"q-nuevas", n:"Piezas NUEVAS (mandar a cortar)", t:s=>!!byId[s.id]?.nueva},
    {k:"q-casco", n:"Mueble fijo (casco ensanchado)", t:s=>s.zone==="casco"},
    {k:"q-nsup", n:"Nicho de arriba", t:s=>["q-base","q-div","q-tampo","q-costasup"].includes(s.id)},
    {k:"q-cama", n:"Cama completa (la parte que sube y baja)", t:s=>!!s.bed},
    {k:"q-plat", n:"Base y marco de la cama", t:s=>["q-lastroc","q-lastrol","q-barra","q-cab"].includes(s.id)},
    {k:"q-nicho", n:"Repisa bajo la cama (pata al abrirla)", t:s=>s.zone==="nicho"},
  ],
  cama: [
    {k:"m-casco", n:"Mueble fijo (casco)", t:s=>s.zone==="casco"},
    {k:"m-nsup", n:"Nicho de arriba", t:s=>["m-base","m-div","m-tampo","m-costasup"].includes(s.id)},
    {k:"m-cama", n:"Cama completa (la parte que sube y baja)", t:s=>!!s.bed},
    {k:"m-plat", n:"Base y marco de la cama", t:s=>["m-lastroc","m-lastrol","m-barra","m-cab"].includes(s.id)},
    {k:"m-nicho", n:"Repisa bajo la cama (pata al abrirla)", t:s=>s.zone==="nicho"},
  ],
  tv: [
    {k:"tj0", n:"Cajón 1 de la izquierda (abajo)", t:s=>s.g==="tj0", drawer:1},
    {k:"tj1", n:"Cajón 2 de la izquierda (medio)", t:s=>s.g==="tj1", drawer:1},
    {k:"tj2", n:"Cajón 3 de la izquierda (arriba)", t:s=>s.g==="tj2", drawer:1},
    {k:"tg", n:"Cajón grande del centro", t:s=>s.g==="tg", drawer:1},
    {k:"t-izq", n:"Módulo de 3 cajones (izquierda)", t:s=>/^tj/.test(s.g||"")},
    {k:"t-puertas", n:"Puertas de despensa (derecha)", t:s=>s.id==="t-puerta"},
    {k:"t-zoc", n:"Zócalo", t:s=>/^t-zocalo/.test(s.id)},
    {k:"t-est", n:"Estructura (cuerpo del mueble)", t:s=>["t-base","t-lat","t-division","t-entrepano","t-respaldo"].includes(s.id)},
    {k:"t-front", n:"Frentes y puertas", t:s=>!!s.front},
  ]
};
AREAS.cama5=[
    {k:"f-esc", n:"Escritorio (siempre horizontal)", t:s=>!!s.desk},
    {k:"f-cama", n:"Cama completa (la parte que sube y baja)", t:s=>!!s.bed},
    {k:"f-plat", n:"Base y marco de la cama", t:s=>["f-lastroc","f-lastrol","f-barra","f-cab"].includes(s.id)},
    {k:"f-casco", n:"Mueble fijo (igual al kit)", t:s=>s.zone==="casco"},
    {k:"f-nsup", n:"Nicho de arriba", t:s=>["f-base","f-div","f-tampo","f-costasup"].includes(s.id)},
    {k:"f-nuevas", n:"Piezas nuevas o recortadas", t:s=>!!(byId[s.id]?.nueva||byId[s.id]?.recorte)}];
for(const m of ["cama3","cama4"]){ const p=CAMA_CFG[m].pre;
  AREAS[m]=[
    {k:p+"nuevas", n:"Piezas NUEVAS (mandar a cortar)", t:s=>!!byId[s.id]?.nueva},
    ...(m==="cama4"?[{k:p+"recortes", n:"Piezas del kit RECORTADAS", t:s=>!!byId[s.id]?.recorte}]:[]),
    {k:p+"casco", n:m==="cama4"?"Mueble fijo (vertical)":"Mueble fijo (casco ensanchado)", t:s=>s.zone==="casco"},
    {k:p+"nsup", n:"Nicho de arriba", t:s=>[p+"base",p+"div",p+"tampo",p+"costasup"].includes(s.id)},
    {k:p+"cama", n:"Cama completa (la parte que sube y baja)", t:s=>!!s.bed},
    {k:p+"plat", n:"Base y marco de la cama", t:s=>[p+"lastroc",p+"lastrol",p+"barra",p+"cab"].includes(s.id)},
    {k:p+"nicho", n:"Repisa bajo la cama (pata al abrirla)", t:s=>s.zone==="nicho"}];
}
const AREA_BY_KEY = {}; Object.entries(AREAS).forEach(([m,l])=>l.forEach(a=>AREA_BY_KEY[a.k]={...a,m}));
let _areaIdx=null;
function areaIndex(){ // id de pieza -> [{k, n, c}] en qué conjuntos aparece y cuántas
  if(_areaIdx) return _areaIdx;
  _areaIdx={};
  for(const m of MUEBLES){
    const specs=buildModel(m).filter(s=>!s.sub);
    for(const a of AREAS[m]){
      const c={}; specs.filter(a.t).forEach(s=>c[s.id]=(c[s.id]||0)+1);
      Object.entries(c).forEach(([id,n])=>(_areaIdx[id]=_areaIdx[id]||[]).push({k:a.k,n:a.n,c:n,drawer:!!a.drawer}));
    }
  }
  return _areaIdx;
}
function piecesOfArea(k){
  const a=AREA_BY_KEY[k], c={};
  buildModel(a.m).filter(s=>!s.sub && a.t(s)).forEach(s=>c[s.id]=(c[s.id]||0)+1);
  return Object.entries(c).map(([id,n])=>({x:byId[id], n}));
}
function traitsOf(x){
  const t=[];
  if(/RANUFO/.test(x.pl)) t.push("Con ranura de 6 mm (ahí entra el fondo)");
  if(/CAJACE/.test(x.pl)) t.push("Con cajeado de 15 × 80 (por ahí pasa un refuerzo de 1910)");
  if(x.d[2]===6) t.push("Tablero delgado de 6 mm: va metido en la ranura de las piezas vecinas");
  if(/Reta/.test(x.pl)) t.push("Frente o puerta visible");
  return t;
}
function specHTML(x){
  const areas=(areaIndex()[x.id]||[]).sort((a,b)=>(b.drawer-a.drawer));
  const tr=traitsOf(x), seen=(STATE[x.id]?.codes||[]).filter(Boolean);
  const approx=buildModel(x.m).some(s=>s.id===x.id&&s.approx);
  return `<div class="spec">
    <div class="srow"><span class="k">ID único (plano)</span><span class="v mono">${x.ids?esc(x.ids):"El plano no trae ID para esta pieza"}</span></div>
    <div class="srow"><span class="k">Nombre en el plano</span><span class="v mono">${esc(x.pl)}</span></div>
    <div class="srow"><span class="k">En el sticker</span><span class="v mono">${seen.length?seen.map(esc).join(" · "):x.stk?`${esc(x.stk)}… <span class="hint">(ej. 13222-<b>FondoD1</b>-13241; el final cambia)</span>`:`<span class="hint">Aún no se sabe: cuando escanees su etiqueta con foto, el código queda guardado aquí.</span>`}</span></div>
    <div class="srow"><span class="k">Va en</span><span class="v">${areas.length?`<span class="chips">${areas.map(a=>`<button class="chip" type="button" data-area="${a.k}">${esc(a.n)}${a.c>1?` <b>×${a.c}</b>`:""}</button>`).join("")}</span>`:"—"}</span></div>
    <div class="srow"><span class="k">Plano</span><span class="v">${/^A/.test(x.p)?"Lámina "+x.p.slice(1):"Página "+x.p}${x.it!=="—"?" · ítem "+esc(x.it):""} · ${esc(x.g)}</span></div>
    <div class="srow"><span class="k">Medidas</span><span class="v mono">${dimStr(x)} mm · ${x.q} ${x.q>1?"piezas iguales":"pieza"}</span></div>
    ${tr.length?`<div class="srow"><span class="k">Detalles</span><span class="v">${tr.map(esc).join("<br>")}</span></div>`:""}
    ${x.inf?`<div class="srow"><span class="k">Origen</span><span class="v">${INF_NOTE}</span></div>`:""}
    ${approx?`<div class="srow"><span class="k">En el 3D</span><span class="v">Posición aproximada: el plano no la marca exacta</span></div>`:""}
  </div>`;
}
function go3DArea(k){ const a=AREA_BY_KEY[k]; if(!a) return; if($("#dlg").open) $("#dlg").close(); show("3d"); show3D(a.m); selectArea3D(k, true); }

/* ---------- modelo 3D ----------
   Cajas en mm: [x0,x1, y0,y1, z0,z1]; x = ancho (izq→der), y = alto, z = fondo (atrás 0 → frente).
   Posiciones deducidas de las cotas del plano; los listones de refuerzo de la cocina son aproximados. */
function buildModel(m){
  const L=[]; const add=(id,b,o={})=>L.push({id,b,...o});
  if(m==="cocina"){
    add("c-base",[0,1940,0,15,0,580]);
    add("c-latizq",[0,15,15,850,0,580]);
    [815,1245].forEach(x=>{ add("c-divisor",[x,x+15,15,770,0,580]); add("c-divisor",[x,x+15,770,850,15,565],{sub:1}); });
    add("c-latder",[1925,1940,15,850,480,580]);
    add("c-compbase",[15,815,380,395,10,580]);
    add("c-refuerzo",[15,1925,770,850,565,580]); add("c-refuerzo",[15,1925,770,850,0,15]);
    // módulo del horno (pág. 1): listones 10 con cajeado 15×80 arriba donde apoya la repisa 9 (665 de lado a lado);
    // sobre la repisa, el soporte de riel 1 (95 de alto, justo hasta el refuerzo) que llega atrás al listón 2.
    add("c-divref",[1260,1275,15,660,500,580],{approx:1});
    add("c-divref",[1895,1910,15,660,500,580],{approx:1}); add("c-divref",[1910,1925,15,660,500,580],{approx:1});
    add("c-entrepano",[1260,1925,660,675,21,580]);
    add("c-compref660",[1845,1925,15,675,0,15]);
    add("c-compref565",[1895,1910,675,770,15,580]);
    // cajón grande
    const g="cg";
    // caja cortada a 485 de fondo (tubo atrás): de z 93 a 578
    add("c-cg-lat",[28,43,18,378,93,578],{g}); add("c-cg-lat",[786,801,18,378,93,578],{g});
    add("c-cg-frtest",[43,786,18,378,93,108],{g});
    add("c-cg-fondo",[43,786,18,33,108,563],{g});
    add("c-cg-panel",[3,822,3,387,580,595],{g,front:1});
    add("c-puerta2",[3,415,391.3,811.8,580,595],{front:1,door:"c-pi",hinge:"L"}); add("c-puerta1",[418,822.5,391.3,811.8,580,595],{front:1,door:"c-pd",hinge:"R"});
    // columna de 4 cajones (el de arriba es el de 150)
    for(let i=0;i<4;i++){
      const fy=3+i*203, h=i===3?150:180, y=Math.max(fy+4,16), g="cj"+i, s=h===180?"180":"150";
      add("c-cj-lat"+s,[843.5,858.5,y,y+h,28,578],{g}); add("c-cj-lat"+s,[1216.5,1231.5,y,y+h,28,578],{g});
      add("c-cj-ft"+s,[858.5,1216.5,y,y+h,28,43],{g});
      add("c-cj-fondo",[852.5,1222.5,y+8,y+14,37,569],{g});
      add("c-cj-frente",[824,1251,fy,fy+199.8,580,595],{g,front:1});
    }
    // cajón bajo encima del horno
    const b="cb";
    add("c-cb-lat",[1273.5,1288.5,678,768,28,578],{g:b}); add("c-cb-lat",[1866.5,1881.5,678,768,28,578],{g:b});
    add("c-cb-ft",[1288.5,1866.5,678,768,563,578],{g:b}); add("c-cb-ft",[1288.5,1866.5,678,768,28,43],{g:b});
    add("c-cb-fondo",[1282.5,1872.5,684,690,37,569],{g:b});
    add("c-cb-panel",[1251,1935,678.8,811.8,580,595],{g:b,front:1});
  } else if(m==="tv"){
    add("t-zocalo",[0,2080,0,100,435,450]);
    [0,420,840,1240,1650,2065].forEach(x=>add("t-zocalolat",[x,x+15,0,100,0,435],{approx:1}));
    add("t-base",[0,2080,100,115,0,450]); add("t-base",[0,2080,835,850,0,450]);
    add("t-lat",[0,15,115,835,0,450]); add("t-lat",[2065,2080,115,835,0,450]);
    [580,1175,1770].forEach(x=>add("t-division",[x,x+15,115,835,22,450]));
    add("t-entrepano",[595,1175,440,455,22,450]);
    add("t-respaldo",[1183,2073,108,842,8,14]);
    for(let i=0;i<3;i++){
      const fy=117+i*239.3, y=fy+4, g="tj"+i;
      add("t-cj-lat",[28.5,43.5,y,y+229,50,450],{g}); add("t-cj-lat",[551.5,566.5,y,y+229,50,450],{g});
      add("t-cj-test",[43.5,551.5,y,y+229,50,65],{g});
      add("t-cj-fondo",[37.5,557.5,y+8,y+14,65,447],{g});
      add("t-cj-frente",[17,578,fy,fy+236.7,450,465],{g,front:1});
    }
    const g="tg";
    add("t-cg-lat",[608.5,623.5,125,425,50,450],{g}); add("t-cg-lat",[1146.5,1161.5,125,425,50,450],{g});
    add("t-cg-ft",[623.5,1146.5,125,425,50,65],{g});
    add("t-cg-fondo",[617.5,1152.5,133,139,59,441],{g});
    add("t-cg-panel",[597,1173,117,438,450,465],{g,front:1});
    add("t-puerta",[1192,1479,117,834,450,465],{front:1,door:"t-pi",hinge:"L"}); add("t-puerta",[1481,1768,117,834,450,465],{front:1,door:"t-pd",hinge:"R"});
  }
  if(m==="armario"){
    // Medidas en mm sin patas; todo sube 60 por las patas de 6 cm. Módulos: arriba 431,3 · 877,4 · 431,3; abajo 565 · 610 · 565.
    const Y=60, A=(id,b,o={})=>add(id,[b[0],b[1],b[2]+Y,b[3]+Y,b[4],b[5]],{approx:1,...o});
    const xl=[15,446.3], xc=[461.3,1338.7], xr=[1353.7,1785];
    A("a-lat",[0,15,0,2170,0,500],{zone:"est"}); A("a-lat",[1785,1800,0,2170,0,500],{zone:"est"});
    A("a-piso",[15,1785,0,15,0,500],{zone:"est"}); A("a-medio",[15,1785,390,405,0,500],{zone:"est"}); A("a-techo",[15,1785,2155,2170,0,500],{zone:"est"});
    A("a-divs",[446.3,461.3,405,2155,0,500],{zone:"est"}); A("a-divs",[1338.7,1353.7,405,2155,0,500],{zone:"est"});
    A("a-divi",[580,595,15,390,0,500],{zone:"est"}); A("a-divi",[1205,1220,15,390,0,500],{zone:"est"});
    for(const [x,id,z] of [[xl,"a-reflat","izq"],[xc,"a-refcen","cen"],[xr,"a-reflat","der"]]){ A(id,[x[0],x[1],2065,2155,0,15],{zone:z}); A(id,[x[0],x[1],405,495,0,15],{zone:z}); }
    A("a-refinl",[15,580,15,105,0,15],{zone:"bajo"}); A("a-refinc",[595,1205,15,105,0,15],{zone:"bajo"}); A("a-refinl",[1220,1785,15,105,0,15],{zone:"bajo"});
    // módulo izquierdo: repisa a 200 del techo, 1220 de colgar, repisa y 300 libres abajo
    A("a-ent",[xl[0],xl[1],1940,1955,15,500],{zone:"izq"}); A("a-ent",[xl[0],xl[1],705,720,15,500],{zone:"izq"});
    // módulo derecho: 3 repisas + tapa de los cajones interiores
    for(const y of [971,1285,1578,1867]) A("a-ent",[xr[0],xr[1],y,y+15,15,500],{zone:"der"});
    A("a-supl",[1353.7,1368.7,405,971,15,500],{zone:"der"}); A("a-supl",[1770,1785,405,971,15,500],{zone:"der"});
    // 3 cajones interiores (frentes dentro del módulo, detrás de la puerta)
    [407,595,783].forEach((fy,i)=>{ const g="ai"+i, y=fy+20;
      A("a-cil",[1381.35,1396.35,y,y+130,35,485],{g,zone:"der"}); A("a-cil",[1742.35,1757.35,y,y+130,35,485],{g,zone:"der"});
      A("a-cit",[1396.35,1742.35,y,y+130,35,50],{g,zone:"der"}); A("a-cit",[1396.35,1742.35,y,y+130,470,485],{g,zone:"der"});
      A("a-cio",[1390.35,1748.35,y+8,y+14,44,476],{g,zone:"der"});
      A("a-cif",[1371.85,1766.85,fy,fy+185,485,500],{g,front:1,zone:"der"}); });
    // 4 cajones de abajo con manija chaflán (frentes por delante)
    [[0,28,1,"izq"],[1,1233,1206,"der"]].forEach(([side,bx,fx])=>{ [[2,25],[197,210]].forEach(([fy,by],j)=>{ const g="ab"+(side*2+j);
      A("a-cbl",[bx,bx+15,by,by+150,35,485],{g,zone:"bajo"}); A("a-cbl",[bx+524,bx+539,by,by+150,35,485],{g,zone:"bajo"});
      A("a-cbt",[bx+15,bx+524,by,by+150,35,50],{g,zone:"bajo"}); A("a-cbt",[bx+15,bx+524,by,by+150,470,485],{g,zone:"bajo"});
      A("a-cbo",[bx+9,bx+530,by+8,by+14,44,476],{g,zone:"bajo"});
      A("a-cbf",[fx,fx+593,fy,fy+192,500,515],{g,front:1,zone:"bajo"}); }); });
    // 2 cajones centrales en el hueco de 610 (antes espacio chimenea): caja 584,6 = 610 − 2 rieles de 12,7
    [[2,25],[197,210]].forEach(([fy,by],j)=>{ const g="ab"+(4+j), bx=607.7;
      A("a-cbl",[bx,bx+15,by,by+150,35,485],{g,zone:"bajo"}); A("a-cbl",[bx+569.6,bx+584.6,by,by+150,35,485],{g,zone:"bajo"});
      A("a-cct",[bx+15,bx+569.6,by,by+150,35,50],{g,zone:"bajo"}); A("a-cct",[bx+15,bx+569.6,by,by+150,470,485],{g,zone:"bajo"});
      A("a-cco",[bx+9,bx+575.6,by+8,by+14,44,476],{g,zone:"bajo"});
      A("a-ccf",[598,1202,fy,fy+192,500,515],{g,front:1,zone:"bajo"}); });
    // 4 puertas: las de los lados abren hacia afuera, las del centro hacia los lados
    // módulo lateral a la derecha: 28 cm de ancho, entrepaños de 25 cm y puerta con espejo que abre hacia la derecha (bisagras del lado de la pared)
    A("a-mlc",[1800,2065,0,2170,0,15],{zone:"lat"}); A("a-mlc",[1800,2065,0,2170,485,500],{zone:"lat"});
    A("a-mlt",[1800,2065,0,15,15,485],{zone:"lat"}); A("a-mlt",[1800,2065,2155,2170,15,485],{zone:"lat"});
    const gap=(2140-6*15)/7; for(let k=1;k<=6;k++){ const y=15+k*gap+(k-1)*15; A("a-mle",[1800,2050,y,y+15,15,485],{zone:"lat"}); }
    const pv={x:2080,z:1.5};   // eje de las bisagras de la puerta lateral
    A("a-mlp",[2065,2080,1,2169,1.5,498.5],{front:1,door:"a-p5",side:1,pv,zone:"lat"});
    A("a-mlx",[2080,2084,185,1985,50.5,450.5],{front:1,door:"a-p5",side:1,pv,zone:"lat"});
    [[0,"a-p1","L"],[450.75,"a-p2","L"],[901.5,"a-p3","R"],[1352.25,"a-p4","R"]].forEach(([x,k,h])=>A("a-puerta",[x,x+447.75,392,2169,500,515],{front:1,door:k,hinge:h,zone:k==="a-p1"?"izq":k==="a-p4"?"der":"cen"}));
  }
  if(CAMA_CFG[m]){
    // Coordenadas con la cama ABIERTA (acostada). x = ancho, y = alto, z = desde la pared. Cerrada = girada −90° sobre BED_PIVOT.
    const CF=CAMA_CFG[m], I=s=>CF.pre+s, W=CF.W, X=CF.X;
    const C=(id,b,o={})=>add(I(id),b,{zone:"casco",...o}), B=(id,b,o={})=>add(I(id),[b[0]+X,b[1]+X,b[2],b[3],b[4],b[5]],{bed:1,door:"cama",...o});
    const N=(id,b)=>B(id,b,{zone:"nicho"});
    if(!CF.vert){
      // horizontal: casco de W × 1705 × 324; la cama (1920 × 1436) gira sobre su lado largo
      C("latizq",[0,15,0,1690,0,324]); C("latder",[W-15,W,0,1690,0,324]);
      C("tampo",[0,W,1690,1705,0,324]); C("base",[15,W-15,1475,1490,0,324]);
      const d1=15+(W-30)/3, d2=15+2*(W-30)/3;
      C("div",[d1-7.5,d1+7.5,1490,1690,0,324]); C("div",[d2-7.5,d2+7.5,1490,1690,0,324]);
      C("costasup",[5,W-5,1475,1695,-3,0]); C("reves",[15,W-15,1025,1475,0,15]);
      B("cab",[19,34,246,346,0,1436]); B("cab",[1924,1939,246,346,0,1436]);
      B("barra",[34,1924,246,346,0,15]); B("barra",[34,1924,246,346,1419,1434]);
      B("lastrol",[34,1924,246,261,15,483]); B("lastroc",[34,1924,246,261,483,951]); B("lastrol",[34,1924,246,261,951,1419]);
      if(CF.desk){
        // pata del pie (un lateral de la repisa) y escritorio en posición ABIERTA: debajo de la cama, a 4 cm del piso
        B("nlat",[372,1586,0,246,1405,1420],{zone:"pata"});
        const D=(id,b)=>add(I(id),[b[0]+X,b[1]+X,b[2],b[3],b[4],b[5]],{desk:1,zone:"esc"});
        D("esc",[34,1924,95,110,870,1370]);
        D("fald",[34,1924,50,95,870,885]); D("fald",[34,1924,50,95,1355,1370]);
        D("faldc",[34,49,50,95,885,1355]); D("faldc",[1909,1924,50,95,885,1355]);
      } else {
        N("nlat",[372,1586,0,246,302,317]); N("nlat",[372,1586,0,246,1117,1132]);
        N("nest-izq",[372,387,0,246,317,1117]); N("nest-cen",[971.5,986.5,0,246,317,1117]); N("nest-der",[1571,1586,0,246,317,1117]);
        N("nest",[387,971.5,0,246,709.5,724.5]); N("nest",[986.5,1570.5,0,246,576,591]); N("nest",[986.5,1570.5,0,246,843,858]);
      }
    } else {
      // vertical: casco de 1534 × 2180 × 324; la cama gira sobre su lado corto (cabecera abajo, contra la pared)
      C("latizq",[0,15,0,2165,0,324]); C("latder",[W-15,W,0,2165,0,324]);
      C("tampo",[0,W,2165,2180,0,324]); C("base",[15,W-15,1950,1965,0,324]);
      const d1=15+(W-30)/3, d2=15+2*(W-30)/3;
      C("div",[d1-7.5,d1+7.5,1965,2165,0,324]); C("div",[d2-7.5,d2+7.5,1965,2165,0,324]);
      C("costasup",[5,W-5,1950,2170,-3,0]); C("reves",[15,W-15,1500,1950,0,15]);
      B("cab",[0,1436,246,346,0,15]); B("cab",[0,1436,246,346,1905,1920]);
      B("barra",[1,16,246,346,15,1905]); B("barra",[1420,1435,246,346,15,1905]);
      B("lastrol",[16,484,246,261,15,1905]); B("lastroc",[484,952,246,261,15,1905]); B("lastrol",[952,1420,246,261,15,1905]);
      N("nlat",[303,318,0,246,353,1567]); N("nlat",[1118,1133,0,246,353,1567]);
      N("nest-izq",[318,1118,0,246,353,368]); N("nest-cen",[318,1118,0,246,952.5,967.5]); N("nest-der",[318,1118,0,246,1552,1567]);
      N("nest",[710.5,725.5,0,246,368,952.5]); N("nest",[577,592,0,246,967.5,1552]); N("nest",[844,859,0,246,967.5,1552]);
    }
  }
  return L;
}
// Eje de la cama (tornillo M8 por los laterales): cerrada = girada −90° sobre este punto.
// Dibujo del lateral en el paso 8: agujero a ~305 del piso y ~60 del borde de adelante; 296/54 es lo más cerca que deja
// la cama cerrada entre el piso y la base superior (1475).
const BED_PIVOT={y:296, z:270};
const DESK={H:{y:246,z:860}, OFF:{y:-240,z:60}, xs:[216,1854], LIFT:400, SC:{L:410, zc:1120, y0:125, y1:205}};   // pasador del escritorio en la cama (abierta) y desfase de la barra
const deskDelta = a => { const dy=DESK.H.y-BED_PIVOT.y, dz=DESK.H.z-BED_PIVOT.z; return {y:BED_PIVOT.y+dy*Math.cos(a)-dz*Math.sin(a)-DESK.H.y, z:BED_PIVOT.z+dy*Math.sin(a)+dz*Math.cos(a)-DESK.H.z}; };
const deskClosedBox = b => { const d=deskDelta(-Math.PI/2); return [b[0],b[1],b[2]+d.y,b[3]+d.y,b[4]+d.z,b[5]+d.z]; };
const bedClosedBox = b => [b[0],b[1], BED_PIVOT.y+b[4]-BED_PIVOT.z, BED_PIVOT.y+b[5]-BED_PIVOT.z, BED_PIVOT.z-(b[3]-BED_PIVOT.y), BED_PIVOT.z-(b[2]-BED_PIVOT.y)];
// Herrajes y colchón de la cama (no son piezas del despiece)
function buildDeskHw(){
  const P=[], steel="#8d949b", dark="#3a3f45", black="#24272b", id="__esc", F={y:BED_PIVOT.y+DESK.OFF.y, z:BED_PIVOT.z+DESK.OFF.z}, X=56, D={y:DESK.H.y+DESK.OFF.y, z:DESK.H.z+DESK.OFF.z};
  for(const x of DESK.xs){
    P.push({b:[x-12,x+12,228,246,840,872],c:steel,n:"bisagra en la cama",id,bed:1});                         // bloque bajo la base de la cama
    P.push({k:"xcyl",r:6,b:[x-22,x+22,230,242,854,866],c:dark,n:"pasador del escritorio",id,desk:1});
    P.push({b:[x-10,x+10,35,232,870,890],c:black,n:"poste del marco",id,desk:1});
    P.push({b:[x-10,x+10,0,64,F.z-7,F.z+18],c:steel,n:"soporte al piso",id});   // queda 3 mm delante de la cama cerrada                                // fijo al piso
    P.push({k:"xcyl",r:5,b:[x-18,x+18,F.y-5,F.y+5,F.z-5,F.z+5],c:dark,n:"pasador del soporte",id});
    P.push({b:[x-10,x+10,D.y,15,D.z-12,D.z+12],c:steel,n:"oreja bajo el marco",id,desk:1});
    P.push({k:"seg",lnk:1,x,A:F,Q:DESK.H,s0:0,len:null,r:7,c:"#5b6168",n:"barra del paralelogramo",id,b:[0,1,0,1,0,1]});
  }
  // marco de acero negro bajo el tablero
  for(const z of [890,1330]) P.push({b:[60+X,1898+X,15,35,z,z+20],c:black,n:"marco de acero",id,desk:1});
  for(const x of [60,1878]) P.push({b:[x+X,x+20+X,15,35,910,1330],c:black,n:"marco de acero",id,desk:1});
  return P;
}
function buildCamaHw(m="cama"){
  const CF=CAMA_CFG[m], P=[], steel="#9aa0a6", X=CF.X;
  P.push({b:CF.vert?[16+X,1420+X,261,461,15,1905]:[34+X,1924+X,261,461,15,1419],c:"#f4f1ea",n:"colchón",id:"__cama",bed:1,op:.55});
  if(m==="cama"||m==="cama5") for(const x of [-10,1958]) P.push({b:[x,x+10,286,306,260,280],c:steel,n:"eje",id:"__cama"});
  const ly=CF.vert?1965:1490;
  for(const x of CF.vert?[300,1212]:[330+X,1610+X]) P.push({b:[x,x+22,ly,ly+22,296,318],c:"#c9a227",n:"cerradura",id:"__cama"});
  return P;
}
/* Mecanismos de ayuda: en cada lado, en el hueco entre el lateral y la cama.
   A = punto fijo en la placa del lateral; Q = punto en el brazo de la cama (coordenadas con la cama ABIERTA).
   cama2: pistón 800 N, 379 → 551 mm. cama3: actuador 900 N (405–705), 410 → 699 mm. cama4: pistón ~1400 N, 571 → 715 mm. */
const MECS = {
  cama2:{kind:"gas", A:{y:696,z:200}, Q:{y:326,z:120}, xc:32, face:49, plate:[230,760,150,310], arm:[252,340,70,360], F:800, ext:560, stroke:200, body:300, rb:10.5, rr:4.5},
  cama3:{kind:"act", A:{y:700,z:30}, Q:{y:290,z:20}, xc:45, face:75, plate:[230,760,15,310], arm:[252,340,5,300], F:900},
  cama5:{kind:"act", A:{y:700,z:30}, Q:{y:290,z:20}, xc:45, face:75, plate:[230,760,15,310], arm:[252,340,5,300], F:1500},
  cama4:{kind:"gas", A:{y:880,z:275}, Q:{y:325,z:140}, xc:32, face:50, plate:[230,940,150,310], arm:[252,340,70,360], F:1500, ext:750, stroke:300, body:420, rb:12, rr:5},
};
function buildMec(m){
  const K=MECS[m], W=CAMA_CFG[m].W, P=[], steel="#8d949b", dark="#3a3f45", black="#16181b", chrome="#d6dade", alu="#c3c7cc", id="__mec";
  for(const side of [0,1]){
    const fx=(a,b)=>side?[W-b,W-a]:[a,b], X=v=>side?W-v:v, [py0,py1,pz0,pz1]=K.plate, f=K.face;
    P.push({b:[...fx(15,19),py0,py1,pz0,pz1],c:steel,n:"placa del lateral",id,op:.45});   // semitransparente: deja ver lo que hay detrás
    P.push({b:[...fx(-4,0),py0,py1,pz0,pz1],c:steel,n:"contraplaca exterior",id,op:.6});    // sándwich: el lateral queda prensado entre 2 platinas
    for(const y of [py0+32,(py0+py1)/2,py1-32]) for(const z of [pz0+20,pz1-18]) P.push({k:"xcyl",r:8,b:[...fx(-9,-4),y-8,y+8,z-8,z+8],c:dark,n:"perno pasante M8",id});
    P.push({k:"xcyl",r:10,b:[...fx(-6,f+15),286,306,260,280],c:chrome,n:"eje del mecanismo",id});
    P.push({b:[...fx(19,K.xc-4),K.A.y-12,K.A.y+12,K.A.z-12,K.A.z+12],c:steel,n:"soporte del punto fijo",id});
    P.push({k:"sph",r:9,b:[X(K.xc)-9,X(K.xc)+9,K.A.y-9,K.A.y+9,K.A.z-9,K.A.z+9],c:dark,n:"rótula fija",id});
    const [ay0,ay1,az0,az1]=K.arm;
    P.push({b:[...fx(f-4,f),ay0,ay1,az0,az1],c:steel,n:"brazo de la cama",id,bed:1});
    P.push({b:[...fx(f+15,f+165),240,246,az0,az1],c:steel,n:"escuadra bajo la cama",id,bed:1});      // reparte la fuerza en la base (3 lastres), no solo en la cabecera
    for(const z of [az0+25,(az0+az1)/2,az1-25]) P.push({k:"xcyl",r:7,b:[...fx(f-8,f-4),289,303,z-7,z+7],c:dark,n:"perno del brazo",id,bed:1});
    P.push({b:[...fx(K.xc+4,f-4),K.Q.y-10,K.Q.y+10,K.Q.z-10,K.Q.z+10],c:steel,n:"oreja del brazo",id,bed:1});
    P.push({k:"sph",r:9,b:[X(K.xc)-9,X(K.xc)+9,K.Q.y-9,K.Q.y+9,K.Q.z-9,K.Q.z+9],c:dark,n:"rótula móvil",id,bed:1});
    const S=(o)=>P.push({k:"seg",x:X(K.xc),A:K.A,Q:K.Q,id,b:[0,1,0,1,0,1],...o});
    if(K.kind==="gas"){
      S({s0:0,len:K.body,r:K.rb,c:black,n:"pistón a gas (cuerpo)"}); S({s0:K.body,len:null,r:K.rr,c:chrome,n:"pistón a gas (vástago)"});
    } else {   // actuador: tubo de aluminio, vástago, motor al lado y caja de engranajes
      S({s0:-15,len:375,r:16,c:alu,n:"actuador (tubo)"}); S({s0:360,len:null,r:10,c:chrome,n:"actuador (vástago)"});
      S({s0:10,len:150,r:23,off:41,c:black,n:"actuador (motor 12 V)"}); S({s0:-28,len:50,r:25,off:20,c:"#2a2d31",n:"actuador (caja de engranajes)"});
    }
  }
  if(K.kind==="act"){   // interruptor en el frente del lateral derecho y fuente detrás del nicho
    P.push({b:[W,W+12,1100,1180,250,300],c:"#f2f2f2",n:"interruptor (mantener presionado)",id});
    P.push({b:[W/2-90,W/2+90,1500,1560,20,120],c:"#2f3337",n:"fuente 12 V 10 A",id});
  }
  return P;
}


/* Horno Electrolux OE8EH (manual: cuerpo 560 de ancho y 550 de fondo; frente ~595 × 595). No es pieza del mueble. */
const H_ALTO=50, H_GROSOR=20;   // la "H" de madera bajo el horno: 5 cm de alto (grosor de las tablas supuesto)
function buildOven(){
  const cx=1585, P=[], y0=15+H_ALTO;   // el horno se apoya sobre la H
  const part=(b,c,n,id="__horno")=>P.push({b,c,n,id});
  part([cx-280,cx+280,y0,y0+580,30,580],"#33363b","cuerpo");
  part([cx-298,cx+298,y0,y0+596,580,602],"#121417","puerta");
  part([cx-298,cx+298,y0+521,y0+596,602,604],"#a7acb1","panel");
  part([cx-250,cx+250,y0+490,y0+502,604,632],"#c3c7cb","manija");
  part([cx-262,cx-232,y0+540,y0+570,604,618],"#d6d9dc","perilla"); part([cx+232,cx+262,y0+540,y0+570,604,618],"#d6d9dc","perilla");
  part([cx-60,cx+60,y0+545,y0+565,604,606],"#0b0c0e","reloj");
  // H: tabla al frente (cierra como un zócalo) y tabla atrás, de listón a listón, unidas por una al medio
  const wood="#b98b55", x0=1275, x1=1895, T=H_GROSOR;
  // frente: tira de melamina TIVOLI 618 × 50 × 15 (se pide en Madecentro), al ras del mueble
  part([x0+1,x1-1,15,15+H_ALTO,565,580],"#f1e9da","frente melamina","__h");
  part([x0+1,x1-1,15,15+H_ALTO,30,30+T],wood,"atrás","__h");
  part([cx-T/2,cx+T/2,15,15+H_ALTO,30+T,565],wood,"centro","__h");
  return P;
}
// Toma sugerida según el manual: fuera del nicho y encima del mesón; cable por detrás del mueble (que no tiene fondo).
// Gas según el manual (fig. 7, posición A recomendada): registro fuera del nicho, a 350–700 del piso y a ≤1150 del centro del horno.
// Como el hueco tiene menos de 650 de fondo, va un codo de 90° en la entrada del horno.
function buildGas(){
  const P=[], part=(b,c,n)=>P.push({b,c,n,id:"__gas"});
  const steel="#8f969d", brass="#b08d3c";
  part([1570,1600,575,605,10,30],brass,"codo");
  part([1580,1590,580,590,-12,10],steel,"manguera");
  part([1580,2060,580,590,-12,-2],steel,"manguera");
  part([2050,2060,520,590,-12,-2],steel,"manguera");
  part([2035,2075,480,525,-16,-4],brass,"registro");
  part([2045,2105,500,512,-4,4],"#e3b100","manija del registro");
  return P;
}
function buildElec(){
  const P=[], part=(b,c,n)=>P.push({b,c,n,id:"__elec"});
  part([1665,1735,1000,1115,-12,-2],"#f2f2f2","toma");
  part([1688,1712,1030,1085,-2,6],"#3a3a3a","enchufe");
  part([1746,1754,350,1030,-14,-6],"#202020","cable");
  part([1712,1754,1022,1030,-14,-2],"#202020","cable");
  part([1746,1754,346,354,-14,30],"#202020","cable");
  return P;
}
// Herrajes del armario que no son piezas de madera: tubos de colgar y patas de 6 cm.
function buildArmHw(){
  const P=[], part=(b,c,n)=>P.push({b,c,n,id:"__herraje"}), Y=60, steel="#9aa0a6";
  part([20,441.3,1888+Y,1912+Y,245,269],steel,"tubo");              // izquierdo, bajo la repisa de arriba
  part([466.3,1333.7,1180+Y,1204+Y,245,269],steel,"tubo");          // central
  for(const x of [25,880,1735,2010]) for(const z of [25,435]) part([x,x+40,0,Y,z,z+40],"#2b2b2b","pata");
  return P;
}
