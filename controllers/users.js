const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_TOKEN = 'secret-jwt-token';

const AlreadyExistData = require('../errors/AlreadyExistData');
const NoAccess = require('../errors/NoAccess');
const NotFound = require('../errors/NotFound');
const NotValidCode = require('../errors/NotValidCode');

const NotValidJwt = require('../errors/NotValidJwt');

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new NotValidJwt('Неверные почта или пароль');
  }

  User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new NotFound('Пользователь не найден');
      } else {
        bcrypt.compare(password, user.password, ((err, valid) => {
          if (err) {
            throw new NoAccess('Ошибка доступа');
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
            throw new NotValidJwt('Неверные почта или пароль');
          }
        }));
      }
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.getUsers = (_req, res, next) => {
  User.find({})
    .then((user) => res.send(user))
    .catch((err) => {
      next(err);
    });
};

module.exports.getUser = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        throw new NotFound('Пользователь не найден');
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new NotValidCode('Введен некорректый id');
      }
      next(err);
    });
};

module.exports.getMe = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFound('Пользователь не найден');
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new NotValidCode('Введен некорректый id');
      }
      next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  if (!email || !password) {
    throw new NotValidJwt('Неверные почта или пароль');
  }

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
        next(new NotValidCode('Введены некорректные данные'));
      }
      if (err.code === 11000) {
        next(new AlreadyExistData('Пользователь с таким email уже существует'));
      }
      next(err);
    });
};

module.exports.updateUserInfo = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (!user) {
        throw new NotFound('Пользователь не найден');
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new NotValidCode('Введены некорректные данные'));
      }
      next(err);
    });
};

module.exports.updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (!user) {
        throw new NotFound('Пользователь не найден');
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new NotValidCode('Введены некорректные данные'));
      }
      next(err);
    });
};
