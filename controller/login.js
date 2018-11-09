const express = require('express')
const bcrypt = require('bcryptjs')
const app = express.Router()

const init = connection => {
  app.get('/', (req, res) => {
    res.render('login', { error: null })
  })

  app.post('/', async (req, res) => {
    let { email, senha} = req.body

    if(!email || !senha){
      res.render('login', { error: true })
    }

    //Gerar com peso 12
    //senha = await bcrypt.hash(senha, 12)
    //console.log(senha)

    const [user] = await connection.query('select usuario.id, nome, email, senha, dominio, fk_id_dominio from usuario, dominio where usuario.fk_id_dominio = dominio.id and email = ? and ativo = 1', [email])

    if(user.length < 1){
      res.render('login', { error: true })
      return
    }

    if(await bcrypt.compare(senha, user[0].senha)){
      delete user[0].senha
      req.session.user = user[0]
      res.redirect('/')
    }else{
      res.render('login', { error: true })
    }
  })

  app.get('/logoff', (req, res) => {
    req.session.destroy(() => {
      res.redirect('/login')
    })
  })

  return app
}

module.exports = init