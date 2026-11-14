# Tania e o segredo dos 40

Aventura gráfica web, romántica y con humor, para el 40 cumpleaños de Tania.
Estética de aventura point‑and‑click de los 90 (pixel art propio, sin assets de terceros),
10 capítulos que se desbloquean cada 24 h, todo en galego.

- 100 % estática: HTML + CSS + JavaScript (módulos ES), sin compilación ni backend.
- Progreso guardado en `localStorage` (clave `tania40:game-state:v1`).
- Banda sonora original generada con Web Audio API.
- QR de Spotify generado localmente (`vendor/qrcode.min.js`, MIT).
- Lista para GitHub Pages.

---

## Ejecutar en local

```bash
cd tania40
python3 -m http.server 8080
```

Abrir <http://localhost:8080>.

> No funciona abriendo `index.html` con doble clic (`file://`): los módulos ES necesitan un servidor.

Para probar desde el móvil en la misma wifi: `http://IP-DE-TU-MAC:8080`.

---

## Estructura

```
tania40/
├── index.html
├── README.md
├── .nojekyll
├── css/game.css
├── js/
│   ├── app.js           # arranque, navegación, intro, cuenta atrás, final
│   ├── config.js        # ⚙️  TODO lo configurable (Spotify, código final, regalo, PIN…)
│   ├── phases.js        # ✏️  textos, preguntas y pistas de cada fase + su lógica
│   ├── state.js         # partida en localStorage, bloqueos, reloj
│   ├── validators.js    # validación flexible de respuestas libres
│   ├── audio.js         # música y efectos (Web Audio)
│   ├── ui.js            # diálogo, inventario, avisos, modales
│   ├── scenes.js        # escenas pixel-art en SVG + Gonzalo NPC
│   ├── admin.js         # consola secreta de Gonzalo
│   └── puzzles/
│       ├── photoPuzzle.js    # puzle 3×3
│       ├── childrenPuzzle.js # arquivo familiar
│       ├── lockPuzzle.js     # candado / caja fuerte + teclado
│       └── tokenBoard.js     # fichas "tocar ficha → tocar hueco"
├── assets/
│   ├── images/puzzle.jpg     # foto del puzle (provisional)
│   ├── images/placeholders/
│   ├── icons/favicon.svg
│   └── qr/                   # aquí puedes guardar el QR final que le darás a Tania
└── vendor/qrcode.min.js
```

---

## Los 14 capítulos

| # | Capítulo | Mecánica | Solución |
|---|----------|----------|----------|
| 1 | A Torre de Hércules | explorar + frase libre | beso + "seguir hablando" / "perder el tiempo" (acepta variantes ES/GL) |
| 2 | Nova York | encontrar postal + secuencia de objetos | maleta → taxi → rascacielos *(provisional)* |
| 3 | Maldivas | encontrar palabras + completar frase | VIAXE · LÚA · LEMBRANZA |
| 4 | O candado da voda (Pazo de Mondoi) | candado 6 cifras | `250714` |
| 5 | O incidente da saba | examinar cama + respuesta libre | "Gonzalo" (el que se quejó en recepción) |
| 6 | O concurso do apartamento | concurso de Friends: 7 preguntas, 3 vidas | Muriel · Transponster · Hugsy · Tres · Regina Phalange · Dr. Drake Ramoray · Jack e Erica |
| 7 | A lúa de sempre (superluna 14/11/2016) | respuesta libre + QR Spotify | "Con la luna llena" (sin exigir Melendi) |
| 8 | Fotografía rota | puzle 3×3 por intercambio | — |
| 9 | Noite no Coliseum | 3 tiros libres (minijuego) + marcador | `07` victorias del Leyma en su 1.ª ACB (2024-25, 7-27) |
| 10 | O xuízo das lentellas | examinar 3 pruebas + veredicto | **Martiño** (las lentejas, absueltas) |
| 11 | O arquivo familiar | fichas de fechas + candado 4 cifras | 15/11/2016, 17/06/2022 → `2805` (28/05, inicio de la relación) |
| 12 | O noso fogar | reforma (puzle "luces fuera" 3×3) + letrero de Aldán | O **CHINCHORRO** |
| 13 | Arquivo temporal | ordenar recuerdos + Gonzalo NPC | Torre → Nova York → Voda → Maldivas → Martiño e Xoel |
| 14 | A caixa forte | caja fuerte | `FINAL_CODE` (lo das tú en persona) |

Cada capítulo da un fragmento (13). El 14.º es la pista que das tú en persona.
Las preguntas de Friends están en `CONTENT.friends.questions` (`answer` debe coincidir con una de las `options`).
La **orden** se cambia en `PHASE_LIST` al final de `js/phases.js` (los números se recalculan solos).

**Revisa el capítulo 13**: asumí que el primer viaje a Nueva York fue antes de la boda.
Si no es así, cambia `CONTENT.tempo.order` en `js/phases.js`.

### Calendario
- Un capítulo por día: el siguiente se abre **a las 00:00** del día siguiente a completar el anterior
  (`UNLOCK_MODE: "midnight"`; con `"24h"` vuelve al bloqueo de 24 h).
- La caja fuerte **nunca se abre antes de `FINAL_DATE`** (`"2026-12-01"`). Si Tania llega antes,
  ve una cuenta atrás con "A caixa forte só se abrirá o 1 de decembro".
- Para acabar exactamente el 1 de diciembre con 14 capítulos, Tania debe empezar **el 18 de noviembre**.
  Si empieza antes, esperará en el capítulo 14; si empieza después, el final caerá más tarde.
- El modo desarrollo (`?dev=1`) ignora la medianoche y la fecha final.

## Mapa del tesoro

Cada capítulo completado descubre un anaco del mapa (inventario → **Mapa**). El último anaco (la X)
está dentro de la caja fuerte: al abrirla, el mapa se completa y muestra dónde está el regalo:

```js
TREASURE_LOCATION: "A estantería que hai enriba do ordenador",
```

⚠️ Con el repo público, esto se puede leer. Pon el sitio real poco antes del final.

## Contraseña de acceso

El juego pide contraseña cada vez que se abre en un navegador nuevo (se recuerda mientras la pestaña siga abierta).
Solo se guarda el SHA-256 en `ACCESS_PASSWORD_SHA256`. Para cambiarla:

```bash
echo -n "NUEVA_CONTRASEÑA" | shasum -a 256
```

No es seguridad real: evita que alguien juegue por casualidad, pero el código del repositorio se puede leer.

## Configuración (`js/config.js`)

### Spotify
```js
SPOTIFY_URL: "https://open.spotify.com/track/XXXXXXXXXXXX",
```
En Spotify: canción → `···` → Compartir → Copiar enlace. Usa el formato
`https://open.spotify.com/track/...` (abre la app directamente en el móvil).
Mientras sea `"TODO"`, el QR y el botón llevan a una búsqueda de Spotify de la canción.

### Código final de la caja fuerte
```js
FINAL_CODE: "2026",
```
Solo dígitos. La caja adapta el número de casillas a la longitud.
Mientras sea `"TODO"` la caja no se abre (y lo dice).
Easter eggs ya incluidos: `2805`, `2507`, `250714`, `2014`, `1622`, `0000`, `1234`, `4040`.
Se editan en `CONTENT.caixa.eggs` (`js/phases.js`).

### Regalo
```js
FINAL_GIFT: {
  title: "Un fin de semana en ...",
  description: "Prepara la maleta: salimos el ...",
  image: "assets/images/regalo.jpg"
}
```
Si `title` y `description` están vacíos se muestra *"O segredo aínda non foi escrito."*

### Fotos de la revelación final (opcional)
```js
FINAL_PHOTOS: ["assets/images/final-1.jpg", "assets/images/final-2.jpg"],
```

### Cambiar textos, preguntas o pistas
Todo está en el objeto `CONTENT` al principio de `js/phases.js`.
La fase 2 es provisional: si quieres añadir una pregunta personal después de la secuencia, rellena
`CONTENT.newYork.personalQuestion = { question: "...", accept: ["respuesta"], hints: ["...", "..."] }`.

---

## Cambiar la foto del puzle

1. Sustituye `assets/images/puzzle.jpg` por cualquier foto (horizontal, vertical o cuadrada; no se deforma).
2. Recomendado: JPG, máx. ~1600 px por lado, < 500 KB.
   En Mac: `sips -Z 1600 foto.jpg --out assets/images/puzzle.jpg`
3. Si Tania ya había empezado el puzle con otra foto, sube `PHOTO_PUZZLE_VERSION` en `config.js`
   (solo se reinicia ese puzle, no la partida).

Si el archivo falta, el juego muestra *"NON ATOPO A FOTO DO PUZLE"* en lugar de fallar.

---

## Consola de Gonzalo

1. Toca **7 veces seguidas, rápido** el texto del pie: *Tania e o segredo dos 40 · v1*.
2. PIN por defecto: **`4040`**. Cámbialo:
   ```bash
   echo -n "TU_PIN" | shasum -a 256
   ```
   y pega el resultado en `ADMIN_PIN_SHA256`.

Funciones: desbloquear ahora, ir a cualquier fase (o al final), completar fase actual,
ignorar reloj, reiniciar partida (pide confirmación), exportar/importar partida
(`tania40-save.json`), ver estado JSON y modo desarrollo.

### Modo desarrollo (bloqueo de 5 s en vez de 24 h)
- Opción A (recomendada): en la consola → *PERMITIR MODO DESENVOLVEMENTO* y abre la URL con `?dev=1`.
  Solo afecta a ese navegador; sin `?dev=1` todo sigue en 24 h.
- Opción B: `DEV_MODE: true` en `config.js`. **No lo subas así.** Aparece un aviso rojo
  *MODO DESENVOLVEMENTO* en el pie cuando está activo.

### Resetear partida
Consola → *REINICIAR PARTIDA* → *CONFIRMAR*. O en la consola del navegador:
`localStorage.removeItem("tania40:game-state:v1")`.

### Cambio de móvil
Consola → *EXPORTAR PARTIDA* en el móvil viejo, *IMPORTAR PARTIDA* en el nuevo.

---

## Desplegar en GitHub Pages

El repositorio ya está inicializado (`git init`, rama `main`). Falta el commit y el push:

```bash
git add .
git commit -m "Initial version of Tania e o segredo dos 40"
```

Con GitHub CLI:
```bash
gh repo create tania40 --public --source=. --remote=origin --push
```

O manualmente: crea el repo `tania40` en GitHub y
```bash
git remote add origin https://github.com/USUARIO/tania40.git
git push -u origin main
```

Luego: **Settings → Pages → Deploy from a branch → `main` → `/ (root)`**.
Resultado: `https://USUARIO.github.io/tania40/`

### QR para Tania
Genera el QR que le darás apuntando a la URL pública (no a archivos internos):
`https://USUARIO.github.io/tania40/`. Puedes generarlo localmente abriendo el juego,
y en la consola del navegador:
```js
document.body.innerHTML = QRMini.svg("https://USUARIO.github.io/tania40/", { border: 4 });
```
(clic derecho → guardar, o captura de pantalla) y guardarlo en `assets/qr/`.

---

## ⚠️ Privacidad y secretos

- Si el repositorio es **público**, cualquiera puede ver: fotos, nombres, fechas, textos,
  el código final y el regalo. Esto es especialmente importante si añades fotos de Martiño o Xoel.
- El PIN de la consola y el código final **no son seguridad real**: el JavaScript es visible.
- Si el regalo debe ser secreto de verdad, no pongas `FINAL_CODE` ni `FINAL_GIFT` en el repo
  hasta poco antes de que Tania llegue a la fase 10.
- Alternativa: repositorio privado + GitHub Pages (requiere plan de pago de GitHub) o Netlify/Cloudflare Pages.
- La etiqueta `noindex` evita que los buscadores lo indexen, pero no lo oculta.

## Rendimiento

Imágenes en `.jpg`/`.webp`, ~1600 px máximo por lado. Evita fotos de 10–20 MB.
Todo (CSS, JS, QR, imágenes) es local; solo Spotify necesita conexión.

## Notas técnicas

- `nextUnlockAt` se guarda como timestamp; la cuenta atrás siempre es `nextUnlockAt - Date.now()`.
- `lastSeenAt` solo avanza. Si el reloj retrocede más de 2 min se muestra el aviso de
  *"Regreso ao futuro"* y no se desbloquea nada (la consola puede ignorarlo).
- El estado se guarda tras cada acción relevante (respuesta, ficha, movimiento del puzle, objeto, pista, fase).
- Respeta `prefers-reduced-motion`.
