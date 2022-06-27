import { Request as Req } from 'express';

export type Request<Query, Body = {}> = Req<{}, {}, Body, Partial<Query>>;

type SongID = string;
type PlaylistID = string;

interface Thumbnail {
  width: number;
  height: number;
  url: string;
}

interface SongShared {
  id: SongID; // hash of filepath or url
  title: string; // metadata title
  artist: string;
  duration: number;
  playlists: PlaylistID[];
  date: number;
  thumbnail: Thumbnail;
}

export interface VideoSong extends SongShared {
  source: 'YOUTUBE';
  url: SongID;
  views: string; // Readable view count
}

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      password: string;
    }
  }
}
