const Card = require('../models/card');
const { NotFoundError } = require('../errors/NotFoundError');
const { ServerError } = require('../errors/ServerError');

const serverErrCode = 500;
const notValidCode = 400;

module.exports.getCard = (req, res, next) => {
  Card.find({})
    .populate('owner')
    .then((card) => res.send(card))
    .catch((err) => next(err));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.send({
      name: card.name,
      link: card.link,
      owner: card.owner,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(notValidCode).send({ message: 'Введены некорректные данные' });
      }
      return res.status(serverErrCode).send({ message: 'Произошла ошибка на сервере, попробуйте еще раз' });
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (!card) {
        next(new NotFoundError('Карточка не найдена'));
      } else {
        card.remove()
          .then(() => res.send(card));
      }
      return res.send(card);
    })
    .catch((err) => {
      if (err.code === serverErrCode) {
        next(new ServerError('Произошла ошибка на сервере, попробуйте еще раз'));
      } else {
        next(err);
      }
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return new NotFoundError('Карточка не найдена');
      }
      return res.send(card);
    })
    .catch((err) => {
      if (err.code === serverErrCode) {
        next(new ServerError('Произошла ошибка на сервере, попробуйте еще раз'));
      } else {
        next(err);
      }
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return new NotFoundError('Карточка не найдена');
      }
      return res.send(card);
    })
    .catch((err) => {
      if (err.code === serverErrCode) {
        next(new ServerError('Произошла ошибка на сервере, попробуйте еще раз'));
      } else {
        next(err);
      }
    });
};
