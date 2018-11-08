const express = require('express')
const app = express.Router()
const bcrypt = require('bcrypt')

const init = connection => {
  app.use(require('../middleware/authMiddleware'))

  app.get('/', async (req, res) => {
    const [usuarios] = await connection.query('SELECT usuario.id, ativo, nome, email, user_basix, dominio FROM usuario, dominio WHERE usuario.fk_id_dominio = dominio.id')
    res.render('usuarios', {usuarios})
  })

  app.get('/adicionar', async (req, res) => {
    const [dominios] = await connection.query('SELECT * FROM dominio')
    let errors = null
    let usuario = {nome: '', email: '', senha: '', senha_conf: '', dominio: '', user_basix: ''}
    res.render('usuarios-add', {dominios, errors, usuario})
  })

  app.post('/adicionar', async (req, res) => {
    const usuario = req.body

    req.assert('nome', 'Campo nome é obrigatório').notEmpty()
    req.assert('email', 'Endereço de e-mail inválido.').isEmail()
    req.assert('senha', 'A senha deve ter no minimo 8 caracteres').isLength({ min: 8 })
    req.assert('dominio', 'Selecione um domínio válido').notEmpty()
    req.checkBody('senha_conf', 'Confirmação de senha inválida.').equals(usuario.senha)

    let errors = req.validationErrors()
    if(errors){
      const [dominios] = await connection.query('SELECT * FROM dominio')
      res.render('usuarios-add', { dominios, errors, usuario })
      return
    }

    usuario.senha = await bcrypt.hash(usuario.senha, 12)

    await connection.query('INSERT INTO usuario (nome, email, senha, user_basix, fk_id_dominio) values (?, ?, ?, ?, ?)', [usuario.nome, usuario.email, usuario.senha, usuario.user_basix, usuario.dominio])
    res.redirect('/usuarios')
  })

  app.delete('/:id', async (req, res) => {
    const { id } = req.params

    let [existe] = await connection.query('SELECT * FROM usuario WHERE id = ?', [id])
    if(existe.length === 1){
      await connection.query('DELETE FROM usuario WHERE id = ?', [id])
      res.statusCode = 202
      res.charset = 'utf-8'
      res.json({message: 'usuário deletado com sucesso !'})
    }else{
      res.statusCode = 204
      res.charset = 'utf-8'
      res.json({message: 'usuário não encontrado, erro na deleção'})
    }

  })

  app.put('/ativar/:id', async (req, res) => {
    const { id } = req.params

    let [existe] = await connection.query('SELECT * FROM usuario WHERE id = ?', [id])
    if(existe.length === 1){
      await connection.query('UPDATE usuario set ativo = 1 where id = ?', [id])
      res.statusCode = 202
      res.charset = 'utf-8'
      res.json({message: 'usuário deletado com sucesso !'})
    }else{
      res.statusCode = 204
      res.charset = 'utf-8'
      res.json({message: 'usuário não encontrado, erro na deleção'})
    }

  })

  app.put('/desativar/:id', async (req, res) => {
    const { id } = req.params

    let [existe] = await connection.query('SELECT * FROM usuario WHERE id = ?', [id])
    if(existe.length === 1){
      await connection.query('UPDATE usuario set ativo = 0 where id = ?', [id])
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