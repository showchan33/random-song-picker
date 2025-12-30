'use client';

import { useState, useMemo } from 'react';
import { Song, Artist } from '@/app/types';

type SongWithArtist = Song & {
  artist_name: string;
};

type SongTableProps = {
  songs: Song[];
  artists: Artist[];
  onSongDeleted: () => void;
};

export default function SongTable({ songs, artists, onSongDeleted }: SongTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ type: 'date' | 'random'; order: 'asc' | 'desc'; trigger: number }>({
    type: 'date',
    order: 'desc',
    trigger: 0, // Used to force re-shuffle
  });
  const [selectedSongId, setSelectedSongId] = useState<number | null>(null);

  const artistMap = useMemo(() => 
    new Map(artists.map((artist) => [artist.id, artist.name]))
  , [artists]);

  const songsWithArtists = useMemo(() => 
    songs.map((song) => ({
      ...song,
      artist_name: artistMap.get(song.artist_id) || '不明なアーティスト',
    }))
  , [songs, artistMap]);

  const filteredSongs = useMemo(() => 
    songsWithArtists.filter(song =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  , [songsWithArtists, searchQuery]);

  const displayedSongs = useMemo(() => {
    let processedSongs = [...filteredSongs];

    if (sortConfig.type === 'date') {
      processedSongs.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortConfig.order === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (sortConfig.type === 'random') {
      // Fisher-Yates shuffle algorithm, triggered by sortConfig.trigger
      for (let i = processedSongs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [processedSongs[i], processedSongs[j]] = [processedSongs[j], processedSongs[i]];
      }
    }
    return processedSongs;
  }, [filteredSongs, sortConfig]);

  const handleDelete = async (songId: number) => {
    if (window.confirm('本当にこの曲を削除しますか？')) {
      try {
        const response = await fetch(`/api/songs/${songId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('曲が削除されました。');
          setSelectedSongId(null);
          onSongDeleted(); // 親コンポーネントに削除を通知
        } else {
          const data = await response.json();
          alert(`削除に失敗しました: ${data.error}`);
        }
      } catch (error) {
        console.error('削除処理中にエラーが発生しました:', error);
        alert('削除処理中にエラーが発生しました。');
      }
    }
  };

  const toggleDateSort = () => {
    setSortConfig(current => ({
      type: 'date',
      order: current.type === 'date' && current.order === 'desc' ? 'asc' : 'desc',
      trigger: current.trigger,
    }));
  };

  const randomizeSort = () => {
    setSortConfig(current => ({
      type: 'random',
      order: 'asc', // Not used, but required by type
      trigger: current.trigger + 1,
    }));
  };

  const dateSortButtonText = sortConfig.type === 'date' && sortConfig.order === 'desc' ? '登録日順' : '登録日逆順';

  if (songs.length === 0) {
    return <p>登録されている曲がありません。</p>;
  }

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="曲名またはアーティスト名で検索..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
       <div className="flex gap-2 mb-4">
        <button onClick={toggleDateSort} className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700">
          {dateSortButtonText}
        </button>
        <button onClick={randomizeSort} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
          ランダムに並び替え
        </button>
        {selectedSongId && (
          <button
            onClick={() => handleDelete(selectedSongId)}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            選択した曲を削除
          </button>
        )}
      </div>
      <div className="overflow-x-auto overflow-y-auto max-h-[60vh] border rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                曲名
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                アーティスト名
              </th>
              <th className="hidden md:table-cell px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                登録日
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedSongs.map((song) => (
              <tr 
                key={song.id} 
                onClick={() => setSelectedSongId(song.id === selectedSongId ? null : song.id)}
                className={`cursor-pointer ${selectedSongId === song.id ? 'bg-yellow-100' : 'hover:bg-gray-50'}`}
              >
                <td className="px-6 py-4 whitespace-normal md:whitespace-nowrap border-b border-gray-200">
                  {song.title}
                </td>
                <td className="px-6 py-4 whitespace-normal md:whitespace-nowrap border-b border-gray-200">
                  {song.artist_name}
                </td>
                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap border-b border-gray-200">
                  {new Date(song.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {displayedSongs.length === 0 && searchQuery && (
          <p className="text-center mt-4 p-4">検索条件に一致する曲が見つかりません。</p>
        )}
      </div>
    </div>
  );
}
