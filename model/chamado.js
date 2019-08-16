let abrirChamado = (de, para, call_id, fk_id_usuario, fk_id_dominio, connection) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [chamado] = await connection.query(
        'INSERT INTO chamado (de, para, call_id, fk_id_usuario, fk_id_dominio) VALUES (?, ?, ?, ?, ?)',
        [de, para, call_id, fk_id_usuario, fk_id_dominio]
      )

      resolve(chamado.insertId)
    } catch (error) {
      reject(error)
    }
  })
}

let fecharChamado = (callid, connection) => {
  connection.query('UPDATE chamado SET termino = now() WHERE call_id = ?', [callid])
}

let obterDetalhesLigacao = (from, to, user, domain, connection) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [[descricoes]] = await connection.query(
        `
      select
        (select descricao from agenda, dominio where did = ? and agenda.fk_id_dominio = dominio.id and dominio.dominio = ?) as desc_from,
        (select agenda.id from agenda, dominio where did = ? and agenda.fk_id_dominio = dominio.id and dominio.dominio = ?) as id_from,
        (select descricao from agenda, dominio where did = ? and agenda.fk_id_dominio = dominio.id and dominio.dominio = ?) as desc_to,
        (select fraseologia from agenda, dominio where did = ? and agenda.fk_id_dominio = dominio.id and dominio.dominio = ?) as script,
        (SELECT usuario.id FROM dominio, usuario WHERE usuario.fk_id_dominio = dominio.id AND dominio.dominio = ? AND usuario.user_basix = ?) AS id_usuario,
        (SELECT dominio.id FROM dominio, usuario WHERE usuario.fk_id_dominio = dominio.id AND dominio.dominio = ? AND usuario.user_basix = ?) AS id_dominio
      `,
        [from, domain, from, domain, to, domain, to, domain, domain, user, domain, user]
      )

      resolve(descricoes)
    } catch (error) {
      reject(error)
    }
  })
}

let obterHistorico = (idDominio, from, connection) => {
  return new Promise(async (resolve, reject) => {
    try {
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
        [idDominio, from]
      )

      historico = historico.map(item => {
        item.inicio = item.inicio = `${item.inicio.getDate()}/${(item.inicio.getMonth() + 1)
          .toString()
          .padStart(2, '0')}/${item.inicio.getFullYear()} ${item.inicio
          .getHours()
          .toString()
          .padStart(2, '0')}:${item.inicio
          .getMinutes()
          .toString()
          .padStart(2, '0')}:${item.inicio
          .getSeconds()
          .toString()
          .padStart(2, '0')}`

        return item
      })

      resolve(historico)
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  abrirChamado,
  fecharChamado,
  obterDetalhesLigacao,
  obterHistorico
}
