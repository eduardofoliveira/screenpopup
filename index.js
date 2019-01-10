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
const chamada = require('./controller/chamada')

const init = async () => {
  const connection = await require('./service/mysql')

  app.use('/login', login(connection))
  app.use('/chamada', chamada(connection, io))
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