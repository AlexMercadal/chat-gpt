import { PDFDocument } from 'pdf-lib';

import {
  readFile,
  writeFile,
  mkdir,
  readdir,
  stat,
} from 'node:fs/promises';

import {
  resolve,
  join,
  dirname,
  basename,
  extname,
  relative,
} from 'node:path';

// Acepta la carpeta de empresa y, opcionalmente, --listar.
const argumentos = process.argv.slice(2);
const rutaEmpresa = argumentos.find(arg => !arg.startsWith('--'));
const soloListar = argumentos.includes('--listar');

const CARPETA_EMPRESA = resolve(
  rutaEmpresa || join('datos', 'plugcore')
);

const CARPETA_DOCUMENTOS = join(
  CARPETA_EMPRESA,
  'documentos'
);

const CARPETA_ENTRADA = join(CARPETA_DOCUMENTOS, 'entrada');
const CARPETA_SALIDA = join(CARPETA_DOCUMENTOS, 'salida');
const ARCHIVO_BLACKLIST = join(CARPETA_EMPRESA, 'blacklist.txt');

const paginasPorArchivo = 12;

const carpetasExcluidas = new Set([
  'salida',
  'node_modules',
  '.git',
  '.cache',
  'chroma_db',
]);

function normalizarRuta(ruta) {
  return ruta
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .toLowerCase();
}

async function cargarBlacklist() {
  try {
    const contenido = await readFile(ARCHIVO_BLACKLIST, 'utf8');

    return contenido
      .split(/\r?\n/)
      .map(linea => linea.trim())
      .filter(linea => linea && !linea.startsWith('#'))
      .map(normalizarRuta);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('No hay blacklist: se procesarán todos los originales.');
      return [];
    }

    throw error;
  }
}

function estaEnBlacklist(archivo, blacklist) {
  const nombre = normalizarRuta(basename(archivo));

  const relativaEntrada = normalizarRuta(
    relative(CARPETA_ENTRADA, archivo)
  );

  const relativaEmpresa = normalizarRuta(
    relative(CARPETA_EMPRESA, archivo)
  );

  return blacklist.some(exclusion => {
    if (exclusion.includes('/')) {
      return (
        exclusion === relativaEntrada ||
        exclusion === relativaEmpresa
      );
    }

    return exclusion === nombre;
  });
}

// Recorre entrada y todas sus subcarpetas.
async function buscarPDFs(carpeta, blacklist) {
  const archivos = [];

  const elementos = await readdir(carpeta, {
    withFileTypes: true,
  });

  for (const elemento of elementos) {
    const rutaCompleta = join(carpeta, elemento.name);

    if (elemento.isDirectory()) {
      if (carpetasExcluidas.has(elemento.name.toLowerCase())) {
        continue;
      }

      archivos.push(
        ...await buscarPDFs(rutaCompleta, blacklist)
      );

      continue;
    }

    if (!elemento.isFile()) continue;

    const esPDF = extname(elemento.name).toLowerCase() === '.pdf';
    const esParte = /^parte-\d+\.pdf$/i.test(elemento.name);

    if (!esPDF || esParte) continue;

    if (estaEnBlacklist(rutaCompleta, blacklist)) {
      console.log(
        `Omitido por blacklist: ${relative(CARPETA_ENTRADA, rutaCompleta)
        }`
      );

      continue;
    }

    archivos.push(rutaCompleta);
  }

  return archivos;
}

function obtenerCarpetaSalida(archivo) {
  const rutaRelativa = relative(CARPETA_ENTRADA, archivo);
  const subcarpeta = dirname(rutaRelativa);
  const nombre = basename(archivo, extname(archivo));

  // Conserva las subcarpetas para distinguir PDF con el mismo nombre.
  return join(CARPETA_SALIDA, subcarpeta, nombre);
}

async function dividirPDF(archivo) {
  const original = await PDFDocument.load(await readFile(archivo));
  const total = original.getPageCount();

  const carpetaSalida = obtenerCarpetaSalida(archivo);

  await mkdir(carpetaSalida, { recursive: true });

  console.log(`\nDividiendo: ${archivo}`);
  console.log(`Páginas: ${total}`);
  console.log(`Destino: ${carpetaSalida}`);

  for (
    let inicio = 0;
    inicio < total;
    inicio += paginasPorArchivo
  ) {
    const fin = Math.min(inicio + paginasPorArchivo, total);
    const nuevo = await PDFDocument.create();

    const indices = Array.from(
      { length: fin - inicio },
      (_, i) => inicio + i
    );

    const paginas = await nuevo.copyPages(original, indices);

    paginas.forEach(pagina => nuevo.addPage(pagina));

    const numero = String(
      inicio / paginasPorArchivo + 1
    ).padStart(2, '0');

    const destino = join(
      carpetaSalida,
      `parte-${numero}.pdf`
    );

    await writeFile(destino, await nuevo.save());

    console.log(
      `${destino}: páginas ${inicio + 1} a ${fin}`
    );
  }
}

try {
  const informacion = await stat(CARPETA_ENTRADA);

  if (!informacion.isDirectory()) {
    throw new Error(
      `La ruta de entrada no es una carpeta: ${CARPETA_ENTRADA}`
    );
  }

  console.log(`Entrada: ${CARPETA_ENTRADA}`);
  console.log(`Salida: ${CARPETA_SALIDA}`);
  console.log(`Blacklist: ${ARCHIVO_BLACKLIST}`);

  const blacklist = await cargarBlacklist();
  const archivos = await buscarPDFs(CARPETA_ENTRADA, blacklist);

  archivos.sort((a, b) =>
    a.localeCompare(b, 'es', { numeric: true })
  );

  if (!archivos.length) {
    console.log('\nNo se encontraron PDF para dividir.');
  } else {
    console.log(`\nPDF encontrados: ${archivos.length}`);

    for (const archivo of archivos) {
      if (soloListar) {
        console.log(`\nArchivo: ${archivo}`);
        console.log(`Destino: ${obtenerCarpetaSalida(archivo)}`);
        continue;
      }

      try {
        await dividirPDF(archivo);
      } catch (error) {
        console.error(
          `Error al dividir "${archivo}": ${error instanceof Error ? error.message : String(error)
          }`
        );

        process.exitCode = 1;
      }
    }

    console.log(
      soloListar
        ? '\nListado terminado. No se han generado archivos.'
        : '\nProceso terminado.'
    );
  }
} catch (error) {
  console.error(
    `Error: ${error instanceof Error ? error.message : String(error)}`
  );

  process.exitCode = 1;
}