const mysql = require("mysql2/promise");

const connection = mysql.createPool({
  // host: "35.171.122.245",
  socketPath: "/var/run/mysqld/mysqld.sock",
  user: "popup",
  password: "B@lpha9001",
  database: "popup",
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0
});

setInterval(async () => {
  await connection.query("SELECT 1 + 1").catch(error => {
    console.log(error);
  });
  console.log("KeepAlive DB " + new Date().toLocaleString());
}, 120000);

module.exports = connection;
