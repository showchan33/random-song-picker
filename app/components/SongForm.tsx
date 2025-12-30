'use client';

import { useState } from 'react';
import { Song, Artist } from '@/app/types';

type SongFormProps = {
  onSongAdded: () => void;
  songs: Song[];
  artists: Artist[];
};

export default function SongForm({ onSongAdded, songs, artists }: SongFormProps) {
  const [title, setTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [artistSuggestions, setArtistSuggestions] = useState<string[]>([]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    if (value) {
      const uniqueTitles = [...new Set(songs
        .filter(song => song.title.toLowerCase().startsWith(value.toLowerCase()))
        .map(song => song.title)
      )];
      setTitleSuggestions(uniqueTitles.slice(0, 5)); // 上位5件に絞る
    } else {
      setTitleSuggestions([]);
    }
  };

  const handleArtistNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setArtistName(value);
    if (value) {
      const uniqueArtists = [...new Set(artists
        .filter(artist => artist.name.toLowerCase().startsWith(value.toLowerCase()))
        .map(artist => artist.name)
      )];
      setArtistSuggestions(uniqueArtists.slice(0, 5)); // 上位5件に絞る
    } else {
      setArtistSuggestions([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !artistName) {
      setError('曲名とアーティスト名を入力してください。');
      return;
    }
    // サジェストリストが開いている場合は閉じる
    setTitleSuggestions([]);
    setArtistSuggestions([]);
    setError(null);
    setSubmitting(true);

    try {
      // (Submit logic remains the same)
      const res = await fetch('/api/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, artistName }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || '登録に失敗しました。');
      }

      setTitle('');
      setArtistName('');
      onSongAdded();
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('不明なエラーが発生しました。');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            曲名
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={handleTitleChange}
            autoComplete="off"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="例: ライラック"
          />
          {titleSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
              {titleSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setTitle(suggestion);
                    setTitleSuggestions([]);
                  }}
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="relative">
          <label htmlFor="artistName" className="block text-sm font-medium text-gray-700">
            アーティスト名
          </label>
          <input
            type="text"
            id="artistName"
            value={artistName}
            onChange={handleArtistNameChange}
            autoComplete="off"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="例: Mrs. GREEN APPLE"
          />
          {artistSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
              {artistSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setArtistName(suggestion);
                    setArtistSuggestions([]);
                  }}
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {submitting ? '登録中...' : '登録'}
          </button>
        </div>
      </form>
    </div>
  );
}
