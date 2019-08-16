const addGravacaoEmEspera = (idUser, idDomain, idTicket, callid, connection) => {
  return new Promise((resolve, reject) => {
    try {
      connection.query(
        `
        INSERT INTO
          integracao
          (fk_id_usuario, fk_id_dominio, id_ticket, callid)
        VALUES
          (?, ?, ?, ?)
      `,
        [idUser, idDomain, idTicket, callid]
      )

      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

const gravacoesNaoEnviadas = (idUser, idDomain, connection) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [lista] = await connection.query(
        `
      SELECT
        id,
        id_ticket,
        callid,
      FROM
        integracao
      WHERE
        fk_id_usuario = ? AND
        fk_id_dominio = ? AND
        gravacao_enviada != 1
      `,
        [idUser, idDomain]
      )

      resolve(lista)
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  addGravacaoEmEspera,
  gravacoesNaoEnviadas
}
