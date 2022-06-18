const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_TOKEN = 'secret-jwt-token';

const {
  notValidCode,
  serverErrCode,
  notFoundCode,
  notValidJwt,
  noAccess,
  alreadyExistData,
} = require('../utils/codeConstants');

module.exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(notValidJwt).send({ message: 'Неверные почта или пароль' });
  }

  User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        res.status(notFoundCode).send({ message: 'Пользователь не найден' });
      } else {
        bcrypt.compare(password, user.password, ((err, valid) => {
          if (err) {
            res.status(noAccess).send({ message: 'Ошибка доступа' });
          }

          if (valid) {
            const token = jwt.sign({ id: user._id }, JWT_TOKEN);

            res
              .cockie('jwt', token, {
                httpOnly: true,
                sameSite: true,
                maxAge: 3600000 * 24 * 7,
              })
              .ssend({ token });
          } else {
            res.status(notValidJwt).send({ message: 'Неверные почта или пароль' });
          }
        }));
      }
    });
};

module.exports.getUsers = (_req, res) => {
  User.find({})
    .then((user) => res.send(user))
    .catch(() => {
      res.status(serverErrCode).send({ message: 'Произошла ошибка на сервере, попробуйте еще раз' });
    });
};

module.exports.getUser = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        res.status(notFoundCode).send({ message: 'Запрашиваемый пользователь не найден' });
        return;
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(notValidCode).send({ message: 'Введен некорректый id' });
      }
      return res.status(serverErrCode).send({ message: 'Произошла ошибка на сервере, попробуйте еще раз' });
    });
};

module.exports.getMe = (req, res) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        res.status(notFoundCode).send({ message: 'Запрашиваемый пользователь не найден' });
        return;
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(notValidCode).send({ message: 'Введен некорректый id' });
      }
      return res.status(serverErrCode).send({ message: 'Произошла ошибка на сервере, попробуйте еще раз' });
    });
};

module.exports.createUser = (req, res) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  if (!email || !password) {
    res.status(notValidJwt).send({ message: 'Неверно указаны почта или пароль' });
  }

  User.findOne({ email })
    .then((user) => {
      if (user) {
        res.status(alreadyExistData).send({ message: 'Пользователь с таким email уже существует' });
      } else {
        bcrypt.hash(password, 10)
          .then((hash) => User.create({
            name,
            about,
            avatar,
            email,
            password: hash,
          }))
          .then((userData) => res.send(userData))
          .catch((err) => {
            if (err.name === 'ValidationError') {
              return res.status(notValidCode).send({ message: 'Введены некорректные данные' });
            }
            return res.status(serverErrCode).send({ message: 'Произошла ошибка на сервере, попробуйте еще раз' });
          });
      }
    })
    .catch((err) => {
      if (err.code === 11000) {
        return res.status(alreadyExistData).send({ message: 'Пользователь с таким email уже существует' });
      }
      return res.status(serverErrCode).send({ message: 'Произошла ошибка на сервере, попробуйте еще раз' });
    });
};

module.exports.updateUserInfo = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (!user) {
        res.status(notFoundCode).send({ message: 'Запрашиваемый пользователь не найден' });
        return;
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(notValidCode).send({ message: 'Введены некорректные данные' });
      }
      return res.status(serverErrCode).send({ message: 'Произошла ошибка на сервере, попробуйте еще раз' });
    });
};

module.exports.updateUserAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (!user) {
        res.status(notFoundCode).send({ message: 'Запрашиваемый пользователь не найден' });
        return;
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(notValidCode).send({ message: 'Введены некорректные данные' });
      }
      return res.status(serverErrCode).send({ message: 'Произошла ошибка на сервере, попробуйте еще раз' });
    });
};
