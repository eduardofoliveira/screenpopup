const express = require('express')
const app = express.Router()

const init = connection => {
  app.use(require('../middleware/authMiddleware'))

  app.get('/', async (req, res) => {
    const [usuarios] = await connection.query('SELECT ativo, nome, email, user_basix, dominio FROM usuario, dominio WHERE usuario.fk_id_dominio = dominio.id')
    res.render('usuarios', {usuarios})
  })

  app.get('/adicionar', (req, res) => {
    res.render('usuarios-add')
  })

  app.post('/adicionar', (req, res) => {
    
  })

  return app
}

module.exports = init