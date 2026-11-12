import fs from 'node:fs/promises';
import path from 'node:path';

const VAST_API_KEY = process.env.VAST_API_KEY;
const OCR_API_KEY = process.env.OCR_API_KEY;
const VAST_INSTANCE_ID = process.env.VAST_INSTANCE_ID;

// Uso:
// node src/vastai-ocr-test.mjs "archivo.pdf" --listar
//
// Otra empresa:
// node src/vastai-ocr-test.mjs "archivo.pdf" "datos/otra-empresa" --listar

const argumentos = process.argv.slice(2);
const soloListar = argumentos.includes('--listar');

const posicionales = argumentos.filter(
  argumento => argumento !== '--listar'
);

const nombreArchivo = posicionales[0];

const carpetaEmpresa = path.resolve(
  posicionales[1] || path.join('datos', 'plugcore')
);

const carpetaDocumentos = path.join(
  carpetaEmpresa,
  'documentos'
);

const carpetaEntrada = path.join(
  carpetaDocumentos,
  'entrada'
);

const carpetaPruebas = path.join(
  carpetaDocumentos,
  'pruebas'
);

const rutaTexto = path.join(
  carpetaPruebas,
  'resultado-ocr.txt'
);

const rutaJson = path.join(
  carpetaPruebas,
  'resultado-ocr.json'
);

const tiposAdmitidos = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

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

async function ejecutarOCR(url, archivo) {
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

  console.log('\n===== RESULTADO =====');
  console.log('Páginas:', resultado.pages);
  console.log('Tiempo servidor:', resultado.elapsed_ms, 'ms');
  console.log('Tiempo total:', Date.now() - inicio, 'ms');

  console.log('\n===== TEXTO =====\n');
  console.log(resultado.text);

  await fs.mkdir(carpetaPruebas, {
    recursive: true,
  });

  await fs.writeFile(
    rutaTexto,
    resultado.text ?? '',
    'utf8'
  );

  await fs.writeFile(
    rutaJson,
    JSON.stringify(resultado, null, 2),
    'utf8'
  );

  console.log('\nTexto guardado en:', rutaTexto);
  console.log('JSON guardado en:', rutaJson);
}

async function main() {
  if (!nombreArchivo) {
    throw new Error(
      'Uso: node src/vastai-ocr-test.mjs ' +
      '"archivo.pdf" ["datos/empresa"] [--listar]'
    );
  }

  // El nombre o ruta relativa se interpreta desde entrada.
  // También admite una ruta absoluta.
  const archivo = path.resolve(carpetaEntrada, nombreArchivo);

  const informacion = await fs.stat(archivo);

  if (!informacion.isFile()) {
    throw new Error(`La ruta no es un archivo: ${archivo}`);
  }

  const extension = path.extname(archivo).toLowerCase();

  if (!tiposAdmitidos[extension]) {
    throw new Error(`Formato no admitido: ${extension}`);
  }

  console.log('Empresa:', carpetaEmpresa);
  console.log('Archivo de entrada:', archivo);
  console.log('TXT de prueba:', rutaTexto);
  console.log('JSON de prueba:', rutaJson);

  // Finaliza antes de contactar con VastAI o escribir resultados.
  if (soloListar) {
    console.log(
      '\nComprobación terminada. No se ha ejecutado OCR ni modificado archivos.'
    );

    return;
  }

  if (!VAST_API_KEY || !OCR_API_KEY) {
    throw new Error(
      'Faltan VAST_API_KEY u OCR_API_KEY. ' +
      'Carga las variables con node --env-file=.env.'
    );
  }

  const url = await obtenerServidorOCR();

  await comprobarModelo(url);
  await ejecutarOCR(url, archivo);
}

main().catch(error => {
  console.error(
    'ERROR:',
    error instanceof Error ? error.message : String(error)
  );

  process.exitCode = 1;
});