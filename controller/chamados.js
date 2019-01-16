const express = require('express')
const app = express.Router()

const init  = (connection, ) => {
  app.use(require('../middleware/authMiddleware'))

  app.get('/', async (req, res) => {
    let [chamados] = await connection.query(`
      select
        chamado.id as id,
        aberto as status,
        de,
        para,
        inicio,
        usuario.nome as nome_aberto_por
      from
        chamado
      left join
        usuario
      on
        chamado.fk_id_usuario = usuario.id
      left join
        usuario as fechado
      on
        chamado.fk_fechado_por = fechado.id
      where
        chamado.fk_id_dominio = ?
      order by
        chamado.id
      desc
    `, [req.session.user.fk_id_dominio])

    res.render('chamados', { chamados })
  })

  app.get('/:id', async (req, res) => {
    let { id } = req.params

    let [[chamado]] = await connection.query(`
      SELECT
        chamado.id,
        de,
        para,
        comentario,
        de.descricao as de_descricao,
        para.descricao as para_descricao,
        inicio,
        termino
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
        chamado.id = ?
      ORDER BY
        chamado.id
      ASC
    `, [id])

    chamado.inicio = `${chamado.inicio.getDate()}/${(chamado.inicio.getMonth()+1).toString().padStart(2, '0')}/${chamado.inicio.getFullYear()} ${chamado.inicio.getHours().toString().padStart(2, '0')}:${chamado.inicio.getMinutes().toString().padStart(2, '0')}:${chamado.inicio.getSeconds().toString().padStart(2, '0')}`
    if(chamado.termino){
      chamado.termino = `${chamado.termino.getDate()}/${(chamado.termino.getMonth()+1).toString().padStart(2, '0')}/${chamado.termino.getFullYear()} ${chamado.termino.getHours().toString().padStart(2, '0')}:${chamado.termino.getMinutes().toString().padStart(2, '0')}:${chamado.termino.getSeconds().toString().padStart(2, '0')}`
    }

    res.json({chamado})
  })

  app.delete('/:id', async (req, res) => {
    let { id } = req.params

    let [existe] = await connection.query('SELECT * FROM chamado WHERE id = ?', [id])
    if(existe.length === 1){
      await connection.query('DELETE FROM chamado where id = ?', [id])
      res.statusCode = 202
      res.charset = 'utf-8'
      res.json({message: 'chamado deletado com sucesso !'})
    }else{
      res.statusCode = 204
      res.charset = 'utf-8'
      res.json({message: 'chamado não encontrado, erro na deleção'})
    }
  })

  app.put('/:id', async (req, res) => {
    let { id } = req.params
    let chamado = req.body

    let [existe] = await connection.query('SELECT * FROM chamado WHERE id = ?', [id])
    if(existe.length === 1){
      await connection.query('UPDATE chamado set aberto = 0, comentario = ?, fk_fechado_por = ? where id = ?', [chamado.comentario, req.session.user.id, id])

      res.statusCode = 200
      res.charset = 'utf-8'
      res.json({message: 'chamado atualizado'})
    }else{
      res.statusCode = 404
      res.charset = 'utf-8'
      res.json({message: 'erro ao atualizar chamado'})
    }
  })

  return app
}

module.exports = init