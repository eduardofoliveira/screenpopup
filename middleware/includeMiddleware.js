const init = (conn, io) => {
  return (middleware = (req, res, next) => {
    req.conn = conn
    req.io = io

    next()
  })
}

module.exports = init
