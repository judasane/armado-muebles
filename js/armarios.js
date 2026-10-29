/* Propuestas de armario con los cajones en una sola columna (diseños). Misma pared que el armario: 1,80 × 2,17 × 0,50 m
   sobre patas de 6 cm, con la columna lateral del espejo a la derecha. La geometría sale de la lista de zonas y el despiece
   se deriva de la geometría (así el 3D y la lista de piezas no pueden quedar distintos).
   Zonas: H1 = colgador de abrigos (tubo alto, caída larga, zapatera), H2 = colgador doble (2 tubos), D = columna de cajones. */
const ARM_V = {
  armc:{pre:"xc-", zonas:[{k:"H1",w:433},{k:"H2",w:532.2},{k:"D",w:500,n:7}]},
  arma:{pre:"xa-", zonas:[{k:"H1",w:432.6},{k:"D",w:600,n:6},{k:"H2",w:432.6}]},
};
const ZONA_N = {H1:"del colgador de abrigos", H2:"del colgador doble", D:"de la columna de cajones"};
const ARM_FH = 205, ARM_GAP = 3;          // frente de cajón y luz entre frentes
const ARM_RIEL = 12.7;                    // riel telescópico por lado

function armVSpecs(m){
  const V=ARM_V[m], Y=60, L=[];
  const A=(id,b,o={})=>L.push({id:V.pre+id, b:[b[0],b[1],b[2]+Y,b[3]+Y,b[4],b[5]], approx:1, ...o});
  A("lat",[0,15,0,2170,0,500],{zone:"est"});
  A("techo",[15,1785,2155,2170,0,500],{zone:"est"}); A("piso",[15,1785,0,15,0,500],{zone:"est"});
  // zonas de izquierda a derecha, cada una seguida de una división de piso a techo
  let x=15; const Z=V.zonas.map(z=>{ const r={...z, x0:x, x1:x+z.w}; x+=z.w; A("div",[x,x+15,15,2155,0,500],{zone:"est"}); x+=15; return r; });
  const xk=[x,1785];                      // columna lateral (por dentro)
  const mid=i=>Z[i].x1+7.5;               // centro de la división que sigue a la zona i
  Z.forEach((z,i)=>{
    const zone=z.k.toLowerCase(), fx0=i===0?0:mid(i-1)+1.5, fx1=mid(i)-1.5, hinge=i===0?"L":"R", door=V.pre+"p"+i;
    A("ref-"+z.k,[z.x0,z.x1,2065,2155,0,15],{zone}); A("ref-"+z.k,[z.x0,z.x1,15,105,0,15],{zone});
    if(z.k==="H1"){ A("ent-H1",[z.x0,z.x1,1985,2000,15,500],{zone}); A("ent-H1",[z.x0,z.x1,150,165,15,500],{zone}); }
    if(z.k==="H2") A("ent-H2",[z.x0,z.x1,1985,2000,15,500],{zone});
    if(z.k!=="D"){ A("puerta-"+z.k,[fx0,fx1,2,2169,500,515],{front:1,door,hinge,zone}); return; }
    // columna de cajones: todos iguales, frentes a la vista desde el piso
    const b0=z.x0+ARM_RIEL, b1=z.x1-ARM_RIEL;
    for(let j=0;j<z.n;j++){ const g=V.pre+"d"+j, fy=2+j*(ARM_FH+ARM_GAP), by=fy+18;   // la caja queda 3 mm sobre el piso del armario
      A("cl",[b0,b0+15,by,by+180,35,485],{g,zone}); A("cl",[b1-15,b1,by,by+180,35,485],{g,zone});
      A("ct",[b0+15,b1-15,by,by+180,35,50],{g,zone}); A("ct",[b0+15,b1-15,by,by+180,470,485],{g,zone});
      A("cf",[b0+15,b1-15,by,by+15,50,470],{g,zone});                       // fondo de 15 mm entre laterales y testeros
      A("frente",[fx0,fx1,fy,fy+ARM_FH,500,515],{g,front:1,zone}); }
    const top=2+z.n*(ARM_FH+ARM_GAP);       // donde terminan los frentes (+3 de luz)
    A("ent-D",[z.x0,z.x1,top-3,top+12,15,500],{zone}); A("ent-D",[z.x0,z.x1,Math.round((top+2155)/2),Math.round((top+2155)/2)+15,15,500],{zone});
    A("puerta-D",[fx0,fx1,top,2169,500,515],{front:1,door,hinge,zone});
  });
  // columna lateral: costado trasero (bisagras), repisas de 25 cm, puerta mirando a la derecha con espejo por dentro
  A("colc",[xk[0],xk[1],15,2155,0,15],{zone:"lat"});
  for(const y of [300,600,900,1200]) A("cole",[xk[0],xk[0]+250,y,y+15,15,500],{zone:"lat"});
  const pv={x:1800,z:1.5}, sd=V.pre+"p9";
  A("puertalat",[1785,1800,1.5,2168.5,1.5,498.5],{front:1,door:sd,side:1,pv,zone:"lat"});
  A("espejo",[1781,1785,335,1835,74,424],{front:1,door:sd,side:1,pv,zone:"lat"});
  A("panelfijo",[mid(Z.length-1)+1.5,1800,2,2169,500,515],{front:1,zone:"lat"});
  return L;
}
// herrajes: tubos (1 en abrigos, 2 en el doble), patas y ganchos de la columna lateral
function armVHw(m){
  const V=ARM_V[m], P=[], Y=60, steel="#9aa0a6", part=(b,c,n)=>P.push({b,c,n,id:"__herraje"});
  let x=15; const Z=V.zonas.map(z=>{ const r={...z,x0:x,x1:x+z.w}; x+=z.w+15; return r; });
  for(const z of Z){
    if(z.k==="H1") part([z.x0+5,z.x1-5,1890+Y,1914+Y,245,269],steel,"tubo de abrigos");
    if(z.k==="H2") for(const y of [1890,960]) part([z.x0+5,z.x1-5,y+Y,y+24+Y,245,269],steel,"tubo doble");
  }
  for(const px of [25,880,1735]) for(const z of [25,435]) part([px,px+40,0,Y,z,z+40],"#2b2b2b","pata");
  const hx=x, hook=(y,z,n)=>{ part([hx,hx+4,y+Y-18,y+Y+18,z-10,z+10],steel,n); part([hx+4,hx+72,y+Y-4,y+Y+4,z-4,z+4],steel,n); part([hx+64,hx+72,y+Y,y+Y+30,z-4,z+4],steel,n); };
  for(const z of [140,360]) hook(2020,z,"gancho para sombrero");
  for(const z of [110,250,390]) hook(1600,z,"gancho para bolso");
  return P;
}
// nombre y texto de cada pieza, según su id sin prefijo
function armVDef(id, m){
  const s=id.slice(ARM_V[m].pre.length), zk=s.split("-")[1], zn=ZONA_N[zk]||"";
  const D={
    lat:["Estructura","Lateral izquierdo","Costado izquierdo, de piso a techo, sobre las patas de 6 cm."],
    techo:["Estructura","Techo","Tapa de arriba, de lado a lado (también cubre la columna lateral)."],
    piso:["Estructura","Piso","Base de abajo, de lado a lado; debajo van las patas. Sin cajones abajo, los colgadores llegan hasta aquí."],
    div:["Estructura","División","Divisiones de piso a techo entre los colgadores, la columna de cajones y la columna lateral."],
    colc:["Columna lateral con espejo","Costado trasero de la columna","Tabla contra la pared al fondo de la columna lateral; por dentro lleva las bases de las 5 bisagras."],
    cole:["Columna lateral con espejo","Entrepaño de la columna","Repisas de 25 cm de fondo de la columna lateral, sobre pines. Arriba quedan los ganchos."],
    puertalat:["Columna lateral con espejo","Puerta lateral (espejo por dentro)","Puerta de piso a techo mirando a la derecha (reemplaza el lateral derecho). 5 bisagras de parche del lado de la pared; abre 90° hasta quedar contra la pared y el espejo mira al cuarto."],
    espejo:["Columna lateral con espejo","Espejo de la puerta lateral","Espejo de 150 × 35 cm y 4 mm por dentro de la puerta lateral. Vidriería, bordes pulidos, silicona neutra."],
    panelfijo:["Puertas","Panel fijo frontal","Tapa fija al frente de la columna lateral, del mismo Tivoli que las puertas y de piso a techo."],
    cl:["Cajones","Lateral de cajón","Costados de los cajones (riel de 45 cm). Todos los cajones son iguales."],
    ct:["Cajones","Testero / frente falso de cajón","Caras de atrás y adelante de la caja de cada cajón."],
    cf:["Cajones","Fondo de cajón","Piso de 15 mm de cada cajón, metido entre laterales y testeros y atornillado por los costados."],
    frente:["Cajones","Frente de cajón","Frentes Tivoli de la columna de cajones, todos iguales, con 3 mm de luz entre ellos. Push to open: sin manija."],
  }[s] || (s.startsWith("ref-")?["Refuerzos traseros","Refuerzo trasero "+zn,"Tiras traseras arriba y abajo, en lugar de fondo."]
        : s.startsWith("ent-")?["Entrepaños","Entrepaño "+zn, zk==="H1"?"Repisa de arriba (sobre el tubo) y zapatera baja del colgador de abrigos.":zk==="H2"?"Repisa de arriba del colgador doble.":"Tapa de la columna de cajones y repisa de arriba."]
        : s.startsWith("puerta-")?["Puertas", zk==="D"?"Puerta de arriba de los cajones":"Puerta "+zn, zk==="D"?"Puerta corta sobre la columna de cajones.":"Puerta de piso a techo (2,17 m): 5 bisagras."]
        : ["Otras", s, ""]);
  return {g:D[0], n:D[1], w:D[2]};
}
// despiece derivado: una entrada por id con sus medidas [largo, ancho, grosor] y cuántas hay
function armVPieces(m){
  const c={};
  for(const sp of armVSpecs(m)){ const dims=[sp.b[1]-sp.b[0], sp.b[3]-sp.b[2], sp.b[5]-sp.b[4]].map(v=>Math.round(v*10)/10).sort((a,b)=>b-a); (c[sp.id]=c[sp.id]||{dims,q:0}).q++; }
  return Object.entries(c).map(([id,{dims,q}])=>{ const d=armVDef(id,m);
    return {id, m, g:d.g, it:"—", n:d.n, d:dims, q, p:"A1", inf:1, var:1, w:d.w, ...(/espejo$/.test(id)?{vidrio:1}:{})}; });
}
