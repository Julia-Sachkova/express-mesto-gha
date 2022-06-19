const jwt = require('jsonwebtoken');

const JWT_TOKEN = 'secret-jwt-token';

const NoAccess = require('../errors/NoAccess');
const NotValidJwt = require('../errors/NotValidJwt');

const auth = (req, res, next) => {
  const { cookies } = req.cookies;

  if (!cookies) {
    throw new NotValidJwt('Требуется авторизация');
  } else {
    const token = cookies.jwt;
    let playload;

    try {
      playload = jwt.verify(token, JWT_TOKEN);
    } catch (err) {
      next(new NoAccess('token is not valid'));
    }

    req.user = playload;
    return next();
  }
};

module.exports = auth;
