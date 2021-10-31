// Route: /yt/suggest
// Params:
// - query: Query for search suggestions
// Response:
// - JSON string of string[] (suggestions)

import express from 'express';
import https from 'https';
import { Request } from '../../types';

const router = express.Router();

const YT_SUGGEST_URL =
  'https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=';

async function fetchSuggestions(url: string) {
  return new Promise<[string, string[]]>(resolve => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(['', []]);
        }
      });
    });
  });
}

async function ytSuggest(query: string, api = false) {
  if (!query) return [];

  const url = YT_SUGGEST_URL + encodeURI(query.trim().replace(/\s+/, '+'));

  // Format: [query: string, suggestions: string[]]
  const body = await fetchSuggestions(url);

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
