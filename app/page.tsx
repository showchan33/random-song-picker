'use client';

import { useEffect, useState, useCallback } from 'react';
import SongTable from './components/SongTable';
import SongForm from './components/SongForm';
import SongPicker from './components/SongPicker';
import { Artist, Song } from '@/app/types';

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // データをフェッチする前にローディング状態をリセットすることが望ましい場合がある
    // setLoading(true); 
    setError(null);
    try {
      const [songsRes, artistsRes] = await Promise.all([
        fetch('/api/songs'),
        fetch('/api/artists'),
      ]);

      if (!songsRes.ok || !artistsRes.ok) {
        throw new Error('データの取得に失敗しました。');
      }

      const songsData = await songsRes.json();
      const artistsData = await artistsRes.json();

      setSongs(songsData);
      setArtists(artistsData);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('不明なエラーが発生しました。');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSongAdded = () => {
    fetchData(); // データを再取得して一覧を更新
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center my-8">
        ランダム選曲ツール
      </h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">ランダム選曲</h2>
        <SongPicker songs={songs} artists={artists} />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">登録曲一覧</h2>
        {loading && <p>読み込み中...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <SongTable songs={songs} artists={artists} onSongDeleted={fetchData} />
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">曲の登録</h2>
        <SongForm
          onSongAdded={handleSongAdded}
          songs={songs}
          artists={artists}
        />
      </section>
    </main>
  );
}