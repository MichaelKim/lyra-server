// Route: /yt/search
// Params:
// - query: search query string
// Response:
// - JSON string of VideoSong[]

const he = require('he');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const router = require('express').Router();

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

  const videos = search.items
    .map(item => ({
      id: item.link.substr(item.link.lastIndexOf('=') + 1),
      title: he.decode(item.title),
      artist: item.author.name,
      thumbnail: {
        url: item.thumbnail,
        width: 120,
        height: 90
      }
    }))
    .filter(
      (item, index, items) => items.findIndex(i => i.id === item.id) === index
    );

  console.log('videos:', videos.length);

  const infos = await Promise.all(videos.map(v => ytdl.getInfo(v.id)));
  console.log('infos:', infos.length);
  const videosongs = videos.map((v, i) => ({
    ...v,
    playlists: [],
    date: Date.now(),
    source: 'YOUTUBE',
    url: v.id,
    duration: infos[i].length_seconds,
    views: infos[i].player_response.videoDetails.viewCount
  }));

  res.send(videosongs);
});

module.exports = router;
