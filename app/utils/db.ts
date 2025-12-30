import { promises as fs } from 'fs';
import path from 'path';

const dbDirectory = path.join(process.cwd(), 'db');
const songsFilePath = path.join(dbDirectory, 'songs.json');
const artistsFilePath = path.join(dbDirectory, 'artists.json');

// データベースファイルとディレクトリを初期化する
export async function initializeDbFiles() {
  try {
    // dbディレクトリが存在しない場合は作成する
    await fs.mkdir(dbDirectory, { recursive: true });

    // songs.json が存在しない場合は空の配列で作成する
    try {
      await fs.access(songsFilePath);
    } catch {
      await fs.writeFile(songsFilePath, JSON.stringify([], null, 2));
    }

    // artists.json が存在しない場合は空の配列で作成する
    try {
      await fs.access(artistsFilePath);
    } catch {
      await fs.writeFile(artistsFilePath, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error("データベースファイルの初期化中にエラーが発生しました:", error);
    // 初期化に失敗した場合は、アプリケーションが正しく動作しない可能性が高いため、
    // エラーを再スローして問題を明確にする
    throw new Error("データベースファイルの初期化に失敗しました。");
  }
}
