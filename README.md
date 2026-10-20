# Armado de muebles

App web (una sola página, sin build) para armar muebles de melamina pieza por pieza: identificar cada pieza por sus medidas, verla en 3D dentro del mueble, seguir el checklist, optimizar el corte de tableros y estimar costos.

**Ver en línea:** https://judasane.github.io/armado-muebles/

## Muebles

- **Mueble de cocina** y **mueble de TV** (despiece de Madecentro), con horno, "H", gas y toma en el 3D.
- **Armario** (despiece inferido de los planos generales).
- **Cama abatible IBIZA** (Tecnomobili CM-8043) y variantes de diseño: con pistones, eléctrica (actuadores), vertical y con escritorio que se mantiene horizontal (paralelogramo).

## Qué hace

- **Escanear / medidas:** escribe las medidas de la etiqueta y te dice qué pieza es, de qué mueble y dónde va.
- **3D:** modelo interactivo (three.js). Abre puertas, cajones y la cama con doble toque o con deslizadores; oculta piezas o conjuntos; mide en cm (distancias ortogonales entre caras, aristas o esquinas).
- **Despiece y planos:** todas las piezas con medidas, nombre en el plano y el ítem marcado sobre el plano.
- **Corte:** optimización de corte en guillotina por tablero (disco, refilado, veta), revisión de holguras antes de cortar y costo aproximado.
- **Checklist:** conteo de piezas encontradas.

Pensada para daltónicos: nada se distingue solo por color (íconos, palabras, patrones y luminancia).

## Notas

- Leer la etiqueta con foto y el checklist compartido usan funciones de Claude: solo funcionan dentro de claude.ai. En GitHub Pages se usa la entrada por medidas y el checklist se guarda en el navegador.
- Los diseños de mecanismos (pistones, actuadores, escritorio) son cálculos propios, no del fabricante: revísalos con alguien que trabaje herrajes antes de construirlos.
