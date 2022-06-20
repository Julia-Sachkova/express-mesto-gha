const Card = require('../models/card');

const NoAccess = require('../errors/NoAccess');
const NotFound = require('../errors/NotFound');
const NotValidCode = require('../errors/NotValidCode');

module.exports.getCard = (_req, res, next) => {
  Card.find({})
    .populate('owner')
    .then((card) => res.send(card))
    .catch((err) => {
      next(err);
    });
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({
    name,
    link,
    owner,
  })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new NotValidCode('Введены некорректные данные'));
      }
      next(err);
    });
};

module.exports.deleteCard = (req, res, next) => {
  const cardDelete = () => {
    Card.findByIdAndRemove(req.params.cardId)
      .then((card) => {
        if (!card) {
          throw new NotFound('Карточка не найдена');
        }
        res.send(card);
      })
      .catch((err) => {
        if (err.name === 'CastError') {
          next(new NotValidCode('Введен некорректный id'));
        }
        next(err);
      });
  };

  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new NotFound('Карточка не найдена');
      }

      if (req.user._id !== card.owner.toString()) {
        throw new NoAccess('Вы не можете удалить данную карточку');
      }

      cardDelete();
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new NotValidCode('Введен некорректный id'));
      }
      next(err);
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
        throw new NotFound('Карточка не найдена');
      }
      res.send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new NotValidCode('Введен некорректный id'));
      }
      next(err);
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
        throw new NotFound('Карточка не найдена');
      }
      res.send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new NotValidCode('Введен некорректный id'));
      }
      next(err);
    });
};
