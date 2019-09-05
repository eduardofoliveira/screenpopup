let getDendronParams = (user, idDomain, connection) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [[retorno]] = await connection.query(
        'SELECT id, fk_id_dominio, dendron_operador, dendron_token FROM usuario WHERE user_basix = ? and fk_id_dominio = (SELECT id FROM dominio WHERE dominio = ?)',
        [user, idDomain]
      )

      resolve({
        idUser: retorno.id,
        idDominio: retorno.fk_id_dominio,
        token: retorno.dendron_token,
        operador: retorno.dendron_operador
      })
    } catch (error) {
      reject(error)
    }
  })
}

let getZendeskParams = (user, domain, connection) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [[retorno]] = await connection.query(
        `
          SELECT
            u.email_zendesk,
            u.token_zendesk,
            u.sub_dominio_zendesk
          FROM
            usuario u,
            dominio d
          WHERE
            u.fk_id_dominio = d.id and
            u.user_basix = ? and
            d.dominio = ? and
            ativo = 1
      `,
        [user, domain]
      )

      resolve({
        email: retorno.email_zendesk,
        token: retorno.token_zendesk,
        sub_dominio: retorno.sub_dominio_zendesk
      })
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  getDendronParams,
  getZendeskParams
}
