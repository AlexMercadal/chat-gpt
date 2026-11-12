const express = require('express')
const router = express.Router()

router.use('/worker/chats', require('./worker/chats'))
router.use('/worker/pdfs', require('./worker/pdfs'))

module.exports = router

