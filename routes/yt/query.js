// Route: /yt/url
// Params:
// - options: JSON string of options
// Response:
// - JSON string of VideoSong[]

const he = require('he');
const { google } = require('googleapis');
const ytdl = require('ytdl-core');
const router = require('express').Router();

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YT_API
});

router.get('/', async (req, res) => {
  const { options } = req.query;

  const ytres = await youtube.search.list({
    part: 'snippet',
    fields: 'items(id,snippet(title,channelTitle,thumbnails/default))',
    maxResults: 25,
    type: 'video',
    ...JSON.parse(options)
  });

  const videos = ytres.data.items.map(item => ({
    id: item.id.videoId,
    title: he.decode(item.snippet.title),
    artist: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.default
  }));

  // const res2 = await youtube.videos.list({
  //   part: 'contentDetails,statistics',
  //   fields: 'items(contentDetails/duration, statistics/viewCount)',
  //   id: videos.map(v => v.id).join(',')
  // });

  // return videos.map((v, i) => ({
  //   ...v,
  //   duration: parseDuration(res2.data.items[i].contentDetails.duration),
  //   views: res2.data.items[i].statistics.viewCount
  // }));

  // This doesn't always work, but avoids making an API call
  const infos = await Promise.all(videos.map(v => ytdl.getInfo(v.id)));
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
