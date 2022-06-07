const User = require('../models/user');

const notValidCode = 400;
const serverErrCode = 500;
const notFoundCode = 404;

module.exports.getUsers = (_req, res, next) => {
  User.find({})
    .then((user) => res.send(user))
    .catch((err) => next(err));
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

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.countDocuments()
    .then((count) => User.create({
      id: count,
      name,
      about,
      avatar,
    }))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(notValidCode).send({ message: 'Введены некорректные данные' });
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
      }
      return res.send(user);
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
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(notValidCode).send({ message: 'Введены некорректные данные' });
      }
      return res.status(serverErrCode).send({ message: 'Произошла ошибка на сервере, попробуйте еще раз' });
    });
};
