const express = require('express');
const { errors, celebrate, Joi } = require('celebrate');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const auth = require('./middlewares/auth');
const errorsHandler = require('./middlewares/errorsHandler');

const app = express();
const { PORT = 3000 } = process.env;

const { login, createUser } = require('./controllers/users');

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(bodyParser.json());
app.use(cookieParser());

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);
app.post('/signup', createUser);

app.use(auth);

app.use(require('./routes/users'));
app.use(require('./routes/cards'));

app.all('*', (_req, res) => {
  res.status(404).send({ message: 'Страница не найдена' });
});

app.use(errors());
app.use(errorsHandler);

app.listen(PORT);
