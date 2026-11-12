const express = require('express')
const router = express.Router()
const controller = require('../../controllers/worker/pdf-controller.js')

router.get('/:file', controller.findOne)

module.exports = router
