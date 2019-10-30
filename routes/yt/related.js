// Route: /yt/related
// Params:
// - id: video ID
// Response:
// - JSON string of VideoSong[]

const ytdl = require('ytdl-core');
const router = require('express').Router();

router.get('/', async (req, res) => {
  const { id } = req.query;

  const { related_videos } = await ytdl.getInfo(id);
  const infos = await Promise.all(
    related_videos.filter(v => v.id).map(v => ytdl.getInfo(v.id))
  );
  const videos = infos.map(v => ({
    id: v.video_id,
    title: v.title,
    artist: v.author.name,
    duration: v.length_seconds,
    playlists: [],
    date: Date.now(),
    source: 'YOUTUBE',
    url: v.video_id,
    views: v.player_response.videoDetails.viewCount,
    thumbnail: v.player_response.videoDetails.thumbnail.thumbnails[0]
  }));
  res.send(videos);
});

module.exports = router;
