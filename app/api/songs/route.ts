import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { Artist, Song } from '@/app/types';
import { initializeDbFiles } from '@/app/utils/db';

const songsFilePath = path.join(process.cwd(), 'db', 'songs.json');
const artistsFilePath = path.join(process.cwd(), 'db', 'artists.json');

// 簡易的な排他制御フラグ
let isWriting = false;

async function readData(): Promise<{ songs: Song[]; artists: Artist[] }> {
  await initializeDbFiles();
  const [songsData, artistsData] = await Promise.all([
    fs.readFile(songsFilePath, 'utf8'),
    fs.readFile(artistsFilePath, 'utf8'),
  ]);
  return {
    songs: JSON.parse(songsData),
    artists: JSON.parse(artistsData),
  };
}

export async function GET() {
  try {
    await initializeDbFiles();
    const { songs } = await readData();
    return NextResponse.json(songs);
  } catch (error) {
    console.error('Error reading data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  if (isWriting) {
    return new NextResponse(JSON.stringify({ message: 'サーバーが混み合っています。少し時間をおいてから再度お試しください。' }), { status: 429 });
  }
  isWriting = true;

  try {
    const { title, artistName } = await request.json();

    if (!title || !artistName) {
      return new NextResponse(JSON.stringify({ message: '曲名とアーティスト名は必須です。' }), { status: 400 });
    }

    const { songs, artists } = await readData();

    let artist = artists.find((a) => a.name === artistName);
    let newArtistId: number | null = null;

    if (!artist) {
      newArtistId = artists.length > 0 ? Math.max(...artists.map((a) => a.id)) + 1 : 1;
      artist = { id: newArtistId, name: artistName };
      artists.push(artist);
    }

    const songExists = songs.some((s) => s.title === title && s.artist_id === artist!.id);
    if (songExists) {
      return new NextResponse(JSON.stringify({ message: 'この曲は既に登録されています。' }), { status: 409 });
    }

    const newSongId = songs.length > 0 ? Math.max(...songs.map((s) => s.id)) + 1 : 1;
    const newSong: Song = {
      id: newSongId,
      title,
      artist_id: artist!.id,
      created_at: new Date().toISOString(),
    };
    songs.push(newSong);
    
    // artists.json の更新は、新しいアーティストが追加された場合のみ
    const writePromises = [fs.writeFile(songsFilePath, JSON.stringify(songs, null, 2))];
    if(newArtistId) {
      writePromises.push(fs.writeFile(artistsFilePath, JSON.stringify(artists, null, 2)));
    }

    await Promise.all(writePromises);

    return NextResponse.json(newSong, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/songs:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  } finally {
    isWriting = false;
  }
}
