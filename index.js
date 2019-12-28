if (process.env.NODE_ENV !== 'production') require('dotenv').config();

if (!process.env.YT_API) throw 'Missing YouTube API key!';

const express = require('express');
const app = express();
const comp = require('compression');

app.use(comp());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  console.log(req.url);
  console.log(req.query);
  next();
});

app.use(express.static(__dirname + '/public'));

app.use('/', require('./routes'));

// Unknown route
app.use('/*', (req, res) => {
  res.status(404);
  res.send('???');
});

// Error catcher
app.use((err, req, res) => {
  console.error(err);
  res.status(500);
  res.send('blek');
});

const port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log('listening on:' + port);
});
