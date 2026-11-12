class Chat extends HTMLElement {

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    this.title = this.getAttribute('title')
    this.color = this.getAttribute('color')
    this.message = this.getAttribute('message')
  }

  connectedCallback() {
    this.render()
  }

  render() {
    this.shadow.innerHTML =
    /*html*/`
    <style>
      * {
        box-sizing: border-box;
      }


      body {
        margin: 0;
      }

      main {
        display: flex;
        flex-direction: column;
        gap: 10vh;
        padding-left: 5rem;
        padding-right: 5rem;
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      p,
      a {
        margin: 0;
        color: white
      }

      ul,
      ol {
        margin: 0;
        padding: 0;
        list-style: none;
        color: white
      }

      span {
        color: white
      }

      svg {
        fill: white
      }

      a {
        color: inherit;
        text-decoration: none;
      }

      button {
        all: unset;
        cursor: pointer;
      }

      .main-chat {
        height: 70vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 2rem;
      }

      .main-chat-title h1 {
        font-family: "Google Sans", sans-serif;
        font-size: 2rem;
        text-align: center;
      }

      .main-chat-form {
        width: 70%;
      }

      .main-chat-form textarea {
        width: 100%;
        height: 10vh;
        background-color: #181818;
        padding: 1rem 3rem;
        border-radius: 10px;
        position: relative;
        border: 1px solid white;
        align-content: center;
        justify-content: center;
      }

      .main-chat-form textarea::placeholder {
        color: white;
        font-family: "Valley Sans", sans-serif;
      }

      .text {
        color: white;
        font-family: "Valley Sans", sans-serif;
      }


      .main-chat-form-icons {
        position: absolute;
        width: 47%;
        height: 10%;
        cursor: pointer;
      }

      .main-chat-form-icons :first-child {
        position: absolute;
        top: -6.3vh;
        left: 0.5rem;
      }

      .main-chat-form-icons :last-child {
        position: absolute;
        top: -6.3vh;
        right: 0;
      }

      .main-chat-form-icons svg {
        width: 2.5%;
      }

      .main-chat.conversation {
        height: 95vh;
        justify-content: flex-end;
      }

      .main-chat.conversation .main-chat-title {
        display: none;
      }

      .main-chat-messages {
        width: 70%;
        min-height: 0;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .main-chat-messages::-webkit-scrollbar {
        width: 5px;
        background-color: white;
      }

      .main-chat-messages::-webkit-scrollbar-thumb {
        background-color: #181818;
      }

      .message {
        color: white;
        font-family: "Valley Sans", sans-serif;
        white-space: pre-wrap;
        padding: 0.8rem 1rem;
        border-radius: 10px;
      }

      .message.user {
        align-self: flex-end;
        background-color: #313131;
      }

      .message code {
        font-family: Consolas, monospace;
        font-size: 0.9em;
        padding: 0.05rem 0.3rem;
        border-radius: 4px;
        background-color: #313131;
      }

      .message-sources {
        margin-top: 1.2rem;
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        white-space: normal;
      }

      .message-sources-title {
        font-family: "Google Sans", sans-serif;
        font-size: 1rem;
      }

      .source {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        padding: 0.8rem 1rem;
        border: 1px solid #313131;
        border-left: 3px solid #313131;
        border-radius: 10px;
        cursor: pointer;
        font-family: "Valley Sans", sans-serif;
        font-size: 0.9rem;
      }

      .source:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }

      .source.active {
        border-left-color: hsl(138, 74%, 39%);
        background-color: rgba(255, 255, 255, 0.05);
      }

      .source-title {
        font-family: "Google Sans", sans-serif;
        font-size: 1rem;
      }

      .source-label {
        color: #9a9a9a;
      }

      .source-index {
        color: #9a9a9a;
        font-style: italic;
      }

      .source-preview {
        color: #d6d6d6;
        line-height: 1.4;
      }

      .source-page {
        color: hsl(138, 74%, 39%);
      }

      .source-link {
        color: #9a9a9a;
        text-decoration: underline;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

    </style>

     <div class="main-chat">
      <div class="main-chat-title">
        <h1>¿En qué puedo ayudar, Alex?</h1>
      </div>

      <div class="main-chat-messages"></div>

      <div class="main-chat-form">
        <form action="">
          <textarea name="prompt" class="text" placeholder="Escribe un mensaje..."></textarea>
          <div class="main-chat-form-icons">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <title>file-upload-outline</title>
              <path
                d="M14,2L20,8V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2H14M18,20V9H13V4H6V20H18M12,12L16,16H13.5V19H10.5V16H8L12,12Z" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <title>send-variant-outline</title>
              <path d="M3 20V4L22 12M5 17L16.85 12L5 7V10.5L11 12L5 13.5M5 17V7 13.5Z" />
            </svg>
          </div>
        </form>
      </div>
    </div>
    `

    const form = this.shadow.querySelector('form')
    const textarea = form.querySelector('textarea')
    const sendFormButton = this.shadow.querySelector('.main-chat-form-icons > svg:last-child')

    const send = async () => {
      const prompt = textarea.value.trim()
      if (!prompt) return

      this.shadow.querySelector('.main-chat').classList.add('conversation')
      this.addMessage('user', prompt)
      form.reset()

      const pending = this.addMessage('assistant', 'Buscando en la documentación…')

      try {
        const result = await fetch(`${import.meta.env.VITE_API_URL}/api/worker/chats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ prompt })
        })

        if (!result.ok) {
          const { message } = await result.json().catch(() => ({}))
          throw new Error(message || `Error ${result.status}`)
        }

        const { answer, sources } = await result.json()

        pending.innerHTML = this.formatAnswer(answer)
        pending.append(this.renderSources(sources))
        pending.scrollIntoView({ block: 'end' })

        // Abre directamente la mejor coincidencia.
        if (sources.length) this.openPdf(sources[0])
      } catch (error) {
        pending.textContent = `No se pudo obtener respuesta: ${error.message}`
        console.log(error)
      }
    }

    sendFormButton.addEventListener('click', event => {
      event.preventDefault()
      send()
    })

    form.addEventListener('submit', event => {
      event.preventDefault()
      send()
    })

    textarea.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        send()
      }
    })
  }

  addMessage(role, text) {
    const message = document.createElement('div')
    message.className = `message ${role}`
    message.textContent = text
    this.shadow.querySelector('.main-chat-messages').append(message)
    message.scrollIntoView({ block: 'end' })
    return message
  }

  // Escapa el HTML y convierte solo **negrita** y `código` del Markdown.
  formatAnswer(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`\n]+)`/g, '<code>$1</code>')
  }

  // Mismo recorte que indexer/src/buscar.ts: 450 caracteres sin cortar palabras.
  preview(texto, limite = 450) {
    const textoLimpio = (texto || '').replace(/\s+/g, ' ').trim()

    return textoLimpio.length > limite
      ? textoLimpio.slice(0, limite).replace(/\s+\S*$/, '') + '…'
      : textoLimpio
  }

  // Cada resultado en el mismo orden que buscar.ts:
  // título, apartado, vista previa, página del PDF completo y enlace.
  renderSources(sources) {
    const ul = document.createElement('ul')
    ul.className = 'message-sources'

    if (!sources.length) return ul

    const title = document.createElement('li')
    title.className = 'message-sources-title'
    title.textContent = 'Resultados'
    ul.append(title)

    sources.forEach(source => {
      const card = document.createElement('li')
      card.className = 'source'

      const add = (className, text) => {
        const element = document.createElement('span')
        element.className = className
        element.textContent = text
        card.append(element)
        return element
      }

      add('source-title', `${source.n}. ${source.titulo}`)

      // El buscador encontró una entrada de índice y siguió su enlace.
      if (source.indice) {
        add('source-index', `Encontrado en el índice de «${source.indice.titulo}» (pág. ${source.indice.pagina}): ${source.indice.texto.replace(/^[-•]\s*/, '')}`)
      }

      if (source.seccion) {
        add('source-section', `Apartado: ${source.seccion}`)
      }

      add('source-label', 'Vista previa:')
      add('source-preview', this.preview(source.texto) || 'No hay texto guardado para este resultado.')
      add('source-page', `Página del PDF completo: ${source.pagina}`)

      if (source.url) {
        const link = document.createElement('a')
        link.className = 'source-link'
        link.href = source.url
        link.target = '_blank'
        link.rel = 'noopener'
        link.textContent = `Enlace: ${source.url}`
        link.addEventListener('click', event => event.stopPropagation())
        card.append(link)
      }

      card.addEventListener('click', () => this.openPdf(source))
      source.card = card
      ul.append(card)
    })

    return ul
  }

  openPdf(source) {
    this.shadow.querySelectorAll('.source.active').forEach(card => card.classList.remove('active'))
    source.card?.classList.add('active')

    document.dispatchEvent(new CustomEvent('open-pdf', {
      detail: {
        file: source.archivo,
        page: source.pagina,
        titulo: source.titulo,
        texto: source.texto,
        caja: source.caja
      }
    }))
  }
}

customElements.define('chat-component', Chat);
