const { readFile } = require('node:fs/promises')
const { join } = require('node:path')

const PDF_PATH = join(process.env.PDFS_DIR || '', process.env.PDF_FILE || 'plugcore-docs.pdf')

let documento = null
// Enlaces internos ya leídos: { numeroPagina => [{ caja, destino }] }
const enlaces = new Map()

const getDocumento = () => {
  if (!documento) {
    documento = (async () => {
      const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs')
      const data = new Uint8Array(await readFile(PDF_PATH))
      return getDocument({ data, verbosity: 0 }).promise
    })()

    // Si falla (por ejemplo, PDFS_DIR mal configurado), reintentar la próxima vez.
    documento.catch(() => { documento = null })
  }

  return documento
}

// Enlaces internos de una página: caja en proporción (0 a 1, origen arriba a la izquierda,
// igual que las cajas del OCR) y página de destino.
// Se guarda la promesa para que varias búsquedas a la vez lean la página una sola vez.
const getEnlaces = numero => {
  if (!enlaces.has(numero)) {
    const lectura = leerEnlaces(numero)
    enlaces.set(numero, lectura)
    lectura.catch(() => enlaces.delete(numero))
  }

  return enlaces.get(numero)
}

const leerEnlaces = async numero => {
  const pdf = await getDocumento()

  if (numero < 1 || numero > pdf.numPages) return []

  const pagina = await pdf.getPage(numero)
  const [vx0, vy0, vx1, vy1] = pagina.view
  const ancho = vx1 - vx0
  const alto = vy1 - vy0
  const lista = []

  for (const anotacion of await pagina.getAnnotations()) {
    if (anotacion.subtype !== 'Link' || !anotacion.dest) continue

    const destino = typeof anotacion.dest === 'string'
      ? await pdf.getDestination(anotacion.dest)
      : anotacion.dest

    if (!destino) continue

    const indice = typeof destino[0] === 'object'
      ? await pdf.getPageIndex(destino[0])
      : destino[0]

    // En el PDF el origen está abajo a la izquierda: se da la vuelta al eje Y.
    const [x0, y0, x1, y1] = anotacion.rect

    lista.push({
      caja: [
        (x0 - vx0) / ancho,
        1 - (y1 - vy0) / alto,
        (x1 - vx0) / ancho,
        1 - (y0 - vy0) / alto
      ],
      destino: indice + 1
    })
  }

  return lista
}

// Si la caja de un párrafo coincide con un enlace interno, devuelve la página a la que lleva.
exports.findLinkTarget = async (pagina, caja) => {
  if (!caja || !pagina) return null

  try {
    const [cx0, cy0, cx1, cy1] = caja
    const lista = await getEnlaces(Number(pagina))

    const enlace = lista.find(({ caja: [x0, y0, x1, y1] }) =>
      Math.min(cy1, y1) - Math.max(cy0, y0) > 0 &&
      Math.min(cx1, x1) - Math.max(cx0, x0) > 0
    )

    return enlace?.destino ?? null
  } catch (error) {
    console.log(`No se pudieron leer los enlaces del PDF: ${error.message}`)
    return null
  }
}
