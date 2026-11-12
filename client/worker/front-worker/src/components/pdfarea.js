import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

class PdfArea extends HTMLElement {

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    this.pdf = null
    this.file = null
    this.page = 1
    this.renderTask = null
    // Párrafo a resaltar: { page, texto, caja }
    this.highlight = null
    // Cada página pedida recibe un turno; si llega otra antes de acabar, la anterior se descarta.
    this.turno = 0
  }

  connectedCallback() {
    this.render()

    document.addEventListener('open-pdf', event => {
      this.open(event.detail)
    })
  }

  render() {
    this.shadow.innerHTML =
    /*html*/`
    <style>
      * {
        box-sizing: border-box;
      }

      span {
        color: white
      }

      svg {
        fill: white
      }

      aside {
        position: fixed;
        top: 0;
        right: 0;
        width: 40%;
        height: 100vh;
        display: flex;
        flex-direction: column;
        background-color: hsl(0, 0%, 6%);
        border-left: 1px solid #313131;
        transform: translateX(100%);
        transition: transform 0.5s ease;
        z-index: 1001;
      }

      aside.active {
        transform: translateX(0);
      }

      .pdfarea-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
      }

      .pdfarea-top-title {
        font-family: "Google Sans", sans-serif;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .pdfarea-top-icons {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        font-family: "Valley Sans", sans-serif;
        flex-shrink: 0;
      }

      .pdfarea-top-icons svg {
        width: 1.5rem;
        cursor: pointer;
      }

      .pdfarea-page {
        flex: 1;
        overflow: auto;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 0 1rem 1rem;
      }

      .pdfarea-page::-webkit-scrollbar {
        width: 5px;
        background-color: white;
      }

      .pdfarea-page::-webkit-scrollbar-thumb {
        background-color: #181818;
      }

      .pdfarea-sheet {
        position: relative;
      }

      canvas {
        display: block;
      }

      .pdfarea-highlights {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      .pdfarea-links {
        position: absolute;
        inset: 0;
      }

      .pdfarea-links a {
        position: absolute;
        cursor: pointer;
        border-radius: 2px;
      }

      .pdfarea-links a:hover {
        background-color: rgba(0, 120, 255, 0.15);
      }

      .pdfarea-highlights div {
        position: absolute;
        background-color: hsla(138, 74%, 39%, 0.3);
        border-bottom: 2px solid hsl(138, 74%, 39%);
        border-radius: 2px;
      }
    </style>

    <aside>
      <div class="pdfarea-top">
        <span class="pdfarea-top-title"></span>
        <div class="pdfarea-top-icons">
          <svg class="prev" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <title>chevron-left</title>
            <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
          </svg>
          <span class="pdfarea-info"></span>
          <svg class="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <title>chevron-right</title>
            <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
          </svg>
          <svg class="close" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <title>close</title>
            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
          </svg>
        </div>
      </div>
      <div class="pdfarea-page">
        <div class="pdfarea-sheet">
          <canvas></canvas>
          <div class="pdfarea-highlights"></div>
          <div class="pdfarea-links"></div>
        </div>
      </div>
    </aside>
    `

    this.shadow.querySelector('.prev').addEventListener('click', () => this.goTo(this.page - 1))
    this.shadow.querySelector('.next').addEventListener('click', () => this.goTo(this.page + 1))
    this.shadow.querySelector('.close').addEventListener('click', () => this.toggle(false))
  }

  // Mismo patrón que la sidebar: el panel y el <main> cambian de clase.
  toggle(active) {
    this.shadow.querySelector('aside').classList.toggle('active', active)
    document.querySelector('main').classList.toggle('pdf-open', active)
  }

  async open({ file, page, titulo, texto, caja }) {
    this.toggle(true)
    this.shadow.querySelector('.pdfarea-top-title').textContent = titulo || file
    this.highlight = texto || caja ? { page: Number(page), texto, caja } : null

    try {
      if (file !== this.file) {
        await this.pdf?.destroy()
        this.file = file
        this.pdf = await pdfjsLib.getDocument({
          url: `${import.meta.env.VITE_API_URL}/api/worker/pdfs/${encodeURIComponent(file)}`
        }).promise
      }

      await this.goTo(page)
    } catch (error) {
      this.file = null
      this.shadow.querySelector('.pdfarea-info').textContent = 'No se pudo abrir el PDF'
      console.log(error)
    }
  }

  async goTo(number) {
    if (!this.pdf) return

    const turno = ++this.turno
    const vigente = () => turno === this.turno

    this.page = Math.min(Math.max(1, Number(number) || 1), this.pdf.numPages)

    const page = await this.pdf.getPage(this.page)

    if (!vigente()) return

    const wrap = this.shadow.querySelector('.pdfarea-page')
    const canvas = this.shadow.querySelector('canvas')

    // Ajustar al ancho del panel y a la densidad de píxeles de la pantalla.
    const base = page.getViewport({ scale: 1 })
    const ratio = window.devicePixelRatio || 1
    const cssViewport = page.getViewport({ scale: (wrap.clientWidth - 32) / base.width })
    const viewport = page.getViewport({ scale: cssViewport.scale * ratio })

    // Si se pide otra página mientras se dibuja, cancelar la anterior.
    this.renderTask?.cancel()

    canvas.width = viewport.width
    canvas.height = viewport.height
    canvas.style.width = `${cssViewport.width}px`
    canvas.style.height = `${cssViewport.height}px`

    this.renderTask = page.render({ canvas, viewport })

    try {
      await this.renderTask.promise
    } catch (error) {
      if (error?.name !== 'RenderingCancelledException') throw error
      return
    }

    if (!vigente()) return

    this.shadow.querySelector('.pdfarea-info').textContent = `${this.page} / ${this.pdf.numPages}`

    const anotaciones = await page.getAnnotations()

    if (!vigente()) return

    this.drawLinks(anotaciones, cssViewport)

    // 1º la caja del OCR (sirve también para texto dentro de imágenes);
    // si no hay, buscar el párrafo en el texto del PDF.
    this.clearHighlight()
    let marcas = []

    if (this.highlight?.page === this.page) {
      if (this.highlight.caja) {
        marcas = this.drawBox(cssViewport, this.highlight.caja)
      } else if (this.highlight.texto) {
        const { items } = await page.getTextContent()

        if (!vigente()) return

        marcas = this.drawHighlight(items, cssViewport, this.highlight.texto)
      }
    }

    // Llevar la vista al párrafo; si no se encontró, al principio de la página.
    if (marcas?.length) {
      wrap.scrollTop = Math.max(0, marcas[0].offsetTop - 80)
    } else {
      wrap.scrollTop = 0
    }
  }

  // Enlaces del PDF clicables: los internos (índices) saltan a su página
  // y los externos se abren en otra pestaña.
  drawLinks(anotaciones, viewport) {
    const capa = this.shadow.querySelector('.pdfarea-links')
    capa.innerHTML = ''

    for (const anotacion of anotaciones.filter(a => a.subtype === 'Link')) {
      // Esquinas del enlace pasadas de coordenadas del PDF a píxeles del visor.
      const [x0, y0] = viewport.convertToViewportPoint(anotacion.rect[0], anotacion.rect[1])
      const [x1, y1] = viewport.convertToViewportPoint(anotacion.rect[2], anotacion.rect[3])
      const enlace = document.createElement('a')

      enlace.style.left = `${Math.min(x0, x1)}px`
      enlace.style.top = `${Math.min(y0, y1)}px`
      enlace.style.width = `${Math.abs(x1 - x0)}px`
      enlace.style.height = `${Math.abs(y1 - y0)}px`

      if (anotacion.dest) {
        enlace.title = 'Ir a la sección'
        enlace.addEventListener('click', async event => {
          event.preventDefault()

          const destino = typeof anotacion.dest === 'string'
            ? await this.pdf.getDestination(anotacion.dest)
            : anotacion.dest

          if (!destino) return

          const indice = typeof destino[0] === 'object'
            ? await this.pdf.getPageIndex(destino[0])
            : destino[0]

          this.goTo(indice + 1)
        })
      } else if (anotacion.url) {
        enlace.href = anotacion.url
        enlace.target = '_blank'
        enlace.rel = 'noopener'
        enlace.title = anotacion.url
      } else {
        continue
      }

      capa.append(enlace)
    }
  }

  // Rectángulo sobre el bloque del OCR; la caja viene en proporción (0 a 1).
  drawBox(viewport, [x0, y0, x1, y1]) {
    const margen = 4
    const marca = document.createElement('div')

    marca.style.left = `${x0 * viewport.width - margen}px`
    marca.style.top = `${y0 * viewport.height - margen}px`
    marca.style.width = `${(x1 - x0) * viewport.width + margen * 2}px`
    marca.style.height = `${(y1 - y0) * viewport.height + margen * 2}px`

    this.shadow.querySelector('.pdfarea-highlights').append(marca)
    return [marca]
  }

  clearHighlight() {
    this.shadow.querySelector('.pdfarea-highlights').innerHTML = ''
  }

  // Busca el párrafo en el texto de la página y dibuja un rectángulo
  // sobre cada trozo de texto que lo forma.
  drawHighlight(items, viewport, texto) {

    // Comparar solo letras y números: el texto viene del OCR
    // y puede diferir en espacios, saltos de línea o signos.
    const normalizar = text => text
      .toLocaleLowerCase('es')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{L}\p{N}]/gu, '')

    let textoPagina = ''

    const trozos = items.map(item => {
      const inicio = textoPagina.length
      textoPagina += normalizar(item.str || '')
      return { item, inicio, fin: textoPagina.length }
    })

    const buscado = normalizar(texto)

    if (!buscado) return []

    // Localizar el principio del párrafo (con prefijos cada vez más cortos)
    // y su final (con el sufijo), por si el OCR cambió alguna letra.
    let inicio = textoPagina.indexOf(buscado)
    let fin = inicio + buscado.length

    if (inicio < 0) {
      for (const largo of [60, 40, 25, 15]) {
        if (buscado.length < largo) continue

        inicio = textoPagina.indexOf(buscado.slice(0, largo))

        if (inicio >= 0) break
      }

      if (inicio < 0) return []

      const sufijo = buscado.slice(-25)
      const posicionSufijo = textoPagina.indexOf(sufijo, inicio)

      fin = posicionSufijo >= 0
        ? posicionSufijo + sufijo.length
        : Math.min(inicio + buscado.length, textoPagina.length)
    }

    const capa = this.shadow.querySelector('.pdfarea-highlights')

    return trozos
      .filter(trozo => trozo.fin > trozo.inicio && trozo.fin > inicio && trozo.inicio < fin)
      .map(({ item }) => {
        const [, , c, d, x, y] = pdfjsLib.Util.transform(viewport.transform, item.transform)
        const alto = Math.hypot(c, d)

        const marca = document.createElement('div')
        marca.style.left = `${x}px`
        marca.style.top = `${y - alto}px`
        marca.style.width = `${item.width * viewport.scale}px`
        marca.style.height = `${alto * 1.15}px`
        capa.append(marca)

        return marca
      })
  }
}

customElements.define('pdfarea-component', PdfArea);
