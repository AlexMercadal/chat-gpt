const { readFile } = require('node:fs/promises')
const { join, basename } = require('node:path')

// Carpeta con los parte-XX.txt del OCR (indexer/datos/<empresa>/documentos/resultado).
const OCR_DIR = process.env.OCR_DIR

// Páginas de cada parte ya leídas: { 'parte-21.txt': Map(numeroPagina => bloques) }
const cache = new Map()

// Comparar solo letras y números, como en el visor.
const normalizar = texto => (texto || '')
  .toLocaleLowerCase('es')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^\p{L}\p{N}]/gu, '')

// Mismo formato que lee indexer/src/plugcore.ts:
// <PAGE><BLOCK>tipo<NIVEL>[x0, y0, x1, y1]<FORK>texto
// Bloques que nunca forman parte de un párrafo (igual que en plugcore.ts).
const TIPOS_IGNORADOS = ['footer', 'page_number', 'image']
// Un bloque más corto que esto no basta para identificar un párrafo.
const LARGO_MINIMO_BLOQUE = 20

// Se guarda la promesa para que varias búsquedas a la vez lean el archivo una sola vez.
const leerParte = archivo => {
  if (!cache.has(archivo)) {
    const lectura = parsearParte(archivo)
    cache.set(archivo, lectura)
    lectura.catch(() => cache.delete(archivo))
  }

  return cache.get(archivo)
}

const parsearParte = async archivo => {
  const texto = await readFile(join(OCR_DIR, basename(archivo)), 'utf8')
  const paginas = new Map()

  for (const pagina of texto.split('<PAGE>').slice(1)) {
    const bloques = pagina
      .split('<BLOCK>')
      .slice(1)
      .flatMap(bloque => {
        const separador = bloque.indexOf('<FORK>')

        if (separador < 0) return []

        const cabecera = bloque.slice(0, separador)
        const caja = cabecera.match(/\[(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\]/)

        return [{
          tipo: cabecera.match(/^([a-z_]+)/i)?.[1].toLowerCase() ?? 'text',
          caja: caja ? caja.slice(1).map(Number) : null,
          texto: bloque.slice(separador + 6).trim()
        }]
      })

    const numero = Number(
      bloques
        .find(b => b.tipo === 'page_number')
        ?.texto.match(/^(\d+)\s*\//)?.[1] ?? 0
    )

    // Solo los bloques útiles, con su texto ya normalizado para comparar.
    if (numero) {
      paginas.set(numero, bloques
        .filter(b => b.caja && b.texto && !TIPOS_IGNORADOS.includes(b.tipo))
        .map(b => ({ caja: b.caja, normalizado: normalizar(b.texto) })))
    }
  }

  return paginas
}

// Devuelve la caja del bloque que contiene el párrafo,
// en proporción a la página (0 a 1): [x0, y0, x1, y1].
exports.findBox = async (archivo, pagina, texto) => {
  if (!OCR_DIR || !archivo || !pagina) return null

  try {
    const paginas = await leerParte(archivo)
    const bloques = paginas.get(Number(pagina)) || []
    const buscado = normalizar(texto)

    if (!buscado) return null

    // 1º un bloque que contenga el párrafo entero; si no, un bloque (no demasiado corto)
    // que esté dentro del párrafo.
    const bloque = bloques.find(b => b.normalizado.includes(buscado)) ||
      bloques.find(b =>
        b.normalizado.length >= Math.min(LARGO_MINIMO_BLOQUE, buscado.length) &&
        buscado.includes(b.normalizado)
      )

    return bloque ? bloque.caja.map(valor => valor / 1000) : null
  } catch (error) {
    console.log(`No se pudo leer el OCR de ${archivo}: ${error.message}`)
    return null
  }
}
