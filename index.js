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

const init = async () => {
  const connection = await require('./service/mysql')

  app.get('/chamada/:from/:to/:user/:domain', (req, res) => {
    const parametros = req.params
    parametros.fromComment = 'Celular Eduardo'
    parametros.toComment = 'Numero CloudComunicação'
    parametros.script = `1° Efetuar o atendimento do suporte técnico se apresentando...
    2° Resolva o problema
    3° Não se esqueça de abrir o chamado`

    io.emit(parametros.domain, parametros)
    res.send()
  })

  app.use('/login', login(connection))
  app.use('/', home(connection))
  app.use('/usuarios', usuarios(connection))
  app.use('/dominios', dominios(connection))

  http.listen(port, (error) => {
    if(error){
      console.log(error)
    }else{
      console.log(`App running at port ${port}`)
    }
  })
}

init()