require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const app = express()
const port = process.env.PORT || process.env.WEB_PORT

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'))
app.use(session({
  secret: 'B@lpha9001',
  resave: true,
  saveUninitialized: true
}))

const home = require('./controller/home')
const login = require('./controller/login')
const usuarios = require('./controller/usuarios')

const init = async () => {
  const connection = await require('./service/mysql')

  app.use('/login', login(connection))
  app.use('/', home(connection))
  app.use('/usuarios', usuarios(connection))
  

  app.listen(port, (error) => {
    if(error){
      console.log(error)
    }else{
      console.log(`App running at port ${port}`)
    }
  })
}

init()