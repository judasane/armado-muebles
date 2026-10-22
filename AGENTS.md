# AGENTS.md

Guía para personas y agentes que modifican este repo. Léela completa antes de cambiar código.

## Qué es

App de una página, en español de Colombia, para armar muebles de melamina (Madecentro) y diseñar variantes. La usa una persona **daltónica**, casi siempre desde el celular, en medio del armado. Sin compilación, sin dependencias de npm, sin backend.

## Reglas que no se rompen

1. **Daltonismo:** nada puede distinguirse solo por el color. Cada estado o categoría lleva ícono, palabra, patrón (rayas, puntos) o una diferencia clara de luminancia. Estados con forma: `○ ◐ ●`, `✓ ! ✕`. Los acentos son azul y ámbar.
2. **Sin datos personales.** Ni nombres de clientes, teléfonos, cédulas, direcciones ni correos, tampoco dentro de las imágenes de los planos (los membretes de Madecentro los traen: hay que taparlos antes de agregar una imagen). `tools/check.mjs` busca celulares y correos en el código; las imágenes hay que revisarlas a ojo.
3. **Funciona sin Claude.** `window.claude.use("sample")` (leer etiquetas con foto) y `window.claude.use("db")` (checklist compartido) solo existen dentro de claude.ai. Todo lo demás tiene que andar igual en GitHub Pages; el checklist cae a `localStorage` (siempre envuelto en `try/catch`).
4. **Sin paso de compilación.** Scripts clásicos (no módulos) que comparten el ámbito global; **el orden de `<script>` en `index.html` importa**: `catalogo → ui → modelo → visor3d → medidor → corte → arranque`. Una constante solo se puede usar al cargar si está en un archivo anterior; dentro de funciones da igual.
5. **Corre `node tools/check.mjs` antes de cada commit.** Debe terminar en "Todo bien.".

## Lenguaje

- Textos de la app: español de Colombia, cortos, de tú, concretos ("Toca una pieza…", "Quedan 3 mm").
- Términos del oficio en Colombia: bisagra **de parche** (cubre todo el canto), **de semiparche** (comparte división con la puerta del lado), **embutida** (dentro del hueco); **canto** (no "tapacanto"), **frente falso**, **testero**, **lastre/lastro**, **riel push to open**, **chazo**.
- Los nombres en el plano y en el sticker se respetan tal cual (`PLAN_NAMES`), aunque estén en portugués (kit Tecnomobili).

## Modelo de datos

### Piezas — `P` en `js/catalogo.js`

```js
{ id:"c-cj-frente", m:"cocina", g:"4 cajones", it:"1", n:"Frente de cajón",
  d:[427,199.8,15],      // largo, ancho, grosor en mm (como sale en el plano)
  cut:[485,360,15],      // opcional: medida real si se recortó después
  q:4,                   // cantidad
  p:3,                   // página del plano (número, "A1" armario, "B1" manual de la cama)
  ids:"12771 …",         // ID único de Madecentro o código del fabricante
  inf:1,                 // opcional: despiece inferido (no venía en el plano)
  vidrio:1,              // opcional: no es melamina (espejo): no entra en Corte ni en costos
  w:"Dónde va y cómo reconocerla…" }
```

- `id` lleva prefijo por mueble: `c-` cocina, `t-` TV, `a-` armario, `m-` cama del kit, `q-` `e-` `v-` `f-` variantes de la cama.
- Variantes de la cama: se derivan del kit en `CAMA_VAR` (y la de pistones está escrita a mano). Marcas: `same` = igual a la del kit, `nueva` = mandar a cortar, `recorte` = sale de una pieza que ya tienes. Las variantes **no** cuentan en el checklist ni en los contadores (`CHECK_M`), y sus piezas `same` no salen en la búsqueda por medidas (son las mismas del kit).
- `PLAN_NAMES[id] = [nombre en el plano, texto del sticker]`; `BUBBLES[página] = [[ítem, x%, y%], …]` marca el ítem en la imagen del plano.

### Geometría — `buildModel(m)` en `js/modelo.js`

Devuelve una lista de cajas `{ id, b:[x0,x1, y0,y1, z0,z1], … }` en **milímetros**:

- `x` = ancho, de izquierda a derecha mirando el mueble de frente.
- `y` = alto, desde el piso.
- `z` = profundidad, **desde la pared (0) hacia el cuarto**; los frentes quedan en las `z` más altas.

Banderas de cada caja: `g` (cajón al que pertenece: se mueve +z al abrir), `front` (frente o puerta), `door` + `hinge:"L"|"R"` (puerta y lado de la bisagra), `side:1` + `pv:{x,z}` (puerta lateral: gira 90° sobre un eje vertical en `pv`, como la del espejo del armario), `zone`, `sub:1` (trozo extra de una pieza con cajeado: no cuenta como pieza), `approx:1`.

**Camas:** las piezas con `bed:1` se modelan con la cama **abierta** (acostada); cerrada = girada −90° sobre el eje `BED_PIVOT` (`y 296, z 270`). `bedClosedBox()` da la caja cerrada. Las piezas con `desk:1` (escritorio) no giran: se trasladan igual que el pasador `DESK.H` (paralelogramo), con `deskDelta(ángulo)`.

- `CAMA_CFG[m]`: prefijo, ancho del casco `W`, corrimiento `X` de la cama, `vert` (vertical), `desk`.
- `MECS[m]`: mecanismo por lado. `A` es el punto fijo en el lateral y `Q` el punto en la cama abierta; `kind:"gas"|"act"`, fuerza, largos.
- Conjuntos: `AREAS[m] = [{ k, n, t: spec => boolean, drawer? }]`.

Las funciones de `buildOven/buildElec/buildGas/buildArmHw/buildCamaHw/buildMec/buildDeskHw` arman herrajes y electrodomésticos (no son piezas del despiece; su `id` empieza por `__`).

### Visor — `js/visor3d.js`

- `S = 0.001` (mm → m). Cada mesh guarda en `userData` la caja original, el color y las banderas.
- Estado: `V3` (mueble, selección, conjunto, ocultas, `pos[k]` 0–1 de cada puerta/cajón/cama, `bedA` ángulo animado).
- `step3D()` corre en cada cuadro: puertas giran, cajones salen, la cama gira sobre su eje, el escritorio se traslada y pistones/actuadores (`k:"seg"`) se recalculan entre `A` y `Q`.

## Reglas de diseño (para muebles nuevos o cambios)

- **Holguras:** 3 mm entre frentes y puertas (mínimo 2). Con canto rígido de 2 mm cuenta que cada frente crece 1–2 mm.
- **Cajones:** caja = hueco − 25,4 mm (riel de 12,7 mm por lado).
- **Corte:** disco de 4 mm y refilado de 10 mm por lado. Madecentro no corta piezas menores de 20 × 20 cm ni tiras de 7 cm de menos de 50 cm. Tableros de 2,15 × 2,44 m.
- **Fuerzas en MDP de 15 mm:** nunca colgar un herraje de un solo perno. Platina por dentro y contraplaca por fuera con pernos pasantes, y escuadras que repartan la carga en varias piezas.
- La revisión de la pestaña Corte (`reviewDesign`) aplica estas reglas: si agregas un mueble, revísala.

## Cómo agregar un mueble

1. Piezas en `P` (`js/catalogo.js`) con prefijo nuevo; nombres en `PLAN_NAMES`; imagen del plano en `assets/planos/` (**sin datos personales**) y su ruta en `ASSETS`.
2. Agregarlo a `MUEBLE`, `SHORT`, `ICON`, `MUEBLES` y los botones de mueble en `index.html` (3D, Despiece, Corte, Planos).
3. Etiqueta visual nueva en `css/app.css` (`.mtag.<m>`) con un patrón distinto, no solo otro color.
4. Geometría en `buildModel()` y conjuntos en `AREAS` (`js/modelo.js`); puertas en `DOORS` y colores en `WOOD` (`js/visor3d.js`).
5. `node tools/check.mjs`: cantidades y medidas del 3D tienen que coincidir con el catálogo y no puede haber choques.
6. Probar en el navegador, también a 375 px de ancho: abrir/cerrar todo, ocultar conjuntos, medir y revisar la pestaña Corte.

## Verificar un cambio

```bash
node tools/check.mjs
python3 -m http.server 8000     # abre http://localhost:8000, revisa la consola y recorre las pestañas
```

`tools/check.mjs` revisa: sintaxis, que cada pieza del 3D exista en el catálogo con su cantidad y medida, que no haya piezas que se crucen (cerrado y con cajones abiertos), que las camas no choquen ni abiertas ni cerradas, que pistones y actuadores no atraviesen piezas en todo el giro, que el escritorio no toque la cama con cosas de 13 cm encima, y que no haya celulares ni correos en el código. Los cruces que son a propósito (fondos en su ranura, herrajes que atraviesan piezas, cajeados de la cocina) están listados en el script.

## Publicar

- **GitHub Pages:** push a `main` y queda en https://judasane.github.io/armado-muebles/.
- **claude.ai (Artifact):** `node tools/empaquetar.mjs` genera `dist/armado-muebles.html` con todo adentro; ese archivo es el que se publica como Artifact (allí sí funcionan la foto y el checklist compartido).

## Lo que es aproximado

- Despiece del armario: inferido de los planos generales.
- Posición del eje de la cama: medida sobre el dibujo del manual (~30 cm del piso, ~6 cm del frente).
- Repartición de la repisa bajo la cama, grosor máximo del colchón (~20 cm) y el peso supuesto (cama + colchón ≈ 73 kg).
- Mecanismos de las variantes: diseño propio, calculado para esa geometría.
