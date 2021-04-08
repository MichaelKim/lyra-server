// Route: /yt/search
// Params:
// - query: search query string
// Response:
// - JSON string of VideoSong[]

import express from 'express';
import { Request } from '../../types';
import { ytSearch } from './yt-util';

const router = express.Router();

type Query = {
  query: string;
  api: '' | '1';
};

router.get('/', async (req: Request<Query>, res) => {
  const { query, api } = req.query;

  if (query == null) {
    res.send([]);
    return;
  }

  const videos = await ytSearch(query, api === '1');
  res.send(videos);
});

export default router;
