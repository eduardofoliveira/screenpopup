require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const cors = require('cors')
const expressValidator = require('express-validator')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
// io.origins(['http://contact.cloudcom.com.br']);
const port = process.env.PORT || 80

const init = async () => {
  try {
    const connection = await require('./service/mysql')

    app.set('view engine', 'ejs')
    app.use(cors())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    app.use(express.static('public'))
    app.use(
      session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true
      })
    )
    app.use(expressValidator())
    app.use(require('./middleware/userToLocals'))
    app.use(require('./middleware/includeMiddleware')(connection, io))

    const home = require('./controller/home')
    const login = require('./controller/login')
    const usuarios = require('./controller/usuarios')
    const dominios = require('./controller/dominios')
    const contatos = require('./controller/contatos')
    const chamada = require('./controller/chamada')
    const chamados = require('./controller/chamados')
    const templateContato = require('./controller/template-contato')

    app.use('/login', login(connection))
    app.use('/chamada', chamada())
    app.use('/chamados', chamados(connection))
    app.use('/', home(connection))
    app.use('/usuarios', usuarios(connection))
    app.use('/dominios', dominios(connection))
    app.use('/contatos', contatos(connection))
    app.use('/template-contato', templateContato(connection))

    http.listen(port, error => {
      if (error) {
        console.log(error)
      } else {
        console.log(`App running at port ${port}`)
      }
    })
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
}

init()
