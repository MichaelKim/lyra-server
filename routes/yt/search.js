// Route: /yt/search
// Params:
// - query: search query string
// Response:
// - JSON string of VideoSong[]

const he = require('he');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const router = require('express').Router();

const { readableViews } = require('../util');

router.get('/', async (req, res) => {
  const { query } = req.query;
  console.log('searching for', query);

  const filters = await ytsr.getFilters(query);
  const filter = filters.get('Type').find(f => f.name === 'Video');
  console.log('filter:', filter);
  if (filter == null) {
    res.send([]);
    return;
  }

  const search = await ytsr(query, {
    limit: 25,
    nextpageRef: filter.ref
  });
  console.log('search:', search.items.length);

  const ids = new Set();
  const promises = search.items.map(async item => {
    const id = item.link.substr(item.link.lastIndexOf('=') + 1);

    // Videos can appear more than once, remove duplicates based on video id
    if (ids.has(id)) return;
    ids.add(id);

    const info = await ytdl.getBasicInfo(id);

    // This should be guaranteed to work
    const views = readableViews(
      Number(info.player_response.videoDetails.viewCount) || 0
    );

    return {
      id,
      title: he.decode(item.title),
      artist: item.author.name,
      thumbnail: {
        url: item.thumbnail,
        width: 120,
        height: 90
      },
      playlists: [],
      date: Date.now(),
      source: 'YOUTUBE',
      url: info.video_id,
      duration: info.length_seconds,
      views
    };
  });

  const videosongs = await Promise.all(promises);
  res.send(videosongs.filter(Boolean));
});

module.exports = router;
