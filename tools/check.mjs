// Revisión automática del modelo: node tools/check.mjs
// 1) sintaxis de js/*.js  2) cantidades y medidas del 3D contra el catálogo  3) choques entre piezas
// 4) camas: abierta/cerrada, recorrido de mecanismos y del escritorio  5) que no haya datos personales en el repo
import { readFileSync, readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let fails = 0;
const fail = (...a) => { fails++; console.log("  ✗", ...a); };
const ok = (msg) => console.log("  ✓", msg);

console.log("1. Sintaxis");
for (const f of readdirSync(path.join(root, "js")).filter(f => f.endsWith(".js"))) {
  try { execFileSync(process.execPath, ["--check", path.join(root, "js", f)], { stdio: "pipe" }); }
  catch (e) { fail(f, String(e.stderr || e).split("\n").slice(0, 3).join(" ")); }
}
if (!fails) ok("js/*.js sin errores de sintaxis");

// Carga catálogo + modelo (sin DOM ni three.js) en un contexto aislado
const ctx = vm.createContext({ console, document: { querySelector: () => null }, localStorage: { getItem: () => null, setItem() {} } });
const src = ["catalogo.js", "modelo.js"].map(f => readFileSync(path.join(root, "js", f), "utf8")).join("\n")
  .replace(/^const /gm, "var ").replace(/^let /gm, "var ");
vm.runInContext(src + "\n;globalThis.__ = {P, MUEBLES, buildModel, CAMA_CFG, MECS, buildCamaHw, buildMec, buildDeskHw, bedClosedBox, deskClosedBox, deskDelta, BED_PIVOT};", ctx);
const { P, MUEBLES, buildModel, CAMA_CFG, MECS, buildCamaHw, buildMec, buildDeskHw, bedClosedBox, deskClosedBox, deskDelta, BED_PIVOT } = ctx.__;

const ov = (a, b) => { const d = [0, 2, 4].map(i => Math.min(a[i + 1], b[i + 1]) - Math.max(a[i], b[i])); return d.every(v => v > 0.5) ? d.map(v => Math.round(v)) : null; };
// Cruces que son a propósito
const FONDO = /fondo|-cbo$|-cio$|-cco$/;                     // fondos de 6 mm metidos en la ranura de su propio cajón
const okPair = (a, b) => (a.g && a.g === b.g && (FONDO.test(a.id) || FONDO.test(b.id))) || /respaldo/.test(a.id + b.id);
const okHw = (a, b) => /eje|perno|pasador|bisagra|poste|oreja/.test(a.id + b.id);   // herrajes que atraviesan o abrazan piezas

console.log("2. Cantidades y medidas del 3D contra el catálogo");
// Medidas que en el 3D no coinciden a propósito (cajeados de la cocina: el divisor y el listón se parten en 2 bloques)
const MEDIDA_OK = new Set(["c-divisor", "c-divref"]);
for (const m of MUEBLES) {
  const L = buildModel(m).filter(s => !s.sub), c = {};
  L.forEach(s => c[s.id] = (c[s.id] || 0) + 1);
  P.filter(x => x.m === m).forEach(x => { if ((c[x.id] || 0) !== x.q) fail(m, x.id, "en 3D", c[x.id] || 0, "≠ catálogo", x.q); });
  L.forEach(s => {
    if (MEDIDA_OK.has(s.id)) return;
    const x = P.find(p => p.id === s.id); if (!x) return fail(m, s.id, "no está en el catálogo");
    const dims = [s.b[1] - s.b[0], s.b[3] - s.b[2], s.b[5] - s.b[4]].sort((a, b) => b - a), want = [...(x.cut || x.d)].sort((a, b) => b - a);
    if (Math.max(...dims.map((v, i) => Math.abs(v - want[i]))) > 1) fail(m, s.id, "mide", dims.map(Math.round).join("×"), "y el catálogo dice", want.join("×"));
  });
}
if (!fails) ok("todas las piezas coinciden");

console.log("3. Choques (cocina, TV, armario: cerrado y con los cajones abiertos)");
let before = fails;
for (const m of ["cocina", "tv", "armario"]) {
  const L = buildModel(m);
  for (const open of [false, true]) {
    // con los cajones abiertos, las puertas también (en la app la puerta 4 del armario se abre sola con sus cajones)
    const B = L.filter(s => !(open && s.door)).map(s => { const b = [...s.b]; if (open && s.g) { b[4] += 380; b[5] += 380; } return { ...s, b }; });
    for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) {
      const o = ov(B[i].b, B[j].b); if (o && !okPair(B[i], B[j])) fail(m, open ? "abierto" : "cerrado", B[i].id, B[j].id, o.join("×"));
    }
  }
}
if (fails === before) ok("sin choques");

console.log("4. Camas: abierta, cerrada, mecanismos y escritorio");
before = fails;
const rot = (pt, a) => { const dy = pt.y - BED_PIVOT.y, dz = pt.z - BED_PIVOT.z; return { y: BED_PIVOT.y + dy * Math.cos(a) - dz * Math.sin(a), z: BED_PIVOT.z + dy * Math.sin(a) + dz * Math.cos(a) }; };
for (const m of Object.keys(CAMA_CFG)) {
  const L = buildModel(m), cf = CAMA_CFG[m];
  const hw = buildCamaHw(m).concat(MECS[m] ? buildMec(m) : [], cf.desk ? buildDeskHw() : []).filter(h => !h.k || h.k === "xcyl" || h.k === "sph");
  for (const closed of [false, true]) {
    const tr = s => closed ? (s.bed ? bedClosedBox(s.b) : s.desk ? deskClosedBox(s.b) : s.b) : s.b;
    const B = L.map(s => ({ id: s.id, g: s.g, b: tr(s) })).concat(hw.map(h => ({ id: "herraje:" + h.n, b: tr(h), hw: 1 })));
    for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) {
      if (B[i].hw && B[j].hw) continue; if (okHw(B[i], B[j])) continue;
      const o = ov(B[i].b, B[j].b); if (o) fail(m, closed ? "cerrada" : "abierta", B[i].id, B[j].id, o.join("×"));
    }
  }
  // recorrido del pistón/actuador: la línea A→Q no debe cruzar piezas en ningún ángulo
  const K = MECS[m];
  if (K) for (let d = 0; d <= 90; d += 5) {
    const a = -d * Math.PI / 180, q = rot(K.Q, a);
    for (let t = 0.05; t <= 0.95; t += 0.05) {
      const y = K.A.y + (q.y - K.A.y) * t, z = K.A.z + (q.z - K.A.z) * t;
      for (const s of L) {
        const p = s.bed ? rot({ y, z }, -a) : { y, z };
        if (K.xc > s.b[0] - 8 && K.xc < s.b[1] + 8 && p.y > s.b[2] && p.y < s.b[3] && p.z > s.b[4] && p.z < s.b[5]) { fail(m, "el mecanismo cruza", s.id, "a", d + "°"); d = 99; break; }
      }
    }
  }
  // escritorio: no toca la cama ni el colchón en todo el giro, con cosas de hasta 13 cm encima
  if (cf.desk) {
    const mat = { id: "colchón", bed: 1, b: [34 + cf.X, 1924 + cf.X, 261, 461, 15, 1419] };
    const inside = (s, a, x, y, z) => { if (s.bed) { const q = rot({ y, z }, -a); return x > s.b[0] && x < s.b[1] && q.y > s.b[2] && q.y < s.b[3] && q.z > s.b[4] && q.z < s.b[5]; } return x > s.b[0] && x < s.b[1] && y > s.b[2] && y < s.b[3] && z > s.b[4] && z < s.b[5]; };
    const others = L.filter(s => !s.desk).concat([mat]), top = L.find(s => s.id === cf.pre + "esc");
    let hit = null;
    for (let d = 0; d <= 90 && !hit; d += 5) {
      const a = -d * Math.PI / 180, dd = deskDelta(a);
      for (const s of L.filter(s => s.desk)) { const b = [s.b[0], s.b[1], s.b[2] + dd.y, s.b[3] + dd.y, s.b[4] + dd.z, s.b[5] + dd.z];
        for (let x = b[0] + 2; x < b[1] && !hit; x += 60) for (let y = b[2] + 2; y < b[3] && !hit; y += 8) for (let z = b[4] + 2; z < b[5] && !hit; z += 20)
          for (const o of others) if (inside(o, a, x, y, z)) { hit = [d, s.id, o.id]; break; } }
      const b = [top.b[0], top.b[1], top.b[2] + dd.y, top.b[3] + dd.y, top.b[4] + dd.z, top.b[5] + dd.z];
      for (let x = b[0] + 30; x < b[1] - 30 && !hit; x += 80) for (let y = b[3] + 1; y < b[3] + 130 && !hit; y += 10) for (let z = b[4] + 5; z < b[5] && !hit; z += 25)
        for (const o of others) if (inside(o, a, x, y, z)) { hit = [d, "cosas de 13 cm", o.id]; break; }
    }
    if (hit) fail(m, "escritorio choca a", hit[0] + "°:", hit[1], "con", hit[2]);
  }
}
if (fails === before) ok("sin choques en ninguna posición");

console.log("5. Datos personales");
before = fails;
const walk = d => readdirSync(d).flatMap(f => { const p = path.join(d, f); if (f === ".git" || f === "node_modules") return []; return statSync(p).isDirectory() ? walk(p) : [p]; });
for (const f of walk(root).filter(f => /\.(html|js|css|md|json|yml|mjs)$/.test(f))) {
  const t = readFileSync(f, "utf8");
  const cel = t.match(/(?<![\d.])3[0-2]\d{8}(?!\d)/);               // celular colombiano
  const mail = (t.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}\b/gi) || []).filter(e => !/noreply|anthropic\.com|users\.noreply\.github/.test(e));
  if (cel) fail(path.relative(root, f), "parece tener un número de celular:", cel[0].slice(0, 3) + "…");
  if (mail.length) fail(path.relative(root, f), "tiene correos:", mail.join(", "));
}
if (fails === before) ok("sin celulares ni correos en el código");

console.log("6. Caché");
try { execFileSync(process.execPath, [path.join(root, "tools", "sellar.mjs"), "--check"], { stdio: "pipe" }); ok("index.html sellado (?v= al día)"); }
catch { fail("index.html no está sellado: corre node tools/sellar.mjs"); }

console.log(fails ? `\n${fails} problema(s).` : "\nTodo bien.");
process.exit(fails ? 1 : 0);
