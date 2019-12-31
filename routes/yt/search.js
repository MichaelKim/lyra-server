// Route: /yt/search
// Params:
// - query: search query string
// Response:
// - JSON string of VideoSong[]

const router = require('express').Router();

const { ytSearch } = require('./yt-util');

router.get('/', async (req, res) => {
  const { query, api } = req.query;

  const videos = await ytSearch(query, api);
  res.send(videos);
});

module.exports = router;
