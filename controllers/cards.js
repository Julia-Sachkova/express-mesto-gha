const Card = require('../models/card');

const serverErrCode = 500;
const notValidCode = 400;
const notFoundCode = 404;

module.exports.getCard = (req, res, next) => {
  Card.find({})
    .populate('owner')
    .then((card) => res.send(card))
    .catch((err) => next(err));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.countDocuments()
    .then((count) => Card.create({
      name,
      link,
      owner,
      id: count,
    })
      .then((card) => res.send(card)))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(notValidCode).send({ message: 'Введены некорректные данные' });
      }
      return res.status(serverErrCode).send({ message: 'Произошла ошибка на сервере, попробуйте еще раз' });
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (!card) {
        res.status(notFoundCode).send({ message: 'Карточка не найдена' });
        return;
      }
      res.send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(notValidCode).send({ message: 'Введены некорректные данные' });
      }
      return res.status(serverErrCode).send({ message: 'Произошла ошибка на сервере, попробуйте еще раз' });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        res.status(notFoundCode).send({ message: 'Карточка не найдена' });
        return;
      }
      res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(notValidCode).send({ message: 'Введен некорректый id' });
      }
      return res.status(serverErrCode).send({ message: 'Произошла ошибка на сервере, попробуйте еще раз' });
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        res.status(notFoundCode).send({ message: 'Карточка не найдена' });
        return;
      }
      res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(notValidCode).send({ message: 'Введен некорректый id' });
      }
      return res.status(serverErrCode).send({ message: 'Произошла ошибка на сервере, попробуйте еще раз' });
    });
};
