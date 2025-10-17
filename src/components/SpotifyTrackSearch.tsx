import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { SEARCH_SPOTIFY_TRACKS } from '../lib/graphql/queries';
import { SearchNormal1, MusicCircle, Add, TickCircle } from 'iconsax-react';

interface SpotifyArtist {
  id: string;
  name: string;
}

interface SpotifyAlbum {
  id: string;
  name: string;
  image: string | null;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration: number;
  previewUrl: string | null;
  spotifyUrl: string;
  uri: string;
}

interface SpotifyTrackSearchProps {
  onSelectTrack: (track: SpotifyTrack) => void;
  selectedTrackIds: string[];
}

const SpotifyTrackSearch: React.FC<SpotifyTrackSearchProps> = ({ onSelectTrack, selectedTrackIds }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTracks, { data, loading, error }] = useLazyQuery(SEARCH_SPOTIFY_TRACKS);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length > 0) {
      searchTracks({
        variables: {
          query: searchQuery,
          limit: 20,
        },
      });
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const tracks: SpotifyTrack[] = data?.searchSpotifyTracks || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <MusicCircle size={24} variant="Bulk" color="#10B981" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Add Music from Spotify</h2>
          <p className="text-sm text-gray-500">Search and add background music for your video</p>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <SearchNormal1
              size={20}
              color="#9CA3AF"
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for songs, artists, or albums..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading || searchQuery.trim().length === 0}
            className="px-6 py-3 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {/* Error State */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Error:</strong> {error.message}
          </p>
        </div>
      )}

      {/* Results */}
      {tracks.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 mb-3">
            {tracks.length} track{tracks.length > 1 ? 's' : ''} found
          </p>
          <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
            {tracks.map((track) => {
              const isSelected = selectedTrackIds.includes(track.id);
              return (
                <div
                  key={track.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'bg-green-50 border-green-600'
                      : 'bg-white border-gray-200 hover:border-green-300'
                  }`}
                >
                  {/* Album Cover */}
                  {track.album.image ? (
                    <img
                      src={track.album.image}
                      alt={track.album.name}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MusicCircle size={32} color="#9CA3AF" />
                    </div>
                  )}

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate">
                      {track.name}
                    </h3>
                    <p className="text-xs text-gray-600 truncate">
                      {track.artists.map((a) => a.name).join(', ')}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">
                        {track.album.name}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {formatDuration(track.duration)}
                      </span>
                    </div>
                  </div>

                  {/* Preview & Add Button */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {track.previewUrl && (
                      <audio
                        controls
                        preload="none"
                        className="h-8"
                        style={{ width: '200px' }}
                      >
                        <source src={track.previewUrl} type="audio/mpeg" />
                      </audio>
                    )}
                    <button
                      onClick={() => onSelectTrack(track)}
                      disabled={isSelected}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        isSelected
                          ? 'bg-green-600 text-white cursor-default'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <TickCircle size={16} variant="Bold" color="#FFFFFF" />
                          Added
                        </>
                      ) : (
                        <>
                          <Add size={16} variant="Bold" color="#FFFFFF" />
                          Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && tracks.length === 0 && data && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MusicCircle size={32} color="#9CA3AF" />
          </div>
          <p className="text-gray-600 text-sm">
            No tracks found. Try a different search query.
          </p>
        </div>
      )}

      {/* Initial State */}
      {!data && !loading && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <SearchNormal1 size={32} color="#9CA3AF" />
          </div>
          <p className="text-gray-600 text-sm">
            Search for music to add to your video
          </p>
        </div>
      )}
    </div>
  );
};

export default SpotifyTrackSearch;
