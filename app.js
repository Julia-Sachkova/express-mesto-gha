const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRout = require('./routes/users');
const cardsRout = require('./routes/cards');
const auth = require('./middlewares/auth');
const errorsHandler = require('./middlewares/errorsHandler');

const app = express();
const { PORT = 3000 } = process.env;

const { login, createUser } = require('./controllers/users');

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(bodyParser.json());

app.post('/signin', login);
app.post('/signup', createUser);

app.use(errorsHandler);

app.use(auth, userRout);
app.use(auth, cardsRout);

app.all('*', auth, (_req, res) => {
  res.status(404).send({ message: 'Страница не найдена' });
});

app.listen(PORT);
