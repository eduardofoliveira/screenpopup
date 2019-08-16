const express = require('express')
const app = express.Router()

const init = connection => {
  app.use(require('../middleware/authMiddleware'))

  app.get('/', async (req, res) => {
    let [campos] = await connection.query(
      `
    SELECT
      nome_campo
    FROM
      template_agenda
    WHERE
      fk_id_dominio = ?
    `,
      [req.session.user.fk_id_dominio]
    )

    campos = campos.map(item => {
      return item.nome_campo
    })

    res.render('template-contato', { campos })
  })

  app.post('/', async (req, res) => {
    let itens = Object.keys(req.body)

    for (let i = 0; i < itens.length; i++) {
      const element = itens[i]

      let [[existe]] = await connection.query(
        `
        SELECT
          nome_campo
        FROM
          template_agenda
        WHERE
          fk_id_dominio = ? and
          nome_campo = ?
        `,
        [req.session.user.fk_id_dominio, element]
      )

      if (!existe) {
        await connection.query(`INSERT INTO template_agenda (nome_campo, fk_id_dominio) values (?, ?)`, [
          element,
          req.session.user.fk_id_dominio
        ])
      }
    }

    let [campos] = await connection.query('SELECT nome_campo FROM template_agenda WHERE fk_id_dominio = ?', [
      req.session.user.fk_id_dominio
    ])

    campos = campos.map(item => {
      return item.nome_campo
    })

    campos = campos.filter(item => {
      return !itens.includes(item)
    })

    if (campos.length > 0) {
      await connection.query(`DELETE FROM template_agenda WHERE nome_campo in (?) and fk_id_dominio = ?`, [
        campos,
        req.session.user.fk_id_dominio
      ])
    }

    return res.redirect('/template-contato')
  })

  return app
}

module.exports = init
