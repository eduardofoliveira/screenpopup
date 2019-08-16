let getDendronParams = (user, idDomain, connection) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [[retorno]] = await connection.query(
        'SELECT dendron_operador, dendron_token FROM usuario WHERE user_basix = ? and fk_id_dominio = (SELECT id FROM dominio WHERE dominio = ?)',
        [user, idDomain]
      )

      resolve({
        token: retorno.dendron_token,
        operador: retorno.dendron_operador
      })
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  getDendronParams
}
