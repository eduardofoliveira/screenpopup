const express = require('express')
const app = express.Router()

const init  = (connection, ) => {
  app.use(require('../middleware/authMiddleware'))

  app.delete('/:id', async (req, res) => {
    let { id } = req.params

    let [existe] = await connection.query('SELECT * FROM chamado WHERE id = ?', [id])
    if(existe.length === 1){
      await connection.query('DELETE FROM chamado where id = ?', [id])
      res.statusCode = 202
      res.charset = 'utf-8'
      res.json({message: 'chamado deletado com sucesso !'})
    }else{
      res.statusCode = 204
      res.charset = 'utf-8'
      res.json({message: 'chamado não encontrado, erro na deleção'})
    }
  })

  app.put('/:id', async (req, res) => {
    let { id } = req.params
    let chamado = req.body

    let [existe] = await connection.query('SELECT * FROM chamado WHERE id = ?', [id])
    if(existe.length === 1){
      await connection.query('UPDATE chamado set aberto = 0, comentario = ?, fk_fechado_por = ? where id = ?', [chamado.comentario, req.session.user.id, id])

      res.statusCode = 200
      res.charset = 'utf-8'
      res.json({message: 'chamado atualizado'})
    }else{
      res.statusCode = 404
      res.charset = 'utf-8'
      res.json({message: 'erro ao atualizar chamado'})
    }
  })

  return app
}

module.exports = init