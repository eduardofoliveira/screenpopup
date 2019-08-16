let obterContato = (from, connection) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [detalhes] = await connection.query(
        `
        SELECT
          *
        FROM
          campos_agenda
        WHERE
          fk_id_agenda = ?`,
        [from]
      )

      resolve(detalhes)
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  obterContato
}
