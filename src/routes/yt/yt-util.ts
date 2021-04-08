import { google, youtube_v3 } from 'googleapis';
import he from 'he';
import ytdl from 'ytdl-core';
import ytsr, { Video } from 'ytsr';
import { VideoSong } from '../../types';
import { parseDuration, readableViews } from '../util';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YT_API
});

export async function getStreamURL(id: string) {
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

async function ytQuery(
  options: Partial<youtube_v3.Params$Resource$Search$List>,
  api = false
): Promise<VideoSong[]> {
  const search = await youtube.search.list({
    part: ['snippet'],
    fields: 'items(id/videoId,snippet(title,channelTitle,thumbnails/default))',
    maxResults: 25,
    type: ['video'],
    ...options
  });

  const { items } = search.data;
  if (items == null) {
    return [];
  }

  const videos = items.map(item => ({
    id: item.id!.videoId!,
    title: he.decode(item.snippet!.title!),
    artist: item.snippet!.channelTitle!,
    thumbnail: {
      width: item.snippet!.thumbnails!.default!.width!,
      height: item.snippet!.thumbnails!.default!.height!,
      url: item.snippet!.thumbnails!.default!.url!
    }
  }));

  if (api) {
    const res = await youtube.videos.list({
      part: ['contentDetails,statistics'],
      fields: 'items(contentDetails/duration, statistics/viewCount)',
      id: [videos.map(v => v.id).join(',')]
    });

    const videoItems = res.data.items;

    if (videoItems == null) {
      return [];
    }

    return videos.map((v, i) => ({
      ...v,
      playlists: [],
      date: Date.now(),
      source: 'YOUTUBE',
      url: v.id,
      duration: parseDuration(videoItems[i].contentDetails!.duration!),
      views: readableViews(Number(videoItems[i].statistics!.viewCount) || 0)
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
    duration: Number(infos[i].videoDetails.lengthSeconds) || 0,
    views: readableViews(
      Number(infos[i].player_response.videoDetails.viewCount) || 0
    )
  }));
}

export async function ytSearch(keyword: string, api = false) {
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
  const filter = filters.get('Type')?.get('Video');
  if (filter?.url == null) {
    return [];
  }

  const search = await ytsr(filter.url, {
    limit: 25
  });

  const ids = new Map<string, Video>();
  for (const item of search.items) {
    const video = item as Video;
    const id = video.url.substr(video.url.lastIndexOf('=') + 1);

    // Videos can appear more than once, remove duplicates based on video id
    if (!ids.has(id)) {
      ids.set(id, video);
    }
  }

  const videos = Array.from(ids.entries());
  const songs = videos.map(async ([id, item]) => {
    const info = await ytdl.getBasicInfo(id);

    // This should be guaranteed to work
    const views = readableViews(
      Number(info.player_response.videoDetails.viewCount) || 0
    );

    const song = {
      id,
      title: he.decode(item.title),
      artist: item.author?.name ?? '',
      thumbnail: {
        url: item.bestThumbnail.url ?? '',
        width: item.bestThumbnail.width,
        height: item.bestThumbnail.height
      },
      playlists: [],
      date: Date.now(),
      source: 'YOUTUBE',
      url: info.videoDetails.videoId,
      duration: Number(info.videoDetails.lengthSeconds),
      views
    };

    return song;
  });

  return Promise.all(songs);
}

export async function getRelatedVideos(id: string, api = false) {
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
    const viewCount = v.view_count ?? '';
    let views = Number(viewCount.replace(/,/g, ''));
    if (!views) {
      const size = viewCount[viewCount.length - 1];
      views = parseFloat(viewCount) || 0; // parseInt will parse as much of the string unlike Number
      if (size === 'B') views *= 1e9;
      else if (size === 'M') views *= 1e6;
      else if (size === 'K') views *= 1e3;
    }

    return {
      id: v.id ?? '',
      title: v.title ?? '',
      artist: typeof v.author === 'string' ? v.author : v.author.name,
      duration: v.length_seconds ?? 0,
      playlists: [],
      date: Date.now(),
      source: 'YOUTUBE',
      url: v.id ?? '',
      views: readableViews(views || 0),
      thumbnail: {
        url: v.thumbnails[0]?.url ?? '',
        width: 120,
        height: 90
      }
    };
  });
}
