const express = require('express')
const app = express.Router()

const init = connection => {
  app.use(require('../middleware/authMiddleware'))

  app.get('/', async (req, res) => {
    const [usuarios] = await connection.query('SELECT nome, email, fk_id_dominio FROM usuario')
    res.render('usuarios', {usuarios})
  })

  return app
}

module.exports = init