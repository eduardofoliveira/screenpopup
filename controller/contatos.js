const express = require('express')
const app = express.Router()

const init = connection => {
  app.use(require('../middleware/authMiddleware'))

  app.get('/', async (req, res) => {
    let [contatos] = await connection.query('SELECT * FROM agenda WHERE fk_id_dominio = ? order by did asc',  [req.session.user.fk_id_dominio])
    res.render('contatos', { contatos })
  })

  app.get('/adicionar', (req, res) => {
    let contato = { did: '', descricao: '', fraseologia: '' }
    let errors = null
    res.render('contatos-add', { contato, errors })
  })

  app.post('/adicionar', async (req, res) => {
    let contato = req.body

    req.assert('did', 'O numero deve ser preenchido').notEmpty()
    req.assert('descricao', 'Forneça uma descrição para o numero').notEmpty()

    let errors = req.validationErrors()
    if(errors){
      res.render('contatos-add', { contato, errors })
    }else{
      await connection.query('INSERT INTO agenda (did, descricao, fraseologia, fk_id_dominio) VALUES (?, ?, ?, ?)', [contato.did, contato.descricao, contato.fraseologia, req.session.user.fk_id_dominio])
      res.redirect('/contatos')
    }
  })

  app.get('/editar/:id', async (req, res) => {
    let { id } = req.params

    let [contato] = await connection.query('SELECT * FROM agenda WHERE id = ? and fk_id_dominio = ?', [id, req.session.user.fk_id_dominio])
    if(contato.length === 1){
      errors = null
      contato = contato[0]
      res.render('contatos-edt', { contato, errors })
    }else{
      let [contatos] = await connection.query('SELECT * FROM agenda WHERE fk_id_dominio = ? order by did asc',  [req.session.user.fk_id_dominio])
      res.render('contatos', { contatos })
    }
  })

  app.post('/editar/:id', async (req, res) => {
    let { id } = req.params
    let contato = req.body

    req.assert('did', 'O numero deve ser preenchido').notEmpty()
    req.assert('descricao', 'Forneça uma descrição para o numero').notEmpty()

    let errors = req.validationErrors()
    if(errors){
      res.render('contatos-edt', { contato, errors })
    }else{
      await connection.query('UPDATE agenda set did = ?, descricao = ?, fraseologia = ? WHERE id = ? and fk_id_dominio = ?', [contato.did, contato.descricao, contato.fraseologia, id, req.session.user.fk_id_dominio])
      res.redirect('/contatos')
    }
  })

  app.delete('/:id', async (req, res) => {
    let { id } = req.params

    let [existe] = await connection.query('SELECT * FROM agenda WHERE id = ?', [id])
    if(existe.length === 1){
      await connection.query('DELETE FROM agenda where id = ?', [id])
      res.statusCode = 202
      res.charset = 'utf-8'
      res.json({message: 'usuário deletado com sucesso !'})
    }else{
      res.statusCode = 204
      res.charset = 'utf-8'
      res.json({message: 'usuário não encontrado, erro na deleção'})
    }
  })

  return app
}

module.exports = init