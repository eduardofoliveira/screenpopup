const express = require('express')
const app = express.Router()

const init = connection => {
  app.use(require('../middleware/authMiddleware'))

  app.get('/', async (req, res) => {
    if(req.session.user.tipo === 3){
      [dominios] = await connection.query('SELECT * FROM dominio')
    }else{
      [dominios] = await connection.query('SELECT * FROM dominio where id = ?', [req.session.user.fk_id_dominio])
    }
    
    let error = null
    res.render('dominios', {dominios, error})
  })

  app.post('/', async (req, res) => {
    const { dominio } = req.body

    if(!dominio){
      if(req.session.user.tipo === 3){
        [dominios] = await connection.query('SELECT * FROM dominio')
      }else{
        [dominios] = await connection.query('SELECT * FROM dominio where id = ?', [req.session.user.fk_id_dominio])
      }

      let error = 'Campo domínio deve ser preenchido'
      res.render('dominios', {dominios, error})
      return
    }

    let [existe] = await connection.query('SELECT * FROM dominio WHERE dominio = ?', [dominio])

    if(existe.length === 0){
      await connection.query('INSERT INTO dominio (dominio) values (?)', [dominio])
      res.redirect('/dominios')
    }else{
      if(req.session.user.tipo === 3){
        [dominios] = await connection.query('SELECT * FROM dominio')
      }else{
        [dominios] = await connection.query('SELECT * FROM dominio where id = ?', [req.session.user.fk_id_dominio])
      }
      
      let error = 'Domínio já existe'
      res.render('dominios', {dominios, error})
    }
  })

  app.delete('/:id', async (req, res) => {
    const { id } = req.params

    let [existe] = await connection.query('SELECT * FROM dominio WHERE id = ?', [id])
    if(existe.length === 1){
      await connection.query('DELETE FROM agenda WHERE fk_id_dominio = ?', [id])
      await connection.query('DELETE FROM usuario WHERE fk_id_dominio = ?', [id])
      await connection.query('DELETE FROM dominio WHERE id = ?', [id])
      res.statusCode = 202
      res.charset = 'utf-8'
      res.json({message: 'domínio deletado com sucesso !'})
    }else{
      res.statusCode = 204
      res.charset = 'utf-8'
      res.json({message: 'domínio não encontrado, erro na deleção'})
    }

  })

  return app
}

module.exports = init