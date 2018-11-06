const mysql = require('mysql2/promise')

const connection = mysql.createPool({
  host: 'duduhouse.dyndns.info',
  user: 'popup',
  password: 'B@lpha9001',
  database: 'popup',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0
})

module.exports = connection