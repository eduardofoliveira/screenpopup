const init = (conn, io) => {
  return (middleware = (req, res, next) => {
    res.setHeader("Set-Cookie", "HttpOnly;Secure;SameSite=Strict");
    req.conn = conn
    req.io = io

    next()
  })
}

module.exports = init
