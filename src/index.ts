if (process.env.NODE_ENV !== 'production') require('dotenv').config();
if (!process.env.YT_API) throw 'Missing YouTube API key!';

import comp from 'compression';
import connectRedis from 'connect-redis';
import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import helmet from 'helmet';
import passport from 'passport';
import { redis } from './database';
import { initPassport } from './passport';
import routes from './routes';

const RedisStore = connectRedis(session);
const app = express();

app.use(comp());
app.use(helmet());
app.use(express.json());
app.use((req, _, next) => {
  console.log(req.url, req.query, req.body);
  next();
});
app.use(express.static(__dirname + '/public'));

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    store: new RedisStore({ client: redis }),
    resave: false,
    saveUninitialized: false
  })
);
initPassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/', routes);
app.use((_, res, __) => {
  res.status(404).send({ message: 'Not found' });
});

// Error catcher
app.use(
  (
    err: Error & { status?: number },
    _: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.error(err);
    if (res.headersSent) return next(err);

    const status = err.status || 500;
    const message = err.message || 'Server error';
    res.status(status).send({ message });
  }
);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log('listening on:' + port);
});
