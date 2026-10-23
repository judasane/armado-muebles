// Pone en index.html un ?v=<huella> a cada css/js según su contenido, para que el navegador (y la caché de
// GitHub Pages) nunca mezcle archivos viejos con nuevos. Córrelo después de cambiar css/ o js/:
//   node tools/sellar.mjs          (escribe index.html)
//   node tools/sellar.mjs --check  (solo revisa; falla si falta sellar)
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "index.html");
const html = readFileSync(file, "utf8");
const sealed = html.replace(/(href|src)="((?:css|js)\/[\w-]+\.(?:css|js))(?:\?v=[\w]+)?"/g, (_, attr, f) => {
  const h = createHash("sha256").update(readFileSync(path.join(root, f))).digest("hex").slice(0, 10);
  return `${attr}="${f}?v=${h}"`;
});
if (process.argv.includes("--check")) {
  if (sealed !== html) { console.log("✗ index.html no está sellado: corre node tools/sellar.mjs"); process.exit(1); }
  console.log("✓ index.html sellado");
} else { writeFileSync(file, sealed); console.log("index.html sellado"); }
