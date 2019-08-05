const express = require("express");
const app = express.Router();

const init = connection => {
  app.use(require("../middleware/authMiddleware"));

  app.get("/", async (req, res) => {
    let [chamados] = await connection.query(
      `
      SELECT
        distinct chamado.id,
        de,
        de.id as from_id,
        para,
        comentario,
        de.descricao as de_descricao,
        para.fraseologia as para_script,
        para.descricao as para_descricao
      FROM
        chamado
      LEFT JOIN
        agenda as de
      ON
        chamado.de = de.did
      LEFT JOIN
        agenda as para
      ON
        chamado.para = para.did
      WHERE
        chamado.aberto = 1 AND
        chamado.fk_id_usuario = ?
      ORDER BY
        chamado.id
      ASC`,
      [req.session.user.id]
    );

    for (let i = 0; i < chamados.length; i++) {
      const item = chamados[i];

      const [detalhes] = await connection.query(
        `
        SELECT
          *
        FROM
          campos_agenda
        WHERE
          fk_id_agenda = ?`,
        [item.from_id]
      );

      item.detalhes = detalhes;
      chamados[i] = item;
    }

    for (let i = 0; i < chamados.length; i++) {
      const item = chamados[i];

      let [historico] = await connection.query(
        `
      SELECT
        chamado.id,
        comentario,
        inicio,
        replace(replace(aberto, 1, 'Aberto'), 0, 'Fechado') as status,
        usuario.nome
      FROM
        chamado,
        usuario
      WHERE
        chamado.fk_id_usuario = usuario.id and
        chamado.fk_id_dominio = ? and
        de = ?
      ORDER BY
        inicio DESC
      limit 10
      `,
        [req.session.user.fk_id_dominio, item.de]
      );

      historico = historico.map(item => {
        item.inicio = item.inicio = `${item.inicio.getDate()}/${(item.inicio.getMonth() + 1)
          .toString()
          .padStart(2, "0")}/${item.inicio.getFullYear()} ${item.inicio
          .getHours()
          .toString()
          .padStart(2, "0")}:${item.inicio
          .getMinutes()
          .toString()
          .padStart(2, "0")}:${item.inicio
          .getSeconds()
          .toString()
          .padStart(2, "0")}`;

        return item;
      });

      item.historico = historico;
      chamados[i] = item;
    }

    res.render("index", { chamados });
  });

  return app;
};

module.exports = init;
