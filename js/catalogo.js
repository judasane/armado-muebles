/* Catálogo: imágenes de planos, burbujas, piezas (P), nombres en plano, variantes de la cama y utilidades. */
const ASSETS = {
 "pages": {
  "1": "assets/planos/plano-1.jpg",
  "2": "assets/planos/plano-2.jpg",
  "3": "assets/planos/plano-3.jpg",
  "5": "assets/planos/plano-5.jpg",
  "7": "assets/planos/plano-7.jpg",
  "8": "assets/planos/plano-8.jpg",
  "9": "assets/planos/plano-9.jpg",
  "10": "assets/planos/plano-10.jpg",
  "A1": "assets/planos/plano-A1.jpg",
  "A2": "assets/planos/plano-A2.jpg",
  "B1": "assets/planos/plano-B1.jpg",
  "B2": "assets/planos/plano-B2.jpg",
  "B3": "assets/planos/plano-B3.jpg",
  "B4": "assets/planos/plano-B4.jpg",
  "B5": "assets/planos/plano-B5.jpg",
  "B6": "assets/planos/plano-B6.jpg"
 },
 "heroes": {
  "cocina": "assets/planos/vista-cocina.jpg",
  "tv": "assets/planos/vista-tv.jpg",
  "armario": "assets/planos/vista-armario.jpg",
  "cama": "assets/planos/vista-cama.jpg",
  "cama2": "assets/planos/vista-cama.jpg"
 }
};
const BUBBLES = {"1": [["3", 8.05, 44.88], ["11", 18.84, 44.88], ["8", 26.88, 38.23], ["7", 29.5, 23.9], ["5", 32.74, 53.55], ["6", 31.9, 31.66], ["8", 36.99, 38.71], ["10", 40.43, 43.98], ["9", 44.98, 29.08], ["2", 49.81, 35.11], ["1", 50.88, 24.36], ["10", 53.85, 39.96], ["10", 54.66, 39.12], ["4", 83.76, 83.02]], "2": [["6", 22.29, 51.49], ["2", 22.72, 29.44], ["1", 28.85, 41.27], ["4", 32.98, 35.49], ["5", 37.14, 28.19], ["3", 43.27, 40.03], ["6", 59.41, 81.95], ["2", 56.64, 72.38], ["1", 62.93, 74.35]], "3": [["3", 22.85, 69.33], ["3", 22.85, 39.96], ["3", 22.85, 57.42], ["8", 22.85, 24.77], ["5", 27.19, 71.07], ["5", 27.71, 26.78], ["5", 28.03, 42.16], ["5", 27.91, 59.42], ["1", 32.62, 66.47], ["1", 31.03, 36.42], ["1", 31.03, 53.89], ["6", 31.03, 21.22], ["4", 32.62, 72.78], ["4", 32.62, 43.41], ["4", 32.62, 60.89], ["9", 32.62, 28.21], ["1", 69.31, 86.27], ["1", 69.31, 74.17], ["1", 69.31, 78.2], ["1", 69.31, 82.23]], "5": [["3", 23.15, 34.68], ["6", 25.81, 55.3], ["2", 30.8, 45.89], ["5", 35.1, 39.5], ["1", 39.41, 30.35], ["4", 47.05, 41.56]], "7": [["2", 13.57, 52.42], ["2", 25.14, 50.16], ["2", 35.1, 48.23], ["1", 41.1, 50.75], ["2", 45.05, 46.31], ["2", 55.02, 44.38], ["2", 64.98, 42.44]], "8": [["2", 11.46, 48.69], ["1", 26.1, 44.0], ["6", 33.34, 45.51], ["4", 37.09, 56.43], ["4", 37.09, 30.87], ["1", 40.04, 41.56], ["5", 62.97, 78.36], ["1", 55.49, 40.19], ["3", 62.71, 38.59]], "9": [["2", 19.91, 65.22], ["2", 19.91, 30.73], ["2", 20.92, 46.52], ["4", 27.29, 67.48], ["4", 27.79, 34.14], ["4", 27.48, 51.37], ["1", 30.66, 64.25], ["1", 30.66, 29.75], ["1", 30.66, 47.0], ["3", 35.05, 72.01], ["3", 35.05, 37.51], ["3", 35.05, 54.76], ["2", 66.13, 86.61], ["2", 66.13, 77.94], ["2", 66.13, 82.27], ["1", 79.59, 78.63], ["1", 83.37, 77.62]], "10": [["6", 23.89, 57.16], ["3", 26.2, 29.28], ["5", 35.73, 37.34], ["1", 38.34, 27.43], ["4", 45.75, 37.1], ["6", 73.7, 83.54]], "B1": [["01", 27.83, 86.45], ["02", 31.24, 85.23], ["03", 35.2, 86.19], ["02", 37.67, 86.44], ["02", 39.61, 85.22], ["05", 33.7, 82.98], ["06", 34.69, 76.36], ["07", 38.28, 79.27], ["07", 39.52, 74.47], ["08", 37.61, 72.06], ["08", 29.96, 79.38], ["09", 26.5, 74.34], ["09", 45.73, 78.67], ["10", 29.26, 57.6], ["11", 39.3, 57.13], ["12", 40.38, 54.0], ["13", 49.83, 57.77], ["14", 36.35, 51.26], ["14", 42.67, 52.24], ["15", 39.71, 48.63], ["16", 39.38, 51.11]]};
const PAGES = ASSETS.pages, HEROES = ASSETS.heroes;
const MUEBLE = {cocina:"Mueble Cocina", tv:"Mueble TV", armario:"Armario", cama:"Cama abatible", cama2:"Cama con pistones", cama3:"Cama eléctrica", cama4:"Cama vertical", cama5:"Cama con escritorio"};
const SHORT = {cocina:"Cocina", tv:"TV", armario:"Armario", cama:"Cama", cama2:"Cama + pistones", cama3:"Cama eléctrica", cama4:"Cama vertical", cama5:"Cama + escritorio"};
const ICON = {cocina:"i-pot", tv:"i-tv", armario:"i-ward", cama:"i-bed", cama2:"i-bed", cama3:"i-bed", cama4:"i-bed", cama5:"i-bed"};
const MUEBLES = ["cocina","tv","armario","cama","cama2","cama3","cama4","cama5"];
const CHECK_M = MUEBLES.filter(m=>!/^cama[2-5]$/.test(m));   // las variantes de la cama son diseños: no entran en el conteo
const INF_NOTE = "Despiece inferido de los planos generales (Madecentro no incluyó tabla de piezas): confirma con la etiqueta.";
const PAGE_TITLE = {B1:"Lista de piezas y vista explotada",B2:"Paso 1: tarugos y minifix",B3:"Pasos 2–5: repisa y base de la cama",B4:"Pasos 6–9: marco de la cama y mueble",B5:"Pasos 10–12: tapa, trasera y eje de la cama",B6:"Pasos 13–14: cerraduras, deslizadores y uso",A1:"Planos generales (medidas)",A2:"Planos generales (puertas y cajones)",1:"Estructura del mueble",2:"Cajón grande y puertas",3:"4 cajones de la columna",5:"Cajón bajo (encima del horno)",7:"Zócalo",8:"Estructura del mueble",9:"3 cajones, frentes y puertas",10:"Cajón grande del centro"};
// d = [largo, ancho, grosor] mm · it = ítem en el plano · q = cantidad · p = página del PDF
const P = [
 {id:"c-base",m:"cocina",g:"Estructura",it:"5",n:"Base",d:[1940,580,15],q:1,p:1,w:"El piso del mueble: la pieza horizontal más larga, va abajo de punta a punta. Tiene ranura de 6 mm para el fondo."},
 {id:"c-compbase",m:"cocina",g:"Estructura",it:"11",n:"Entrepaño módulo izquierdo (Comp Base)",d:[800,570,15],q:1,p:1,w:"Estante horizontal del módulo izquierdo. Divide ese hueco en dos alturas (375 arriba, 365 abajo)."},
 {id:"c-compref565",m:"cocina",g:"Estructura",it:"1",n:"Soporte de riel del cajón bajo (Comp Ref)",d:[565,95,15],q:1,p:1,w:"Listón horizontal arriba a la derecha (de atrás hacia adelante), encima de la repisa del horno y justo debajo del refuerzo frontal: sus 95 de alto llenan ese espacio. Ahí se atornilla el riel derecho del cajón bajo. En el plano, la cota de 635 llega hasta él."},
 {id:"c-compref660",m:"cocina",g:"Estructura",it:"2",n:"Listón trasero del horno (Comp Ref)",d:[660,80,15],q:1,p:1,w:"Listón vertical atrás a la derecha, de la base hasta la altura de la repisa. Ahí se atornilla por detrás el soporte de riel (ítem 1). Mismas medidas que los ítems 10."},
 {id:"c-divref",m:"cocina",g:"Estructura",it:"10",n:"Listón del hueco del horno (División Ref)",d:[660,80,15],q:3,p:1,w:"Listones verticales al frente del hueco del horno: uno contra el divisor y dos juntos a la derecha. Dejan el hueco de 620 de ancho (cota del plano). Llevan un cajeado de 15 × 80 arriba donde se apoya la repisa del horno."},
 {id:"c-divisor",m:"cocina",g:"Estructura",it:"8",n:"Divisor vertical",d:[835,580,15],q:2,p:1,w:"Paneles verticales grandes que separan el mueble en módulos. Llevan un cajeado de 15 × 80 arriba por donde pasan enteros los refuerzos de 1910. Mismas medidas que el lateral izquierdo."},
 {id:"c-latizq",m:"cocina",g:"Estructura",it:"3",n:"Lateral izquierdo",d:[835,580,15],q:1,p:1,w:"Costado izquierdo del mueble, de piso a tope. Tiene ranura de 6 mm."},
 {id:"c-latder",m:"cocina",g:"Estructura",it:"4",n:"Lateral derecho",d:[835,100,15],q:1,p:1,w:"Costado derecho: una franja de 10 cm al frente, de piso a tope, junto al hueco del horno."},
 {id:"c-entrepano",m:"cocina",g:"Estructura",it:"9",n:"Repisa del horno (Prateleira)",d:[665,559,15],q:1,p:1,w:"Repisa que cierra el hueco del horno por arriba: va de lado a lado del módulo (665) apoyada en el cajeado de los listones 10. Encima van el soporte de riel y el cajón bajo."},
 {id:"c-refuerzo",m:"cocina",g:"Estructura",it:"6 / 7",n:"Refuerzo superior / trasero",d:[1910,80,15],q:2,p:1,w:"Tablas enteras de 1910 × 80, paradas arriba del mueble de lateral a lateral: una al frente (6) y otra atrás (7). Pasan por el cajeado de los divisores. Son idénticas."},
 {id:"c-cg-fondo",m:"cocina",g:"Cajón grande",it:"4",n:"Fondo del cajón grande",d:[743,520,15],cut:[743,455,15],q:1,p:2,w:"Piso del cajón grande. Ojo: este fondo es de 15 mm, no de 6. Lo cortaste 65 mm (de 520 a 455) para que la caja mida 485 de fondo, por el tubo que pasa atrás."},
 {id:"c-cg-frtest",m:"cocina",g:"Cajón grande",it:"5",n:"Testero del cajón grande",d:[743,360,15],q:1,p:2,w:"Cara de atrás de la caja del cajón grande, entre los dos laterales. El plano también lista un frente falso igual, pero no viene: el frente visible se atornilla directo a la caja."},
 {id:"c-cg-lat",m:"cocina",g:"Cajón grande",it:"2 / 3",n:"Lateral del cajón grande",d:[550,360,15],cut:[485,360,15],q:2,p:2,w:"Costados del cajón grande (izq. y der. iguales). Aquí va el riel. Los cortaste de 550 a 485 por el tubo que pasa atrás: el riel debe ser de 45 cm o menos."},
 {id:"c-cg-panel",m:"cocina",g:"Cajón grande",it:"6",n:"Frente visible del cajón grande",d:[819,384,15],q:1,p:2,w:"La cara que se ve del cajón grande, abajo a la izquierda del mueble."},
 {id:"c-puerta1",m:"cocina",g:"Puertas",it:"1",n:"Puerta derecha (404,5)",d:[420.5,404.5,15],q:1,p:2,w:"La puerta de la derecha del par, encima del cajón grande. Se distingue por el ancho: 404,5 mm."},
 {id:"c-puerta2",m:"cocina",g:"Puertas",it:"2",n:"Puerta izquierda (412)",d:[420.5,412,15],q:1,p:2,w:"La puerta de la izquierda del par, encima del cajón grande. Ancho 412 mm (7,5 mm más que la otra)."},
 {id:"c-cj-fondo",m:"cocina",g:"4 cajones",it:"5",n:"Fondo de cajón",d:[532,370,6],q:4,p:3,w:"Piso delgado (6 mm) de cada uno de los 4 cajones de la columna. Entra en la ranura de los laterales."},
 {id:"c-cj-ft180",m:"cocina",g:"4 cajones",it:"1",n:"Testero de cajón (180)",d:[358,180,15],q:3,p:3,w:"Cara de atrás de los 3 cajones de 180 de alto. El plano también lista un frente falso igual, pero no viene: el frente visible se atornilla directo a la caja."},
 {id:"c-cj-ft150",m:"cocina",g:"4 cajones",it:"6",n:"Testero de cajón (150)",d:[358,150,15],q:1,p:3,w:"Cara de atrás del cajón más bajito (150 de alto). El plano también lista un frente falso igual, pero no viene: el frente visible se atornilla directo a la caja."},
 {id:"c-cj-lat180",m:"cocina",g:"4 cajones",it:"3 / 4",n:"Lateral de cajón (180)",d:[550,180,15],q:6,p:3,w:"Costados de los 3 cajones de 180 de alto (izq. y der. iguales). Llevan el riel."},
 {id:"c-cj-lat150",m:"cocina",g:"4 cajones",it:"8 / 9",n:"Lateral de cajón (150)",d:[550,150,15],q:2,p:3,w:"Costados del cajón más bajito (150 de alto)."},
 {id:"c-cj-frente",m:"cocina",g:"4 cajones",it:"1",n:"Frente de cajón",d:[427,199.8,15],q:4,p:3,w:"La cara visible de cada uno de los 4 cajones de la columna."},
 {id:"c-cb-fondo",m:"cocina",g:"Cajón bajo",it:"5",n:"Fondo del cajón bajo",d:[590,532,6],q:1,p:5,ids:"13342",w:"Piso (6 mm) del cajón bajito de 608 × 550 × 90, el que va encima del hueco del horno."},
 {id:"c-cb-ft",m:"cocina",g:"Cajón bajo",it:"1 / 2",n:"Frente falso / Testero del cajón bajo",d:[578,90,15],q:2,p:5,ids:"13338 · 13339",w:"Cara de adelante (frente falso, ID 13339) y de atrás (testero, ID 13338) de la caja del cajón bajito. Son iguales: tiras de 9 cm. Al frente falso se le atornilla el frente visible."},
 {id:"c-cb-lat",m:"cocina",g:"Cajón bajo",it:"3 / 4",n:"Lateral del cajón bajo",d:[550,90,15],q:2,p:5,ids:"13340 · 13341",w:"Costados del cajón bajito (tiras de 55 × 9 cm). Llevan el riel."},
 {id:"c-cb-panel",m:"cocina",g:"Cajón bajo",it:"6",n:"Frente visible del cajón bajo",d:[684,133,15],q:1,p:5,ids:"12275",w:"La cara visible alargada del cajón bajito, arriba del hueco del horno."},
 {id:"t-zocalo",m:"tv",g:"Zócalo",it:"1",n:"Zócalo frontal",d:[2080,100,15],q:1,p:7,ids:"12518",w:"Rodapié: la tira larga de abajo, al frente, que levanta el mueble del piso."},
 {id:"t-zocalolat",m:"tv",g:"Zócalo",it:"2",n:"Zócalo lateral / travesaño",d:[435,100,15],q:6,p:7,ids:"12519 · 13184 …",w:"Tiras cortas del zócalo: van en los costados y como travesaños por debajo del mueble."},
 {id:"t-base",m:"tv",g:"Estructura",it:"4",n:"Base / tapa",d:[2080,450,15],q:2,p:8,ids:"12516 …",w:"Las dos piezas horizontales largas: el piso y el techo del mueble. Son iguales."},
 {id:"t-division",m:"tv",g:"Estructura",it:"1",n:"División vertical",d:[720,428,15],q:3,p:8,ids:"12512 …",w:"Paneles verticales internos que separan los módulos. 22 mm menos profundos que los laterales."},
 {id:"t-entrepano",m:"tv",g:"Estructura",it:"6",n:"Entrepaño fijo",d:[580,428,15],q:1,p:8,ids:"12525",w:"Estante horizontal del módulo del centro (deja 380 arriba y 325 abajo)."},
 {id:"t-lat",m:"tv",g:"Estructura",it:"2 / 3",n:"Lateral izquierdo / derecho",d:[720,450,15],q:2,p:8,ids:"12513 · 12514",w:"Costados exteriores del mueble TV. Tienen ranura de 6 mm."},
 {id:"t-respaldo",m:"tv",g:"Estructura",it:"5",n:"Respaldo",d:[890,734,6],q:1,p:8,ids:"12521",w:"Fondo trasero delgado (6 mm) que cierra la parte de atrás."},
 {id:"t-cj-fondo",m:"tv",g:"3 cajones",it:"4",n:"Fondo de cajón",d:[520,382,6],q:3,p:9,ids:"13040 · 13088 …",w:"Piso delgado (6 mm) de cada uno de los 3 cajones iguales de la izquierda."},
 {id:"t-cj-lat",m:"tv",g:"3 cajones",it:"2 / 3",n:"Lateral de cajón",d:[400,229,15],q:6,p:9,ids:"13038 · 13039 · 13086 · 13087 …",w:"Costados de los 3 cajones (izq. y der. iguales). Llevan el riel."},
 {id:"t-cj-test",m:"tv",g:"3 cajones",it:"1",n:"Testero de cajón",d:[508,229,15],q:3,p:9,ids:"13036 · 13084 …",w:"Cara de atrás de los 3 cajones."},
 {id:"t-cj-frente",m:"tv",g:"Frentes y puertas",it:"2",n:"Frente de cajón",d:[561,236.7,15],q:3,p:9,ids:"12771 …",w:"La cara visible de cada uno de los 3 cajones de la izquierda."},
 {id:"t-puerta",m:"tv",g:"Frentes y puertas",it:"1",n:"Puerta de despensa",d:[717,287,15],q:2,p:9,ids:"12708 · 12716",w:"Las dos puertas altas y angostas del lado derecho."},
 {id:"t-cg-fondo",m:"tv",g:"Cajón grande",it:"5",n:"Fondo del cajón grande",d:[535,382,6],q:1,p:10,ids:"13016",w:"Piso (6 mm) del cajón grande del módulo central (553 × 400 × 300)."},
 {id:"t-cg-ft",m:"tv",g:"Cajón grande",it:"1",n:"Testero del cajón grande",d:[523,300,15],q:1,p:10,ids:"13012",w:"Cara de atrás del cajón grande del centro. El plano también lista un frente falso igual, pero no viene: el frente visible se atornilla directo a la caja."},
 {id:"t-cg-lat",m:"tv",g:"Cajón grande",it:"3 / 4",n:"Lateral del cajón grande",d:[400,300,15],q:2,p:10,ids:"13014 · 13015",w:"Costados del cajón grande del centro. Llevan el riel."},
 {id:"t-cg-panel",m:"tv",g:"Cajón grande",it:"6",n:"Frente visible del cajón grande",d:[576,321,15],q:1,p:10,ids:"12734",w:"La cara visible del cajón grande, abajo en el módulo del centro."},
 {id:"a-lat",m:"armario",g:"Estructura",it:"—",n:"Lateral izquierdo",d:[2170, 500, 15],q:1,p:"A1",inf:1,w:"Costado izquierdo del armario, de piso a techo. Va sobre las patas de 6 cm."},
 {id:"a-latb",m:"armario",g:"Estructura",it:"—",n:"Lateral derecho bajo",d:[405, 500, 15],q:1,p:"A1",inf:1,w:"Lo que queda del lateral derecho: solo la parte de los cajones de abajo (405 de alto). Arriba de él va la puerta lateral del espejo."},
 {id:"a-techo",m:"armario",g:"Estructura",it:"—",n:"Techo",d:[1770, 500, 15],q:1,p:"A1",inf:1,w:"Tapa de arriba, entre los dos laterales."},
 {id:"a-piso",m:"armario",g:"Estructura",it:"—",n:"Piso",d:[1770, 500, 15],q:1,p:"A1",inf:1,w:"Base de abajo, entre los laterales; debajo van las patas."},
 {id:"a-medio",m:"armario",g:"Estructura",it:"—",n:"Entrepaño divisor",d:[1770, 500, 15],q:1,p:"A1",inf:1,w:"Tabla horizontal de lado a lado que separa la parte de cajones (abajo, 360–375) del closet (arriba, 1750)."},
 {id:"a-divs",m:"armario",g:"Estructura",it:"—",n:"División superior",d:[1750, 500, 15],q:3,p:"A1",inf:1,w:"Las 3 divisiones verticales del closet: dejan 339,7 · 785,8 · 339,7 de ancho y, a la derecha, la columna de 25 cm que se abre por el lado."},
 {id:"a-divi",m:"armario",g:"Estructura",it:"—",n:"División inferior",d:[375, 500, 15],q:2,p:"A1",inf:1,w:"Las dos divisiones de la parte baja: dejan 565 · 610 · 565, con 2 cajones en cada módulo."},
 {id:"a-reflat",m:"armario",g:"Refuerzos traseros",it:"—",n:"Refuerzo trasero módulo lateral",d:[339.7, 90, 15],q:4,p:"A2",inf:1,w:"\"Closet con refuerzos traseros\": tiras atrás, arriba y abajo de los módulos izquierdo y derecho, en lugar de fondo."},
 {id:"a-refcen",m:"armario",g:"Refuerzos traseros",it:"—",n:"Refuerzo trasero módulo central",d:[785.8, 90, 15],q:2,p:"A2",inf:1,w:"Tiras traseras arriba y abajo del módulo central de colgar."},
 {id:"a-refinl",m:"armario",g:"Refuerzos traseros",it:"—",n:"Refuerzo trasero inferior lateral",d:[565, 90, 15],q:2,p:"A2",inf:1,w:"Tira trasera de los módulos de cajones de abajo."},
 {id:"a-refinc",m:"armario",g:"Refuerzos traseros",it:"—",n:"Refuerzo trasero inferior central",d:[610, 90, 15],q:1,p:"A2",inf:1,w:"Tira trasera del módulo central de abajo, donde van los 2 cajones centrales."},
 {id:"a-ent",m:"armario",g:"Entrepaños",it:"—",n:"Entrepaño",d:[339.7, 485, 15],q:6,p:"A1",inf:1,w:"Repisas de los módulos izquierdo y derecho: 2 en el izquierdo (a 200 del techo y abajo del colgador) y 4 en el derecho (3 repisas y la tapa de los cajones)."},
 {id:"a-supl",m:"armario",g:"Cajones interiores",it:"—",n:"Suplemento para rieles",d:[566, 485, 15],q:2,p:"A1",inf:1,w:"Tablas a los lados de los 3 cajones interiores, para que los cajones salgan sin chocar con las bisagras de la puerta."},
 {id:"a-puerta1",m:"armario",g:"Puertas",it:"—",n:"Puerta izquierda",d:[1777, 360.7, 15],q:1,p:"A2",inf:1,w:"Puerta del módulo izquierdo (Tivoli claro, canto oscuro), de la tabla divisora al techo. 4 bisagras de parche sobre el lateral izquierdo."},
 {id:"a-puerta2",m:"armario",g:"Puertas",it:"—",n:"Puerta central",d:[1777, 397.4, 15],q:2,p:"A2",inf:1,w:"Las 2 puertas del módulo central de colgar. Cada una con 4 bisagras de semiparche, sobre la división de su lado; abren hacia los lados. 3 mm de luz entre ellas."},
 {id:"a-puerta4",m:"armario",g:"Puertas",it:"—",n:"Puerta derecha",d:[1777, 351.7, 15],q:1,p:"A2",inf:1,w:"Puerta del módulo de repisas y cajones interiores. 4 bisagras de semiparche sobre la división de la columna lateral."},
 {id:"a-panelfijo",m:"armario",g:"Puertas",it:"—",n:"Panel fijo frontal",d:[1777, 280.8, 15],q:1,p:"A2",inf:1,w:"Tapa fija al frente de la columna lateral (no abre: la columna se abre por el lado). Del mismo Tivoli y a la misma altura que las puertas, para que el frente se vea parejo. Se atornilla por dentro a la división y al techo."},
 {id:"a-cbf",m:"armario",g:"Cajones de abajo",it:"—",n:"Frente cajón de abajo (manija chaflán)",d:[593, 192, 15],q:4,p:"A2",inf:1,w:"Frentes Tivoli de los 4 cajones de abajo, con la manija en chaflán."},
 {id:"a-cbl",m:"armario",g:"Cajones de abajo",it:"—",n:"Lateral cajón de abajo",d:[450, 150, 15],q:12,p:"A1",inf:1,w:"Costados de los 6 cajones de abajo (riel de 45 cm). Son iguales en los tres módulos."},
 {id:"a-cbt",m:"armario",g:"Cajones de abajo",it:"—",n:"Testero / frente falso cajón de abajo",d:[509, 150, 15],q:8,p:"A1",inf:1,w:"Caras de atrás y adelante de la caja de los cajones de abajo."},
 {id:"a-cbo",m:"armario",g:"Cajones de abajo",it:"—",n:"Fondo cajón de abajo",d:[521, 432, 6],q:4,p:"A1",inf:1,w:"Piso de 6 mm de los cajones de abajo, en ranura."},
 {id:"a-ccf",m:"armario",g:"Cajones de abajo",it:"—",n:"Frente cajón central (manija chaflán)",d:[604,192,15],q:2,p:"A2",inf:1,w:"Frentes Tivoli de los 2 cajones que van en el hueco central de abajo (antes espacio chimenea). Van entre las divisiones, porque los frentes de los lados ya tapan los cantos."},
 {id:"a-cct",m:"armario",g:"Cajones de abajo",it:"—",n:"Testero / frente falso cajón central",d:[554.6,150,15],q:4,p:"A1",inf:1,w:"Caras de atrás y adelante de la caja de los 2 cajones centrales (hueco de 610 menos rieles)."},
 {id:"a-cco",m:"armario",g:"Cajones de abajo",it:"—",n:"Fondo cajón central",d:[566.6,432,6],q:2,p:"A1",inf:1,w:"Piso de 6 mm de los 2 cajones centrales, en ranura."},
 {id:"a-cif",m:"armario",g:"Cajones interiores",it:"—",n:"Frente cajón interior",d:[303.7, 185, 15],q:3,p:"A1",inf:1,w:"Frentes Tivoli de los 3 cajones dentro del módulo derecho, detrás de la puerta. Van embutidos entre los suplementos (hueco de 309,7), con 3 mm de luz a cada lado y entre cajones."},
 {id:"a-cil",m:"armario",g:"Cajones interiores",it:"—",n:"Lateral cajón interior",d:[450, 130, 15],q:6,p:"A1",inf:1,w:"Costados de los cajones interiores."},
 {id:"a-cit",m:"armario",g:"Cajones interiores",it:"—",n:"Testero / frente falso cajón interior",d:[254.3, 130, 15],q:6,p:"A1",inf:1,w:"Caras de atrás y adelante de la caja de los cajones interiores (caja de 284,3 = hueco − 2 rieles)."},
 {id:"a-cio",m:"armario",g:"Cajones interiores",it:"—",n:"Fondo cajón interior",d:[266.3, 432, 6],q:3,p:"A1",inf:1,w:"Piso de 6 mm de los cajones interiores."},
 {id:"a-colc",m:"armario",g:"Columna lateral con espejo",it:"—",n:"Costado trasero de la columna",d:[1750, 259.8, 15],q:1,p:"A1",inf:1,w:"Tabla contra la pared, al fondo de la columna lateral (de la tabla divisora al techo). Por dentro lleva las bases de las 4 bisagras de la puerta lateral."},
 {id:"a-cole",m:"armario",g:"Columna lateral con espejo",it:"—",n:"Entrepaño de la columna",d:[485, 250, 15],q:3,p:"A1",inf:1,w:"Las 3 repisas de 25 cm de fondo de la parte de abajo de la columna, cada ~25 cm, sobre pines para poder moverlas. Arriba quedan los ganchos para bolsos y sombreros. Quedan a 6 mm del espejo con la puerta cerrada."},
 {id:"a-puertalat",m:"armario",g:"Columna lateral con espejo",it:"—",n:"Puerta lateral (espejo por dentro)",d:[1762, 497, 15],q:1,p:"A2",inf:1,w:"Reemplaza la parte de arriba del lateral derecho: va de la tabla divisora al techo, mirando a la derecha. 4 bisagras de parche en el costado trasero de la columna (lado de la pared): abre 90° hasta quedar contra la pared y ahí el espejo queda mirando al cuarto."},
 {id:"a-mlx",m:"armario",g:"Columna lateral con espejo",it:"—",n:"Espejo de la puerta lateral",d:[1500,350,4],q:1,p:"A2",inf:1,vidrio:1,w:"Espejo de 150 × 35 cm y 4 mm, centrado por DENTRO de la puerta lateral. No es de Madecentro: se pide en una vidriería con los bordes pulidos y se pega con silicona neutra para espejos (la acética mancha el azogue)."},
 {id:"m-nest-izq",m:"cama",g:"Repisa bajo la cama",it:"01",n:"Estante nicho izquierdo",d:[800, 246, 15],q:1,p:"B1",ids:"208043",w:"Tabla vertical izquierda de la repisa que va pegada por debajo de la cama. Con la cama cerrada queda a la izquierda; con la cama abierta es una de las patas."},
 {id:"m-nest",m:"cama",g:"Repisa bajo la cama",it:"02",n:"Estante nicho",d:[584, 246, 15],q:3,p:"B1",ids:"238043",w:"Repisas cortas de la repisa bajo la cama: una en la columna izquierda y dos en la derecha."},
 {id:"m-nest-cen",m:"cama",g:"Repisa bajo la cama",it:"03",n:"Estante nicho central",d:[800, 246, 15],q:1,p:"B1",ids:"228043",w:"Tabla vertical del centro de la repisa bajo la cama: la divide en dos columnas."},
 {id:"m-nest-der",m:"cama",g:"Repisa bajo la cama",it:"04",n:"Estante nicho derecho",d:[800, 246, 15],q:1,p:"B1",ids:"218043",w:"Tabla vertical derecha de la repisa bajo la cama."},
 {id:"m-nlat",m:"cama",g:"Repisa bajo la cama",it:"05",n:"Lateral nicho",d:[1214, 246, 15],q:2,p:"B1",ids:"308043",w:"Las dos tablas largas que cierran la repisa bajo la cama, arriba y abajo cuando la cama está cerrada. Abierta, la repisa es la pata que apoya en el piso."},
 {id:"m-lastroc",m:"cama",g:"Cama",it:"06",n:"Lastre central (base de la cama)",d:[1890, 468, 15],q:1,p:"B1",ids:"618043",w:"La tabla del medio de la base del colchón. Se atornilla encima de la repisa (paso 4)."},
 {id:"m-lastrol",m:"cama",g:"Cama",it:"07",n:"Lastre lateral (base de la cama)",d:[1890, 468, 15],q:2,p:"B1",ids:"608043",w:"Las dos tablas de los lados de la base del colchón (paso 5). Junto con la central dan 1404 de ancho: colchón de 1,40 × 1,90."},
 {id:"m-barra",m:"cama",g:"Cama",it:"08",n:"Barra (larguero de la cama)",d:[1890, 100, 15],q:2,p:"B1",ids:"318043",w:"Bordes largos del marco de la cama (paso 7): sostienen el colchón por los lados."},
 {id:"m-cab",m:"cama",g:"Cama",it:"09",n:"Cabecera",d:[1436, 100, 15],q:2,p:"B1",ids:"718043",w:"Los dos extremos cortos del marco de la cama (paso 6). Por aquí pasa el eje (tornillo M8) que la une al mueble."},
 {id:"m-latizq",m:"cama",g:"Mueble (fijo)",it:"10",n:"Lateral izquierdo",d:[1690, 324, 15],q:1,p:"B1",ids:"338043",w:"Costado izquierdo del mueble. Lleva el agujero del eje de la cama y 2 deslizadores abajo."},
 {id:"m-reves",m:"cama",g:"Mueble (fijo)",it:"11",n:"Reverso (trasera)",d:[1928, 450, 15],q:1,p:"B1",ids:"408043",w:"Tabla trasera entre los laterales, justo debajo de la base superior: le da rigidez al mueble y la cama cerrada queda delante de ella."},
 {id:"m-base",m:"cama",g:"Mueble (fijo)",it:"12",n:"Base superior",d:[1928, 324, 15],q:1,p:"B1",ids:"108043",w:"Piso del nicho de arriba. Lleva las 2 cerraduras que traban la cama cerrada."},
 {id:"m-latder",m:"cama",g:"Mueble (fijo)",it:"13",n:"Lateral derecho",d:[1690, 324, 15],q:1,p:"B1",ids:"328043",w:"Costado derecho del mueble, igual al izquierdo pero en espejo."},
 {id:"m-div",m:"cama",g:"Mueble (fijo)",it:"14",n:"División del nicho",d:[324, 200, 15],q:2,p:"B1",ids:"508020",w:"Las dos separaciones del nicho de arriba: lo dejan en 3 huecos."},
 {id:"m-tampo",m:"cama",g:"Mueble (fijo)",it:"15",n:"Tapa",d:[1958, 324, 15],q:1,p:"B1",ids:"708043",w:"La tapa de arriba, de lado a lado (1958: cubre también los laterales). Va con minifix."},
 {id:"m-costasup",m:"cama",g:"Mueble (fijo)",it:"16",n:"Trasera del nicho (3 mm)",d:[1948, 220, 3],q:1,p:"B1",ids:"418020",w:"Fondo delgado de 3 mm del nicho de arriba, clavado por detrás con 34 puntillas (paso 11)."},
 {id:"q-nest-izq",m:"cama2",g:"Repisa bajo la cama",it:"01",n:"Estante nicho izquierdo",d:[800, 246, 15],q:1,p:"B1",ids:"208043",w:"Igual a la del kit. Tabla vertical izquierda de la repisa que va pegada por debajo de la cama. Con la cama cerrada queda a la izquierda; con la cama abierta es una de las patas.",same:"m-nest-izq"},
 {id:"q-nest",m:"cama2",g:"Repisa bajo la cama",it:"02",n:"Estante nicho",d:[584, 246, 15],q:3,p:"B1",ids:"238043",w:"Igual a la del kit. Repisas cortas de la repisa bajo la cama: una en la columna izquierda y dos en la derecha.",same:"m-nest"},
 {id:"q-nest-cen",m:"cama2",g:"Repisa bajo la cama",it:"03",n:"Estante nicho central",d:[800, 246, 15],q:1,p:"B1",ids:"228043",w:"Igual a la del kit. Tabla vertical del centro de la repisa bajo la cama: la divide en dos columnas.",same:"m-nest-cen"},
 {id:"q-nest-der",m:"cama2",g:"Repisa bajo la cama",it:"04",n:"Estante nicho derecho",d:[800, 246, 15],q:1,p:"B1",ids:"218043",w:"Igual a la del kit. Tabla vertical derecha de la repisa bajo la cama.",same:"m-nest-der"},
 {id:"q-nlat",m:"cama2",g:"Repisa bajo la cama",it:"05",n:"Lateral nicho",d:[1214, 246, 15],q:2,p:"B1",ids:"308043",w:"Igual a la del kit. Las dos tablas largas que cierran la repisa bajo la cama, arriba y abajo cuando la cama está cerrada. Abierta, la repisa es la pata que apoya en el piso.",same:"m-nlat"},
 {id:"q-lastroc",m:"cama2",g:"Cama",it:"06",n:"Lastre central (base de la cama)",d:[1890, 468, 15],q:1,p:"B1",ids:"618043",w:"Igual a la del kit. La tabla del medio de la base del colchón. Se atornilla encima de la repisa (paso 4).",same:"m-lastroc"},
 {id:"q-lastrol",m:"cama2",g:"Cama",it:"07",n:"Lastre lateral (base de la cama)",d:[1890, 468, 15],q:2,p:"B1",ids:"608043",w:"Igual a la del kit. Las dos tablas de los lados de la base del colchón (paso 5). Junto con la central dan 1404 de ancho: colchón de 1,40 × 1,90.",same:"m-lastrol"},
 {id:"q-barra",m:"cama2",g:"Cama",it:"08",n:"Barra (larguero de la cama)",d:[1890, 100, 15],q:2,p:"B1",ids:"318043",w:"Igual a la del kit. Bordes largos del marco de la cama (paso 7): sostienen el colchón por los lados.",same:"m-barra"},
 {id:"q-cab",m:"cama2",g:"Cama",it:"09",n:"Cabecera",d:[1436, 100, 15],q:2,p:"B1",ids:"718043",w:"Igual a la del kit. Los dos extremos cortos del marco de la cama (paso 6). Por aquí pasa el eje (tornillo M8) que la une al mueble.",same:"m-cab"},
 {id:"q-latizq",m:"cama2",g:"Mueble (fijo)",it:"10",n:"Lateral izquierdo",d:[1690, 324, 15],q:1,p:"B1",ids:"338043",w:"Igual a la del kit. Costado izquierdo del mueble. Lleva el agujero del eje de la cama y 2 deslizadores abajo.",same:"m-latizq"},
 {id:"q-reves",m:"cama2",g:"Mueble (fijo)",it:"11",n:"Reverso NUEVO (60 mm más largo)",d:[1988, 450, 15],q:1,p:"B1",ids:"nueva",w:"Reemplaza la pieza 11 del kit (1928). Canto en el borde de abajo, que se ve con la cama bajada.",nueva:1,orig:"m-reves"},
 {id:"q-base",m:"cama2",g:"Mueble (fijo)",it:"12",n:"Base superior NUEVA (60 mm más larga)",d:[1988, 324, 15],q:1,p:"B1",ids:"nueva",w:"Reemplaza la pieza 12 del kit (1928). Canto al frente. Las 2 cerraduras se marcan midiendo DESDE EL CENTRO, porque la cama queda centrada igual que antes.",nueva:1,orig:"m-base"},
 {id:"q-latder",m:"cama2",g:"Mueble (fijo)",it:"13",n:"Lateral derecho",d:[1690, 324, 15],q:1,p:"B1",ids:"328043",w:"Igual a la del kit. Costado derecho del mueble, igual al izquierdo pero en espejo.",same:"m-latder"},
 {id:"q-div",m:"cama2",g:"Mueble (fijo)",it:"14",n:"División del nicho",d:[324, 200, 15],q:2,p:"B1",ids:"508020",w:"Igual a la del kit. Las dos separaciones del nicho de arriba: lo dejan en 3 huecos.",same:"m-div"},
 {id:"q-tampo",m:"cama2",g:"Mueble (fijo)",it:"15",n:"Tapa NUEVA (60 mm más larga)",d:[2018, 324, 15],q:1,p:"B1",ids:"nueva",w:"Reemplaza la tapa 15 del kit (1958). Canto al frente y en los 2 extremos. Copia las perforaciones de la original: minifix a la misma distancia de cada punta.",nueva:1,orig:"m-tampo"},
 {id:"q-costasup",m:"cama2",g:"Mueble (fijo)",it:"16",n:"Trasera del nicho NUEVA (3 mm)",d:[2008, 220, 3],q:1,p:"B1",ids:"nueva",w:"Reemplaza la pieza 16 del kit (1948). Se clava por detrás como la original.",nueva:1,orig:"m-costasup"},
];
// Nombre exacto como sale en la tabla del plano, y cómo suele aparecer en el sticker (sin espacios, con un sufijo que puede variar: ej. "FondoD1")
const PLAN_NAMES = {
 "q-nest-izq":["Prateleira Nicho Esquerda","208043"], "q-nest":["Prateleira Nicho","238043"], "q-nest-cen":["Prateleira Nicho Central","228043"], "q-nest-der":["Prateleira Nicho Direita","218043"], "q-nlat":["Lateral Nicho","308043"], "q-lastroc":["Lastro Central","618043"], "q-lastrol":["Lastro Lateral","608043"], "q-barra":["Barra","318043"], "q-cab":["Cabeceira","718043"], "q-latizq":["Lateral Esquerda","338043"], "q-reves":["Costa (nueva, 1988 mm)",""], "q-base":["Base Superior (nueva, 1988 mm)",""], "q-latder":["Lateral Direita","328043"], "q-div":["Divisão","508020"], "q-tampo":["Tampo (nueva, 2018 mm)",""], "q-costasup":["Costa Superior (nueva, 2008 mm)",""],
 "m-nest-izq":["Prateleira Nicho Esquerda","208043"], "m-nest":["Prateleira Nicho","238043"], "m-nest-cen":["Prateleira Nicho Central","228043"], "m-nest-der":["Prateleira Nicho Direita","218043"], "m-nlat":["Lateral Nicho","308043"], "m-lastroc":["Lastro Central","618043"], "m-lastrol":["Lastro Lateral","608043"], "m-barra":["Barra","318043"], "m-cab":["Cabeceira","718043"], "m-latizq":["Lateral Esquerda","338043"], "m-reves":["Costa","408043"], "m-base":["Base Superior","108043"], "m-latder":["Lateral Direita","328043"], "m-div":["Divisão","508020"], "m-tampo":["Tampo","708043"], "m-costasup":["Costa Superior","418020"],
 "c-base":["Base RANUFO/6MM/1940","Base"], "c-compbase":["Comp Base","CompBase"], "c-compref565":["Comp Ref (565x15x95)","CompRef"],
 "c-compref660":["Comp Ref (660x15x80)","CompRef"], "c-divref":["División_Ref CAJACE1L/15*80/660","DivisionRef"],
 "c-divisor":["Divisor Ref_CAJACEF1L/15*80/835","DivisorRef"], "c-latizq":["Lat Izq RANUFO/6MM/835","LatIzq"], "c-latder":["Lat Der RANUFO/6MM/835","LatDer"],
 "c-entrepano":["Prateleira Móvel","Prateleira"], "c-refuerzo":["Refuerzo Superior / Refuerzo Trasero","RefuerzoSuperior / RefuerzoTrasero"],
 "c-cg-fondo":["Fondo (743x15x520)","Fondo"], "c-cg-frtest":["Testero (743x15x360)","Testero"], "c-cg-lat":["Lat Der / Lat Izq (550x15x360)","LatDer / LatIzq"],
 "c-cg-panel":["PanelCajon (384x15x819)","PanelCajon"], "c-puerta1":["Puerta Inferior Reta (404,5)","PuertaInferior"], "c-puerta2":["Puerta Inferior Reta (412)","PuertaInferior"],
 "c-cj-fondo":["Fondo (370x6x532)","Fondo"], "c-cj-ft180":["Testero RANUFO/6MM/358 (180)","Testero"], "c-cj-ft150":["Testero RANUFO/6MM/358 (150)","Testero"],
 "c-cj-lat180":["Lat Der / Lat Izq RANUFO/6MM/550 (180)","LatDer / LatIzq"], "c-cj-lat150":["Lat Der / Lat Izq RANUFO/6MM/550 (150)","LatDer / LatIzq"],
 "c-cj-frente":["Frente de Cajón Reta","FrenteCajon"], "c-cb-fondo":["Fondo (590x6x532)","Fondo"], "c-cb-ft":["Fr Falso RANUFO/6MM/578 / Testero RANUFO/6MM/578","FrFalso / Testero"],
 "c-cb-lat":["Lat Der / Lat Izq RANUFO/6MM/550 (90)","LatDer / LatIzq"], "c-cb-panel":["PanelCajon (133x15x684)","PanelCajon"],
 "t-zocalo":["Zócalo","Zocalo"], "t-zocalolat":["Zócalo Lateral","ZocaloLateral"], "t-base":["Base RANUFO/6MM/2080","Base"],
 "t-division":["División","Division"], "t-entrepano":["Entrepaño Fijo","EntrepanoFijo"], "t-lat":["Lat Der / Lat Izq RANUFO/6MM/720","LatDer / LatIzq"],
 "t-respaldo":["Respaldo","Respaldo"], "t-cj-fondo":["Fondo (520x6x382)","Fondo"], "t-cj-lat":["Lat Der / Lat Izq RANUFO/6MM/400 (229)","LatDer / LatIzq"],
 "t-cj-test":["Testero RANUFO/6MM/508","Testero"], "t-cj-frente":["Frente de Cajón Reta","FrenteCajon"], "t-puerta":["Puerta p/ Despensas Interna Reta","PuertaDespensa"],
 "t-cg-fondo":["Fondo (535x6x382)","Fondo"], "t-cg-ft":["Testero RANUFO/6MM/523","Testero"], "t-cg-lat":["Lat Der / Lat Izq RANUFO/6MM/400 (300)","LatDer / LatIzq"],
 "t-cg-panel":["PanelCajon (321x15x576)","PanelCajon"],
};
// Variantes de la cama (diseños): salen del kit. same = igual al kit · nueva = mandar a cortar · recorte = sale de una pieza que ya tienes.
const CAMA_VAR = {
  cama3:{pre:"e-", ch:{
    "m-tampo":{d:[2070,324,15], n:"Tapa NUEVA (112 mm más larga)", nueva:1, w:"Reemplaza la tapa 15 del kit (1958). Canto al frente y en los 2 extremos. Copia las perforaciones de la original: minifix a la misma distancia de cada punta."},
    "m-base":{d:[2040,324,15], n:"Base superior NUEVA (112 mm más larga)", nueva:1, w:"Reemplaza la pieza 12 del kit (1928). Canto al frente. Las cerraduras se pueden quitar: el actuador sostiene la cama."},
    "m-reves":{d:[2040,450,15], n:"Reverso NUEVO (112 mm más largo)", nueva:1, w:"Reemplaza la pieza 11 del kit (1928). Canto en el borde de abajo."},
    "m-costasup":{d:[2060,220,3], n:"Trasera del nicho NUEVA (3 mm)", nueva:1, w:"Reemplaza la pieza 16 del kit (1948). Se clava por detrás como la original."}}},
  cama4:{pre:"v-", ch:{
    "m-latizq":{d:[2165,324,15], n:"Lateral izquierdo NUEVO (2165 de alto)", nueva:1, w:"La cama vertical necesita laterales de 2165: los del kit (1690) no alcanzan y sobran. Lleva el agujero del eje a 29,6 cm del piso y 5,4 cm del frente, igual que el original."},
    "m-latder":{d:[2165,324,15], n:"Lateral derecho NUEVO (2165 de alto)", nueva:1, w:"Igual al izquierdo, en espejo."},
    "m-tampo":{d:[1534,324,15], n:"Tapa (la del kit recortada a 1534)", recorte:1, w:"Sale de la tapa del kit (1958): se corta a 1534 y se rehacen los minifix en las puntas."},
    "m-base":{d:[1504,324,15], n:"Base superior (la del kit recortada a 1504)", recorte:1, w:"Sale de la pieza 12 del kit (1928). Va encima de la cama cerrada; las cerraduras quedan a ~30 cm de cada punta."},
    "m-reves":{d:[1504,450,15], n:"Reverso (el del kit recortado a 1504)", recorte:1, w:"Sale de la pieza 11 del kit (1928). Va arriba, debajo de la base superior, y sirve para anclar a la pared."},
    "m-costasup":{d:[1524,220,3], n:"Trasera del nicho (la del kit recortada a 1524)", recorte:1, w:"Sale de la pieza 16 del kit."},
    "m-barra":{w:"Igual a la del kit. En la vertical son los lados largos de la cama: por ellas pasa el eje, cerca del pie."},
    "m-cab":{w:"Igual a la del kit. En la vertical quedan arriba y abajo de la cama."}}}
};
CAMA_VAR.cama5 = {pre:"f-", drop:["m-nest","m-nest-cen","m-nest-izq","m-nest-der"], ch:{
    ...CAMA_VAR.cama3.ch,
    "m-nlat":{q:1, n:"Pata del pie (un lateral de la repisa del kit)", w:"Uno de los 2 laterales de la repisa del kit (1214 × 246), atornillado de canto bajo el pie de la cama: abierta es la pata; cerrada queda arriba como repisa sobre el escritorio. El otro sobra."}},
  add:[
    {id:"f-esc", g:"Escritorio", it:"—", n:"Tablero del escritorio", d:[1890,500,15], q:1, nueva:1, w:"Escritorio de todo el ancho de la cama: 189 × 50 cm. Canto en los 4 lados. Cerrada queda a 75 cm; al bajar la cama se mete debajo, a 11 cm del piso, siempre horizontal."},
    {id:"f-fald", g:"Escritorio", it:"—", n:"Faldón largo del escritorio", d:[1890,45,15], q:2, nueva:1, w:"Bordes de adelante y atrás bajo el tablero: le dan un canto visual de 6 cm y rigidez para que no se pandee en 1,89 m."},
    {id:"f-faldc", g:"Escritorio", it:"—", n:"Faldón corto del escritorio", d:[470,45,15], q:2, nueva:1, w:"Bordes de los lados bajo el tablero, entre los faldones largos."}]};
for(const [m,v] of Object.entries(CAMA_VAR)){
  P.filter(x=>x.m==="cama" && !(v.drop||[]).includes(x.id)).forEach(x=>{ const c=v.ch[x.id], id=v.pre+x.id.slice(2);
    if(c && c.d){ P.push({...x, id, m, d:c.d, n:c.n, w:c.w, ids:c.nueva?"nueva":"recorte", nueva:c.nueva, recorte:c.recorte, orig:x.id});
      PLAN_NAMES[id]=[`${PLAN_NAMES[x.id][0]} (${c.nueva?"nueva":"recortada"}, ${c.d[0]} mm)`, ""]; }
    else { P.push({...x, id, m, q:c?.q??x.q, n:c?.n??x.n, w:c?.w||"Igual a la del kit. "+x.w, same:x.id}); PLAN_NAMES[id]=PLAN_NAMES[x.id]; }
  });
  (v.add||[]).forEach(a=>{ P.push({m, p:"B1", ids:a.nueva?"nueva":"recorte", ...a}); PLAN_NAMES[a.id]=[a.n+" (diseño)",""]; });
}
P.forEach(x=>{ const v=PLAN_NAMES[x.id]; x.pl=v?.[0]||(x.inf?"(el plano no trae despiece)":x.n); x.stk=v?.[1]||""; });
function namesHTML(x){
  const seen=(STATE[x.id]?.codes||[]).filter(Boolean);
  return `<div class="names">
    <div><span class="k">En el plano</span><span class="v">${esc(x.pl)}</span></div>
    <div><span class="k">En el sticker</span><span class="v">${seen.length?seen.map(esc).join(" · "):x.stk?`${esc(x.stk)}… <span class="hint">(ej. 13222-<b>FondoD1</b>-13241; el final cambia)</span>`:`<span class="hint">Aún no se sabe: cuando escanees su etiqueta con foto, el código queda guardado aquí.</span>`}</span></div>
  </div>`;
}
const byId = Object.fromEntries(P.map(x=>[x.id,x]));
const TOTAL = Object.fromEntries(MUEBLES.map(m=>[m,0])); P.forEach(x=>TOTAL[x.m]+=x.q);
const $ = s => document.querySelector(s);
const esc = s => String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt = n => String(n).replace(".",",");
const dimStr = x => x.cut ? `${fmt(x.cut[0])} × ${fmt(x.cut[1])} × ${x.cut[2]} (cortada; plano ${fmt(x.d[0])} × ${fmt(x.d[1])})` : `${fmt(x.d[0])} × ${fmt(x.d[1])} × ${x.d[2]}`;
const ico = (id,cls="i") => `<svg class="${cls}"><use href="#${id}"/></svg>`;
const mtag = m => `<span class="mtag ${m}">${ico(ICON[m])}${SHORT[m]}</span>`;
const items = x => x.it.split("/").map(s=>s.trim());
