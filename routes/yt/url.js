// Route: /yt/url
// Params:
// - id: video ID
// Response:
// - url: stream url

const router = require('express').Router();

const { getStreamURL } = require('./yt-util');

router.get('/', async (req, res) => {
  const { id, api } = req.query;

  if (id == null) {
    res.send('');
    return;
  }

  const url = await getStreamURL(id, api);
  res.send(url);
});

module.exports = router;
