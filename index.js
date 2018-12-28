require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const expressValidator = require('express-validator')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = process.env.PORT || process.env.WEB_PORT

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'))
app.use(session({
  secret: 'B@lpha9001',
  resave: true,
  saveUninitialized: true
}))
app.use(expressValidator())
app.use(require('./middleware/userToLocals'))

const home = require('./controller/home')
const login = require('./controller/login')
const usuarios = require('./controller/usuarios')
const dominios = require('./controller/dominios')
const contatos = require('./controller/contatos')

const init = async () => {
  const connection = await require('./service/mysql')

  app.get('/chamada/:from/:to/:user/:domain', async (req, res) => {
    const parametros = req.params

    let [fromComment] = await connection.query('SELECT descricao FROM agenda, dominio WHERE agenda.fk_id_dominio = dominio.id and did = ? and dominio.dominio = ?', [parametros.from, parametros.domain])
    if(fromComment.length === 1){
      parametros.fromComment = fromComment[0].descricao
    }else{
      parametros.fromComment = ''
    }
    
    let [to] = await connection.query('SELECT descricao, fraseologia FROM agenda, dominio WHERE agenda.fk_id_dominio = dominio.id and did = ? and dominio.dominio = ?', [parametros.to, parametros.domain])
    if(to.length === 1){
      parametros.toComment = to[0].descricao
      parametros.script = to[0].fraseologia
    }else{
      parametros.toComment = ''
      parametros.script = ''
    }

    io.emit(`${parametros.domain}-${parametros.user}`, parametros)
    res.send()
  })

  app.use('/login', login(connection))
  app.use('/', home(connection))
  app.use('/usuarios', usuarios(connection))
  app.use('/dominios', dominios(connection))
  app.use('/contatos', contatos(connection))

  http.listen(port, (error) => {
    if(error){
      console.log(error)
    }else{
      console.log(`App running at port ${port}`)
    }
  })
}

init()

// Action GET para testar
// http://192.168.0.31/chamada/11999683333/551137115000/Eduardo/cloud.cloudcom.com.br