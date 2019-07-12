require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const expressValidator = require("express-validator");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 80;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
  })
);
app.use(expressValidator());
app.use(require("./middleware/userToLocals"));

const home = require("./controller/home");
const login = require("./controller/login");
const usuarios = require("./controller/usuarios");
const dominios = require("./controller/dominios");
const contatos = require("./controller/contatos");
const chamada = require("./controller/chamada");
const chamados = require("./controller/chamados");

const init = async () => {
  try {
    const connection = await require("./service/mysql");

    app.use("/login", login(connection));
    app.use("/chamada", chamada(connection, io));
    app.use("/chamados", chamados(connection));
    app.use("/", home(connection));
    app.use("/usuarios", usuarios(connection));
    app.use("/dominios", dominios(connection));
    app.use("/contatos", contatos(connection));

    http.listen(port, error => {
      if (error) {
        console.log(error);
      } else {
        console.log(`App running at port ${port}`);
      }
    });
  } catch (error) {
    console.error(error);
    process.exit(0);
  }
};

init();

// Atualizado
