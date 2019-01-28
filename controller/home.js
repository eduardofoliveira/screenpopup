const express = require('express')
const app = express.Router()

const init = connection => {
  app.use(require('../middleware/authMiddleware'))

  app.get('/', async (req, res) => {

    let [chamados] = await connection.query(`
      SELECT
        distinct chamado.id,
        de,
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
      ASC`, [req.session.user.id])

    res.render('index', {chamados})
  })

  return app
}

module.exports = init