const express = require('express')
const app = express()

const routes = require('./routes')
app.use(express.json({ limit: '10mb', extended: true }))
app.use('/api', routes)

// Errores en JSON con un mensaje claro, en lugar de la página HTML con la traza.
// La traza completa se sigue viendo en la terminal de la API.
app.use((err, req, res, next) => {
  console.error(err)

  let message = err.message || 'Error interno del servidor.'

  if (err.name === 'ChromaConnectionError') {
    message = 'No se pudo conectar con ChromaDB. Comprueba que está arrancado en el puerto 8001.'
  } else if (err.status === 401) {
    message = 'La clave de OpenAI no es válida.'
  } else if (err.status === 404 && req.path.startsWith('/api/worker/pdfs')) {
    message = 'No se encontró el PDF.'
  }

  res.status(err.status >= 400 && err.status < 600 ? err.status : 500).send({ message })
})

module.exports = app