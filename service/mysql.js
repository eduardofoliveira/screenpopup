const mysql = require('mysql2/promise')

const connection = mysql.createPool({
  host: '18.228.130.32',
  socketPath: '/var/run/mysqld/mysqld.sock',
  user: 'popup',
  password: 'B@lpha9001',
  database: 'popup',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0
})

setInterval(async () => {
  await connection.query('SELECT 1 + 1')
    .catch(error => {
      console.log(error)
    })
  console.log('KeepAlive DB ' + new Date().toLocaleString())
}, 300000)

module.exports = connection