const express = require('express')
const app = express.Router()

const init = connection => {
  app.use(require('../middleware/authMiddleware'))

  app.get('/', (req, res) => {
    res.render('index')
  })

  return app
}

module.exports = init