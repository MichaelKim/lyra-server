if (process.env.NODE_ENV !== 'production') require('dotenv').config();

if (!process.env.YT_API) throw 'Missing YouTube API key!';

import express, { NextFunction, Request, Response } from 'express';
import comp from 'compression';

const app = express();

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
app.use((err: Error, _: Request, res: Response, __: NextFunction) => {
  const status = 500;
  const message = err.message || 'blek';
  console.error(err);
  res.status(status);
  res.send({
    status,
    message
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log('listening on:' + port);
});
