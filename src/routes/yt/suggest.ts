// Route: /yt/suggest
// Params:
// - query: Query for search suggestions
// Response:
// - JSON string of string[] (suggestions)

import express from 'express';
import fetch from 'node-fetch';
import { Request } from '../../types';

const router = express.Router();

const YT_SUGGEST_URL =
  'https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=';

async function ytSuggest(query: string, api = false) {
  if (!query) return [];

  const url = YT_SUGGEST_URL + query.trim().replace(/\s+/, '+');

  // Format: [query: string, suggestions: string[]]
  const res = await fetch(url);
  const body = await res.json();

  return body[1];
}

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

  const suggestions = await ytSuggest(query, api === '1');
  res.send(suggestions);
});

export default router;
