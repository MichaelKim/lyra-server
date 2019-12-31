// Route: /yt/query
// Params:
// - options: JSON string of options
// Response:
// - JSON string of VideoSong[]

const router = require('express').Router();

const { ytQuery } = require('./yt-util');

router.get('/', async (req, res) => {
  const { options, api } = req.query;

  const videos = await ytQuery(options, api);

  res.send(videos);
});

module.exports = router;
