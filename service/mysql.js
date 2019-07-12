const mysql = require("mysql2/promise");

let connection = null;

if (process.env.ENVIRONMENT === "development") {
  connection = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0
  });
} else {
  connection = mysql.createPool({
    socketPath: process.env.MYSQL_SOCKET,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0
  });
}

setInterval(async () => {
  await connection.query("SELECT 1 + 1").catch(error => {
    console.log(error);
  });
  console.log("KeepAlive DB " + new Date().toLocaleString());
}, 120000);

module.exports = connection;
