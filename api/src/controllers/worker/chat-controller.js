const OpenAI = require("openai")

exports.create = async (req, res, next) => {
  try {
    const openai = new OpenAI({
      apikey: process.env.OPENAI_API_KEY
    })

    const response = await openai.responses.create({
      prompt: {
        "id": "pmpt_6ae4b8a3beec8196b8fa9a2a54fa85310c9187d3627ab2aa"
      },
      input: req.body.prompt,
    })

    res.status(200).send(response.output_text)
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