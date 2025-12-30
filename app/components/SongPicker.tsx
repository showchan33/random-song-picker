'use client';

import { useState, useMemo } from 'react';
import { Song, Artist } from '@/app/types';

type SongWithArtist = Song & {
  artist_name: string;
};

type SongPickerProps = {
  songs: Song[];
  artists: Artist[];
};

type Algorithm = 'random' | 'artist-equal' | 'artist-weighted';

export default function SongPicker({ songs, artists }: SongPickerProps) {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>('random');
  const [pickedSong, setPickedSong] = useState<SongWithArtist | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const artistMap = useMemo(() => 
    new Map(artists.map((artist) => [artist.id, artist.name]))
  , [artists]);

  const songsWithArtists = useMemo(() => 
    songs.map((song) => ({
      ...song,
      artist_name: artistMap.get(song.artist_id) || '不明なアーティスト',
    }))
  , [songs, artistMap]);


  const handlePickSong = () => {
    setError(null);
    if (songs.length === 0) {
      setError('選曲対象の曲がありません。');
      setPickedSong(null);
      return;
    }

    let result: SongWithArtist;

    switch (selectedAlgorithm) {
      case 'random': {
        const randomIndex = Math.floor(Math.random() * songsWithArtists.length);
        result = songsWithArtists[randomIndex];
        break;
      }
      
      case 'artist-equal': {
        if (artists.length === 0) {
            setError('選曲対象のアーティストがいません。');
            return;
        }
        const randomArtistIndex = Math.floor(Math.random() * artists.length);
        const selectedArtist = artists[randomArtistIndex];
        const songsByArtist = songsWithArtists.filter(s => s.artist_id === selectedArtist.id);
        
        if (songsByArtist.length === 0) {
            setError(`${selectedArtist.name} の曲が見つかりませんでした。再試行してください。`);
            return;
        }
        const randomIndex = Math.floor(Math.random() * songsByArtist.length);
        result = songsByArtist[randomIndex];
        break;
      }

      case 'artist-weighted': {
        const artistSongCounts = artists.map(artist => {
            const count = songs.filter(song => song.artist_id === artist.id).length;
            return { artistId: artist.id, weight: Math.sqrt(count) };
        }).filter(item => item.weight > 0);

        if (artistSongCounts.length === 0) {
            setError('選曲対象の曲がありません。');
            return;
        }

        const totalWeight = artistSongCounts.reduce((sum, item) => sum + item.weight, 0);
        let randomValue = Math.random() * totalWeight;

        let selectedArtistId: number | null = null;
        for (const item of artistSongCounts) {
            randomValue -= item.weight;
            if (randomValue <= 0) {
                selectedArtistId = item.artistId;
                break;
            }
        }
        
        if (!selectedArtistId) {
            selectedArtistId = artistSongCounts[artistSongCounts.length-1].artistId;
        }
        
        const songsByArtist = songsWithArtists.filter(s => s.artist_id === selectedArtistId);
        const randomIndex = Math.floor(Math.random() * songsByArtist.length);
        result = songsByArtist[randomIndex];
        break;
      }
    }
    
    setPickedSong(result);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border">
        <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">選曲アルゴリズム</h3>
            <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center space-x-2">
                    <input type="radio" name="algorithm" value="random" checked={selectedAlgorithm === 'random'} onChange={() => setSelectedAlgorithm('random')} className="form-radio text-indigo-600"/>
                    <span>純粋ランダム</span>
                </label>
                 <label className="flex items-center space-x-2">
                    <input type="radio" name="algorithm" value="artist-equal" checked={selectedAlgorithm === 'artist-equal'} onChange={() => setSelectedAlgorithm('artist-equal')} className="form-radio text-indigo-600"/>
                    <span>アーティスト均等化</span>
                </label>
                 <label className="flex items-center space-x-2">
                    <input type="radio" name="algorithm" value="artist-weighted" checked={selectedAlgorithm === 'artist-weighted'} onChange={() => setSelectedAlgorithm('artist-weighted')} className="form-radio text-indigo-600"/>
                    <span>重み付けランダム</span>
                </label>
            </div>
        </div>
        
        <div className="text-center mb-6">
            <button onClick={handlePickSong} className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-full hover:bg-indigo-700 transition duration-300 text-lg">
                選曲！
            </button>
        </div>
        
        {error && <p className="text-red-500 text-center">{error}</p>}
        
        {pickedSong && (
            <div className="mt-6 text-center bg-gray-50 p-6 rounded-lg animate-fade-in">
                <p className="text-3xl font-bold my-2 text-indigo-800">{pickedSong.title}</p>
                <p className="text-xl text-gray-700">{pickedSong.artist_name}</p>
            </div>
        )}
    </div>
  );
}
