// Route: /yt/url
// Params:
// - id: video ID
// Response:
// - url: stream url

const ytdl = require('ytdl-core');
const router = require('express').Router();

router.get('/', async (req, res) => {
  const { id } = req.query;

  if (id == null) {
    res.send('');
    return;
  }

  const info = await ytdl.getInfo(id);

  // MacOS: doesn't support opus audio format
  const format = ytdl.chooseFormat(info.formats, {
    // quality: 'highestaudio'
    filter: format =>
      !format.bitrate &&
      format.audioBitrate &&
      format.audioEncoding != null &&
      format.audioEncoding !== 'opus'
  });

  res.send(format.url);
});

module.exports = router;
