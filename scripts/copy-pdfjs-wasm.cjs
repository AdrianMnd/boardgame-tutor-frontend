/**
 * Copia los ficheros WASM que pdf.js necesita para decodificar
 * imágenes JPEG2000 (formato JPX, usado en algunos PDFs para
 * portadas/ilustraciones) desde node_modules a public/, donde
 * Vite los sirve tal cual, sin renombrarlos.
 *
 * Se ejecuta automáticamente antes de `dev` y `build` (ver
 * package.json) para no depender de copiarlos a mano ni de
 * subirlos al repositorio — siempre coinciden con la versión de
 * pdfjs-dist que esté instalada en cada momento.
 */
const fs = require("node:fs");
const path = require("node:path");

const SOURCE_DIR = path.join(
    __dirname,
    "..",
    "node_modules",
    "pdfjs-dist",
    "wasm"
);

const TARGET_DIR = path.join(
    __dirname,
    "..",
    "public",
    "pdfjs-wasm"
);

const FILES_TO_COPY = [
    "openjpeg.wasm",
    "openjpeg_nowasm_fallback.js",
    "qcms_bg.wasm"
];

fs.mkdirSync(TARGET_DIR, { recursive: true });

for (const filename of FILES_TO_COPY) {

    const source = path.join(SOURCE_DIR, filename);
    const target = path.join(TARGET_DIR, filename);

    if (!fs.existsSync(source)) {

        console.warn(

            `[copy-pdfjs-wasm] No se encontró ${filename} en ` +
            `pdfjs-dist — ¿ha cambiado de versión? El visor de PDF ` +
            `podría no decodificar imágenes JPEG2000 correctamente.`

        );

        continue;

    }

    fs.copyFileSync(source, target);

}

console.log(
    `[copy-pdfjs-wasm] Ficheros WASM de pdf.js copiados a public/pdfjs-wasm/`
);
