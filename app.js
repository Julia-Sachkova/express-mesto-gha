const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const { PORT = 3000 } = process.env;

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(bodyParser.json());

app.use((req, _res, next) => {
  req.user = { _id: '629c99f5b8d079d79d32b9ac' };
  next();
});

app.use(require('./routes/users'));

app.use(require('./routes/cards'));

app.all('*', (_req, res) => {
  res.status(404).send({ message: 'Страница не найдена' });
});

app.listen(PORT);
