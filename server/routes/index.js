const express = require('express');
const app = express();

app.use(require('./user'));
app.use(require('./login'));
app.use(require('./event'));
app.use(require('./crew'));
app.use(require('./content'));

module.exports = app;