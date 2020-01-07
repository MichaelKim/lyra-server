// Route: /yt/suggest
// Params:
// - query: Query for search suggestions
// Response:
// - JSON string of string[] (suggestions)

const router = require('express').Router();
const fetch = require('node-fetch');

const YT_SUGGEST_URL =
  'https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=';

async function ytSuggest(query, api = false) {
  if (!query) return [];

  const url = YT_SUGGEST_URL + query.trim().replace(/\s+/, '+');

  // Format: [query: string, suggestions: string[]]
  const res = await fetch(url);
  const body = await res.json();

  return body[1];
}

router.get('/', async (req, res) => {
  const { query, api } = req.query;

  const suggestions = await ytSuggest(query, api);
  res.send(suggestions);
});

module.exports = router;
