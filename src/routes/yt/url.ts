// Route: /yt/url
// Params:
// - id: video ID
// Response:
// - url: stream url

import express from 'express';
import { Request } from '../../types';
import { getStreamURL } from './yt-util';

const router = express.Router();

type Query = {
  id: string;
};

router.get('/', async (req: Request<Query>, res) => {
  const { id } = req.query;

  if (id == null) {
    res.send('');
    return;
  }

  const url = await getStreamURL(id);
  res.send(url);
});

export default router;
