import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Song } from '@/app/types';

const songsFilePath = path.join(process.cwd(), 'db', 'songs.json');

// 曲の削除
export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    const params = await context.params;
    const songId = parseInt(params.id, 10);

    if (isNaN(songId)) {
      return NextResponse.json({ error: 'Invalid song ID' }, { status: 400 });
    }

    const songsData = await fs.readFile(songsFilePath, 'utf-8');
    const songs: Song[] = JSON.parse(songsData);

    const songIndex = songs.findIndex((song) => song.id === songId);

    if (songIndex === -1) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    songs.splice(songIndex, 1);

    await fs.writeFile(songsFilePath, JSON.stringify(songs, null, 2));

    return NextResponse.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Error deleting song:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
