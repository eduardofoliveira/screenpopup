const express = require('express')
const app = express.Router()

const init = connection => {
  app.use(require('../middleware/authMiddleware'))

  app.get('/', async (req, res) => {
    let pageSize = req.query.pageSize || 10
    let currentPage = req.query.page || 0
    let offset = currentPage * pageSize
    let SearchTerm = req.query.term || null
    let searchNumber = req.query.number || null

    let [[quantidade]] = await connection.query('SELECT count(*) as total FROM agenda WHERE fk_id_dominio = ?', [
      req.session.user.fk_id_dominio
    ])

    let totalPages = parseInt(quantidade.total / pageSize)
    let contatos = null

    if (!SearchTerm && !searchNumber) {
      let [contatosBanco] = await connection.query(
        `SELECT * FROM agenda WHERE fk_id_dominio = ? order by did asc limit ${offset}, ${pageSize}`,
        [req.session.user.fk_id_dominio]
      )

      contatos = contatosBanco
    } else if (SearchTerm && !searchNumber) {
      let [contatosBanco] = await connection.query(
        `SELECT * FROM agenda WHERE fk_id_dominio = ? and descricao like ? order by did asc limit ${offset}, ${pageSize}`,
        [req.session.user.fk_id_dominio, `%${SearchTerm}%`]
      )

      contatos = contatosBanco
    } else if (!SearchTerm && searchNumber) {
      let [contatosBanco] = await connection.query(
        `SELECT * FROM agenda WHERE fk_id_dominio = ? and did like ? order by did asc limit ${offset}, ${pageSize}`,
        [req.session.user.fk_id_dominio, `%${searchNumber}%`]
      )

      contatos = contatosBanco
    } else {
      let [contatosBanco] = await connection.query(
        `SELECT * FROM agenda WHERE fk_id_dominio = ? and did like ? and descricao like ? order by did asc limit ${offset}, ${pageSize}`,
        [req.session.user.fk_id_dominio, `%${searchNumber}%`, `%${SearchTerm}%`]
      )

      contatos = contatosBanco
    }

    res.render('contatos', { contatos, pagination: { pages: totalPages, pageSize, currentPage } })
  })

  app.get('/adicionar', async (req, res) => {
    let contato = { did: '', descricao: '', fraseologia: '' }
    let [custom] = await connection.query('SELECT nome_campo FROM template_agenda WHERE fk_id_dominio = ?', [
      req.session.user.fk_id_dominio
    ])
    custom = custom.map(item => {
      return item.nome_campo
    })
    let errors = null
    res.render('contatos-add', { contato, errors, custom })
  })

  app.post('/adicionar', async (req, res) => {
    let contato = req.body

    req.assert('did', 'O numero deve ser preenchido').notEmpty()
    req.assert('descricao', 'Forneça uma descrição para o numero').notEmpty()

    let errors = req.validationErrors()
    if (errors) {
      res.render('contatos-add', { contato, errors })
    } else {
      let contatoBanco = await connection.query(
        'INSERT INTO agenda (did, descricao, fraseologia, fk_id_dominio) VALUES (?, ?, ?, ?)',
        [contato.did, contato.descricao, contato.fraseologia, req.session.user.fk_id_dominio]
      )

      let campos = Object.keys(contato).filter(item => {
        return !['did', 'descricao', 'fraseologia'].includes(item)
      })

      for (let i = 0; i < campos.length; i++) {
        const key = campos[i]

        await connection.query(`INSERT INTO campos_agenda (nome_campo, conteudo, fk_id_agenda) VALUES (?, ?, ?)`, [
          key,
          contato[key],
          contatoBanco[0].insertId
        ])
      }

      res.redirect('/contatos')
    }
  })

  app.get('/editar/:id', async (req, res) => {
    let { id } = req.params

    let [contato] = await connection.query('SELECT * FROM agenda WHERE id = ? and fk_id_dominio = ?', [
      id,
      req.session.user.fk_id_dominio
    ])
    let [detalhes] = await connection.query(
      'SELECT id, nome_campo, conteudo FROM campos_agenda WHERE fk_id_agenda = ?',
      [id]
    )
    if (contato.length === 1) {
      errors = null
      contato = contato[0]
      res.render('contatos-edt', { contato, errors, detalhes })
    } else {
      let [contatos] = await connection.query('SELECT * FROM agenda WHERE fk_id_dominio = ? order by did asc', [
        req.session.user.fk_id_dominio
      ])
      res.render('contatos', { contatos })
    }
  })

  app.post('/editar/:id', async (req, res) => {
    let { id } = req.params
    let contato = req.body

    req.assert('did', 'O numero deve ser preenchido').notEmpty()
    req.assert('descricao', 'Forneça uma descrição para o numero').notEmpty()

    let errors = req.validationErrors()
    if (errors) {
      res.render('contatos-edt', { contato, errors })
    } else {
      await connection.query(
        'UPDATE agenda set did = ?, descricao = ?, fraseologia = ? WHERE id = ? and fk_id_dominio = ?',
        [contato.did, contato.descricao, contato.fraseologia, id, req.session.user.fk_id_dominio]
      )

      let campos = Object.keys(contato).filter(item => {
        return !['did', 'descricao', 'fraseologia'].includes(item)
      })

      for (let i = 0; i < campos.length; i++) {
        const key = campos[i]

        let [rows] = await connection.query(
          'SELECT id, nome_campo FROM campos_agenda WHERE fk_id_agenda = ? and nome_campo = ?',
          [id, key]
        )

        if (rows.length === 1) {
          await connection.query(`UPDATE campos_agenda SET conteudo = ? WHERE id = ?`, [contato[key], rows[0].id])
        } else {
          await connection.query(`INSERT INTO campos_agenda (nome_campo, conteudo, fk_id_agenda) VALUES (?, ?, ?)`, [
            key,
            contato[key],
            id
          ])
        }
      }

      res.redirect('/contatos')
    }
  })

  app.delete('/:id', async (req, res) => {
    let { id } = req.params

    let [existe] = await connection.query('SELECT * FROM agenda WHERE id = ?', [id])
    if (existe.length === 1) {
      await connection.query('DELETE FROM agenda where id = ?', [id])
      res.statusCode = 202
      res.charset = 'utf-8'
      res.json({ message: 'usuário deletado com sucesso !' })
    } else {
      res.statusCode = 204
      res.charset = 'utf-8'
      res.json({ message: 'usuário não encontrado, erro na deleção' })
    }
  })

  app.delete('/campo/:id', async (req, res) => {
    let { id } = req.params

    let [existe] = await connection.query('SELECT * FROM campos_agenda WHERE id = ?', [id])
    if (existe.length === 1) {
      await connection.query('DELETE FROM campos_agenda where id = ?', [id])
      res.statusCode = 200
      res.charset = 'utf-8'
      res.json({ message: 'campo deletado com sucesso !' })
    } else {
      res.statusCode = 204
      res.charset = 'utf-8'
      res.json({ message: 'campo não encontrado' })
    }
  })

  return app
}

module.exports = init
