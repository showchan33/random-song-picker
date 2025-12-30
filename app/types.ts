export interface Artist {
  id: number;
  name: string;
}

export interface Song {
  id: number;
  title: string;
  artist_id: number;
  created_at: string;
}
