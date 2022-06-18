const jwt = require('jsonwebtoken');

const JWT_TOKEN = 'secret-jwt-token';

module.exports.auth = (req, res, next) => {
  const { cookies } = req.cookies;

  if (!cookies) {
    res.status(403).send({ error: 'Авторизация не успешна' });
  } else {
    const token = cookies.jwt;
    let playload;

    try {
      playload = jwt.verify(token, JWT_TOKEN);
    } catch (err) {
      res.status(401).send({ error: 'token is not valid' });
    }

    req.user = playload;
    next();
  }
};
