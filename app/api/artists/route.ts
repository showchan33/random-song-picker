import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { initializeDbFiles } from '@/app/utils/db';

export async function GET() {
  const filePath = path.join(process.cwd(), 'db', 'artists.json');
  try {
    await initializeDbFiles();
    const fileContents = await fs.readFile(filePath, 'utf8');
    const artists = JSON.parse(fileContents);
    return NextResponse.json(artists);
  } catch (error) {
    console.error('Error reading artists.json:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
