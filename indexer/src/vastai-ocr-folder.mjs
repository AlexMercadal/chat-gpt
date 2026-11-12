import fs from 'node:fs/promises';
import path from 'node:path';

const VAST_API_KEY = process.env.VAST_API_KEY;
const OCR_API_KEY = process.env.OCR_API_KEY;
const VAST_INSTANCE_ID = process.env.VAST_INSTANCE_ID;

const argumentos = process.argv.slice(2);
const rutaEmpresa = argumentos.find(arg => !arg.startsWith('--'));

const soloListar = argumentos.includes('--listar');
const forzar = argumentos.includes('--forzar');

const carpetaEmpresa = path.resolve(
  rutaEmpresa || path.join('datos', 'plugcore')
);

const carpetaDocumentos = path.join(
  carpetaEmpresa,
  'documentos'
);

const rutaEntrada = path.join(
  carpetaDocumentos,
  'salida'
);

const carpetaResultado = path.join(
  carpetaDocumentos,
  'resultado'
);

const tiposAdmitidos = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

async function existeArchivo(ruta) {
  try {
    await fs.access(ruta);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

// Encuentra archivos compatibles a cualquier profundidad.
async function obtenerArchivos(carpeta) {
  const elementos = await fs.readdir(carpeta, {
    withFileTypes: true,
  });

  const archivos = [];

  for (const elemento of elementos) {
    const ruta = path.join(carpeta, elemento.name);

    if (elemento.isDirectory()) {
      archivos.push(...await obtenerArchivos(ruta));
      continue;
    }

    if (!elemento.isFile()) continue;

    const extension = path.extname(elemento.name).toLowerCase();

    if (tiposAdmitidos[extension]) {
      archivos.push(ruta);
    }
  }

  return archivos;
}

function obtenerDestinos(archivo) {
  const nombreBase = path.basename(
    archivo,
    path.extname(archivo)
  );

  return {
    texto: path.join(carpetaResultado, `${nombreBase}.txt`),
    json: path.join(carpetaResultado, `${nombreBase}.json`),
  };
}

// Evita que dos archivos distintos escriban los mismos resultados.
function comprobarNombresUnicos(archivos) {
  const encontrados = new Map();

  for (const archivo of archivos) {
    const destino = obtenerDestinos(archivo);
    const clave = destino.texto.toLowerCase();

    if (encontrados.has(clave)) {
      throw new Error(
        'Hay archivos que producirían el mismo resultado:\n' +
        `${encontrados.get(clave)}\n` +
        `${archivo}\n` +
        'Hay que diferenciarlos antes de ejecutar el OCR.'
      );
    }

    encontrados.set(clave, archivo);
  }
}

async function obtenerServidorOCR() {
  const response = await fetch(
    'https://console.vast.ai/api/v1/instances/?owner=me',
    {
      headers: {
        Authorization: `Bearer ${VAST_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Vast.ai HTTP ${response.status}: ${await response.text()}`
    );
  }

  const data = await response.json();

  const candidatas = data.instances.filter(instancia =>
    instancia.actual_status === 'running' &&
    instancia.ports?.['10001/tcp']?.[0]?.HostPort
  );

  const instancia = VAST_INSTANCE_ID
    ? candidatas.find(
      candidata => String(candidata.id) === VAST_INSTANCE_ID
    )
    : candidatas.length === 1
      ? candidatas[0]
      : null;

  if (!instancia) {
    throw new Error(
      'No hay una instancia OCR única y operativa. ' +
      'Comprueba el puerto 10001 o indica VAST_INSTANCE_ID.'
    );
  }

  const ip = instancia.public_ipaddr;
  const puerto = instancia.ports['10001/tcp'][0].HostPort;

  if (!ip || !puerto) {
    throw new Error('IP o puerto público no disponible.');
  }

  console.log('Instancia:', instancia.id);
  console.log('IP:', ip);
  console.log('Puerto:', puerto);

  return `http://${ip}:${puerto}`;
}

async function comprobarModelo(url) {
  const response = await fetch(`${url}/ready`, {
    headers: {
      Authorization: `Bearer ${OCR_API_KEY}`,
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(
      `OCR HTTP ${response.status}: ${await response.text()}`
    );
  }

  console.log('Modelo preparado:', await response.json());
}

async function ejecutarOCR(url, archivo, destinos) {
  const buffer = await fs.readFile(archivo);
  const extension = path.extname(archivo).toLowerCase();
  const tipo = tiposAdmitidos[extension];

  if (!tipo) {
    throw new Error(`Formato no admitido: ${extension}`);
  }

  const form = new FormData();

  form.append(
    'file',
    new Blob([buffer], { type: tipo }),
    path.basename(archivo)
  );

  form.append('dpi', '200');
  form.append('crop_mode', 'true');
  form.append('tokens_per_page', '4000');

  console.log(`\nProcesando: ${archivo}`);
  console.log('Enviando documento al OCR...');

  const inicio = Date.now();

  const response = await fetch(`${url}/ocr`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OCR_API_KEY}`,
    },
    body: form,
    signal: AbortSignal.timeout(900000),
  });

  if (!response.ok) {
    throw new Error(
      `OCR HTTP ${response.status}: ${await response.text()}`
    );
  }

  const resultado = await response.json();

  console.log('Páginas:', resultado.pages);
  console.log('Tiempo servidor:', resultado.elapsed_ms, 'ms');
  console.log('Tiempo total:', Date.now() - inicio, 'ms');

  await fs.writeFile(
    destinos.texto,
    resultado.text ?? '',
    'utf8'
  );

  await fs.writeFile(
    destinos.json,
    JSON.stringify(resultado, null, 2),
    'utf8'
  );

  console.log('Texto guardado en:', destinos.texto);
  console.log('JSON guardado en:', destinos.json);
}

async function main() {
  console.log('Entrada:', rutaEntrada);
  console.log('Resultado:', carpetaResultado);

  const archivos = await obtenerArchivos(rutaEntrada);

  archivos.sort((a, b) =>
    a.localeCompare(b, 'es', {
      numeric: true,
      sensitivity: 'base',
    })
  );

  if (!archivos.length) {
    console.log('No se encontraron archivos compatibles.');
    return;
  }

  comprobarNombresUnicos(archivos);

  const planes = [];

  for (const archivo of archivos) {
    const destinos = obtenerDestinos(archivo);

    const tieneTexto = await existeArchivo(destinos.texto);
    const tieneJson = await existeArchivo(destinos.json);

    planes.push({
      archivo,
      destinos,
      completado: tieneTexto && tieneJson,
    });
  }

  console.log(`\nArchivos encontrados: ${planes.length}`);

  for (const plan of planes) {
    const estado = plan.completado && !forzar
      ? 'YA PROCESADO: se omitirá'
      : 'PENDIENTE DE OCR';

    console.log(`\n[${estado}]`);
    console.log('Archivo:', plan.archivo);
    console.log('TXT:', plan.destinos.texto);
    console.log('JSON:', plan.destinos.json);
  }

  // Termina antes de crear carpetas o contactar con servicios.
  if (soloListar) {
    console.log(
      '\nListado terminado. No se ha ejecutado OCR ni modificado archivos.'
    );

    return;
  }

  const pendientes = planes.filter(
    plan => forzar || !plan.completado
  );

  if (!pendientes.length) {
    console.log(
      '\nTodos los archivos tienen sus resultados. No se ejecutará OCR.'
    );

    return;
  }

  if (!VAST_API_KEY || !OCR_API_KEY) {
    throw new Error(
      'Faltan VAST_API_KEY u OCR_API_KEY. ' +
      'Carga el archivo .env al ejecutar el script.'
    );
  }

  await fs.mkdir(carpetaResultado, {
    recursive: true,
  });

  const url = await obtenerServidorOCR();
  await comprobarModelo(url);

  let completados = 0;
  let fallidos = 0;

  for (const plan of pendientes) {
    try {
      await ejecutarOCR(url, plan.archivo, plan.destinos);
      completados++;
    } catch (error) {
      fallidos++;

      console.error(
        `ERROR procesando "${plan.archivo}":`,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  console.log('\n===== PROCESO FINALIZADO =====');
  console.log('Completados:', completados);
  console.log('Fallidos:', fallidos);
  console.log('Omitidos:', planes.length - pendientes.length);
  console.log('Resultados guardados en:', carpetaResultado);

  if (fallidos > 0) {
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(
    'ERROR:',
    error instanceof Error ? error.message : String(error)
  );

  process.exitCode = 1;
});
