// Route: /yt/related
// Params:
// - id: video ID
// Response:
// - JSON string of VideoSong[]

import express from 'express';
import { Request } from '../../types';
import { getRelatedVideos } from './yt-util';

const router = express.Router();

type Query = {
  id: string;
  api: '' | '1';
};

router.get('/', async (req: Request<Query>, res) => {
  const { id, api } = req.query;

  if (id == null) {
    res.send([]);
    return;
  }

  const videos = await getRelatedVideos(id, api === '1');
  res.send(videos);
});

export default router;

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
