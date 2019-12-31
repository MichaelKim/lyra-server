// Route: /yt/related
// Params:
// - id: video ID
// Response:
// - JSON string of VideoSong[]

const router = require('express').Router();

const { getRelatedVideos } = require('./yt-util');

router.get('/', async (req, res) => {
  const { id, api } = req.query;

  const videos = await getRelatedVideos(id, api);
  res.send(videos);
});

module.exports = router;

// Old method:
// const { related_videos } = await ytdl.getInfo(id);
// const infos = await Promise.all(
//   related_videos.filter(v => v.id).map(v => ytdl.getInfo(v.id))
// );
// const videos = infos.map(v => ({
//   id: v.video_id,
//   title: v.title,
//   artist: v.author.name,
//   duration: v.length_seconds,
//   playlists: [],
//   date: Date.now(),
//   source: 'YOUTUBE',
//   url: v.video_id,
//   views: v.player_response.videoDetails.viewCount,
//   thumbnail: v.player_response.videoDetails.thumbnail.thumbnails[0]
// }));
// res.send(videos);
