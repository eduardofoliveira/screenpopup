const express = require("express");
const app = express.Router();
const axios = require("axios");
const querystring = require("querystring");

const api = axios.create({
  baseURL: "https://api.netoffice.com.br/v1/"
});

const init = (connection, io) => {
  app.get("/:from/:to/:user/:domain/:callid/:event", async (req, res) => {
    const parametros = req.params;

    if (parametros.event === "RINGING") {
      res.send();
      let [[descricoes]] = await connection.query(
        `
      select
        (select descricao from agenda, dominio where did = ? and agenda.fk_id_dominio = dominio.id and dominio.dominio = ?) as desc_from,
        (select descricao from agenda, dominio where did = ? and agenda.fk_id_dominio = dominio.id and dominio.dominio = ?) as desc_to,
        (select fraseologia from agenda, dominio where did = ? and agenda.fk_id_dominio = dominio.id and dominio.dominio = ?) as script,
        (SELECT usuario.id FROM dominio, usuario WHERE usuario.fk_id_dominio = dominio.id AND dominio.dominio = ? AND usuario.user_basix = ?) AS id_usuario,
        (SELECT dominio.id FROM dominio, usuario WHERE usuario.fk_id_dominio = dominio.id AND dominio.dominio = ? AND usuario.user_basix = ?) AS id_dominio
      `,
        [
          parametros.from,
          parametros.domain,
          parametros.to,
          parametros.domain,
          parametros.to,
          parametros.domain,
          parametros.domain,
          parametros.user,
          parametros.domain,
          parametros.user
        ]
      );

      parametros.fromComment = descricoes.desc_from ? descricoes.desc_from : "";
      parametros.toComment = descricoes.desc_to ? descricoes.desc_to : "";
      parametros.script = descricoes.script ? descricoes.script : "";

      if (Number.isInteger(descricoes.id_usuario) && Number.isInteger(descricoes.id_dominio)) {
        let [chamado] = await connection.query(
          "INSERT INTO chamado (de, para, call_id, fk_id_usuario, fk_id_dominio) VALUES (?, ?, ?, ?, ?)",
          [parametros.from, parametros.to, parametros.callid, descricoes.id_usuario, descricoes.id_dominio]
        );
        parametros.id = chamado.insertId;

        io.emit(`${parametros.domain}-${parametros.user}`, parametros);
      }

      return;
    }
    if (parametros.event === "DISCONNECTED") {
      res.send();
      connection.query("UPDATE chamado SET termino = now() WHERE call_id = ?", [parametros.callid]);
      return;
    }
    res.send();
  });

  app.get("/:from/:to/:user/:domain/:callid/:event/:history", async (req, res) => {
    res.send();

    let { from, history, user, domain } = req.params;

    let [[retorno]] = await connection.query(
      "SELECT dendron_operador, dendron_token FROM usuario WHERE user_basix = ? and fk_id_dominio = (SELECT id FROM dominio WHERE dominio = ?)",
      [user, domain]
    );

    let response = await api.get("/GetClientes", { headers: { token: retorno.dendron_token } });

    let clienteId = response.data.reduce((retorno, item) => {
      if (item.telefone1) {
        if (item.telefone1.replace(/\(|\)| |-/g, "") === from) {
          retorno = item.id;
        }
      }
      if (item.telefone2) {
        if (item.telefone2.replace(/\(|\)| |-/g, "") === from) {
          retorno = item.id;
        }
      }

      return retorno;
    });

    if (clienteId) {
      response = await api.post(
        "/AddTicket",
        querystring.stringify({
          usuario: "api",
          operador: retorno.dendron_operador,
          assunto: history.split(".")[history.split(".").length - 1],
          descricao: history.split(".").join(" -> "),
          cliente_id: clienteId
        }),
        {
          headers: {
            token: retorno.dendron_token,
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      );
    } else {
      response = await api.post(
        "/AddTicket",
        querystring.stringify({
          usuario: "api",
          operador: retorno.dendron_operador,
          assunto: history.split(".")[history.split(".").length - 1],
          descricao: history.split(".").join(" -> ")
        }),
        {
          headers: {
            token: retorno.dendron_token,
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      );
    }
  });

  return app;
};

module.exports = init;
