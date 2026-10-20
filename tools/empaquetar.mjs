// Junta la app en UN solo HTML (CSS, JS e imágenes adentro), para publicarla como Artifact en claude.ai,
// donde la lectura de etiquetas con foto y el checklist compartido sí funcionan.
//   node tools/empaquetar.mjs   →   dist/armado-muebles.html
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = f => readFileSync(path.join(root, f), "utf8");
const dataUri = f => "data:image/jpeg;base64," + readFileSync(path.join(root, f)).toString("base64");

let html = read("index.html");
html = html.replace('<link rel="stylesheet" href="css/app.css">', () => `<style>\n${read("css/app.css")}</style>`);
html = html.replace(/<script src="(js\/[\w-]+\.js)"><\/script>/g, (_, f) => {
  let js = read(f);
  if (f === "js/catalogo.js") js = js.replace(/"(assets\/planos\/[\w-]+\.jpg)"/g, (_, img) => JSON.stringify(dataUri(img)));
  return `<script>\n${js.replace(/<\/script/gi, "<\\/script")}</script>`;
});
mkdirSync(path.join(root, "dist"), { recursive: true });
writeFileSync(path.join(root, "dist", "armado-muebles.html"), html);
console.log("dist/armado-muebles.html", (Buffer.byteLength(html) / 1e6).toFixed(2), "MB");
