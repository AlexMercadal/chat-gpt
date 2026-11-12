const OpenAI = require("openai")
const searchService = require('../../services/search-service.js')

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

exports.create = async (req, res, next) => {
  try {
    const pregunta = String(req.body.prompt || '').trim()

    if (!pregunta) {
      return res.status(400).send({ message: 'Escribe una pregunta.' })
    }

    // 1. Buscar los párrafos más parecidos en los PDFs.
    const resultados = await searchService.search(pregunta, 5)
    const sources = resultados.map((resultado, i) => ({ n: i + 1, ...resultado }))

    // 2. Numerarlos para que el modelo pueda citarlos con [n].
    const contexto = sources
      .map(source =>
        `[${source.n}] ${source.titulo}${source.seccion ? ' › ' + source.seccion : ''} (página ${source.pagina})\n${source.texto}`
      )
      .join('\n\n')

    // 3. Responder solo con esa documentación.
    // Prompt guardado en OpenAI si está configurado; si no, el modelo directamente.
    const modelo = process.env.OPENAI_PROMPT_ID
      ? { prompt: { id: process.env.OPENAI_PROMPT_ID } }
      : { model: process.env.OPENAI_CHAT_MODEL }

    const response = await openai.responses.create({
      ...modelo,
      input: [
        {
          role: 'developer',
          content:
            'Responde usando solo la documentación siguiente. ' +
            'Cita las fuentes con [n]. Si la respuesta no está, dilo.\n\n' +
            (contexto || 'No se encontraron fragmentos relevantes.')
        },
        {
          role: 'user',
          content: pregunta
        }
      ]
    })

    res.status(200).send({ answer: response.output_text, sources })
  } catch (err) {
    next(err)
  }
}

exports.findAll = async (req, res, next) => {
  try {
    const result = [
      { name: "hola" },
      { name: "adios" }
    ]

    res.status(200).send(result)
  } catch (err) {
    next(err)
  }
}
