const he = require('he');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const { google } = require('googleapis');

const { readableViews, parseDuration } = require('../util');

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YT_API
});

async function getStreamURL(id) {
  const info = await ytdl.getInfo(id);

  // MacOS: doesn't support opus audio format
  const format = ytdl.chooseFormat(info.formats, {
    quality: 'highestaudio'
    // filter: format =>
    //   !format.bitrate &&
    //   format.audioBitrate &&
    //   format.audioEncoding != null &&
    //   format.audioEncoding !== 'opus'
  });

  return format.url;
}

async function ytQuery(options, api = false) {
  const res = await youtube.search.list({
    part: 'snippet',
    fields: 'items(id,snippet(title,channelTitle,thumbnails/default))',
    maxResults: 25,
    type: 'video',
    ...options
  });

  const videos = res.data.items.map(item => ({
    id: item.id.videoId,
    title: he.decode(item.snippet.title),
    artist: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.default
  }));

  if (api) {
    const res2 = await youtube.videos.list({
      part: 'contentDetails,statistics',
      fields: 'items(contentDetails/duration, statistics/viewCount)',
      id: videos.map(v => v.id).join(',')
    });

    return videos.map((v, i) => ({
      ...v,
      playlists: [],
      date: Date.now(),
      source: 'YOUTUBE',
      url: v.id,
      duration: parseDuration(res2.data.items[i].contentDetails.duration),
      views: readableViews(Number(res2.data.items[i].statistics.viewCount) || 0)
    }));
  }

  // This doesn't always work, but avoids making an API call
  // TODO: see if this can be changed to ytdl.getBasicInfo
  const infos = await Promise.all(videos.map(v => ytdl.getInfo(v.id)));
  return videos.map((v, i) => ({
    ...v,
    playlists: [],
    date: Date.now(),
    source: 'YOUTUBE',
    url: v.id,
    duration: infos[i].length_seconds,
    views: readableViews(
      Number(infos[i].player_response.videoDetails.viewCount) || 0
    )
  }));
}

async function ytSearch(keyword, api = false) {
  if (api) {
    return ytQuery(
      {
        q: keyword
      },
      api
    );
  }

  // Alternative using ytsr
  const filters = await ytsr.getFilters(keyword);
  const typeFilters = filters.get('Type');
  if (typeFilters == null) {
    return [];
  }

  const filter = typeFilters.find(f => f.name === 'Video');
  if (filter == null) {
    return [];
  }

  const search = await ytsr(keyword, {
    limit: 25,
    nextpageRef: filter.ref
  });

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
  return videosongs.filter(Boolean);
}

async function getRelatedVideos(id, api = false) {
  if (api) {
    return ytQuery(
      {
        relatedToVideoId: id
      },
      api
    );
  }

  // Alternative using ytdl
  const { related_videos } = await ytdl.getBasicInfo(id);

  // related_videos has nearly almost enough information to fill out a VideoSong
  // There are two missing parts:
  // - The thumbnail only has the url, but we don't need the dimensions to display it properly
  // - The viewcount sometimes will be formed like "12M" or "53K"
  // This is faster than having to do another getBasicInfo() to get the proper view count

  return related_videos.map(v => {
    let views = Number(v.view_count.replace(/,/g, ''));
    if (!views) {
      const size = v.view_count[v.view_count.length - 1];
      views = parseFloat(v.view_count) || 0; // parseInt will parse as much of the string unlike Number
      if (size === 'B') views *= 1e9;
      else if (size === 'M') views *= 1e6;
      else if (size === 'K') views *= 1e3;
    }

    return {
      id: v.id,
      title: v.title,
      artist: v.author,
      duration: v.length_seconds,
      playlists: [],
      date: Date.now(),
      source: 'YOUTUBE',
      url: v.id,
      views: views ? readableViews(views) : '',
      thumbnail: {
        url: v.video_thumbnail,
        width: 120,
        height: 90
      }
    };
  });
}

module.exports = {
  getStreamURL,
  ytSearch,
  getRelatedVideos
};
