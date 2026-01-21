import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { SEARCH_SPOTIFY_TRACKS } from '../lib/graphql/queries';
import { SearchNormal1, MusicCircle, Add, TickCircle } from 'iconsax-react';
import { useTheme } from '../context/theme-context';
import { cn } from '../lib/utils';

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
  const { theme } = useTheme();
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
    <div className={cn(
      "rounded-xl shadow-sm border-2 p-6",
      theme === "dark"
        ? "bg-[#12121a] border-gray-700"
        : "bg-white border-gray-200"
    )}>
      <div className="flex items-center gap-3 mb-6">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          theme === "dark" ? "bg-green-500/20" : "bg-green-100"
        )}>
          <MusicCircle size={24} variant="Bulk" color="#10B981" />
        </div>
        <div>
          <h2 className={cn(
            "text-xl font-bold",
            theme === "dark" ? "text-white" : "text-gray-900"
          )}>Add Music from Spotify</h2>
          <p className={cn(
            "text-sm",
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          )}>Search and add background music for your video</p>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <SearchNormal1
              size={20}
              color={theme === "dark" ? "#6B7280" : "#9CA3AF"}
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for songs, artists, or albums..."
              className={cn(
                "w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm",
                theme === "dark"
                  ? "bg-[#0a0a0f] border-gray-700 text-white placeholder-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              )}
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
        <div className={cn(
          "mb-4 p-4 border rounded-lg",
          theme === "dark"
            ? "bg-red-500/10 border-red-500/30"
            : "bg-red-50 border-red-200"
        )}>
          <p className={cn(
            "text-sm",
            theme === "dark" ? "text-red-400" : "text-red-800"
          )}>
            <strong>Error:</strong> {error.message}
          </p>
        </div>
      )}

      {/* Results */}
      {tracks.length > 0 && (
        <div className="space-y-2">
          <p className={cn(
            "text-sm mb-3",
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          )}>
            {tracks.length} track{tracks.length > 1 ? 's' : ''} found
          </p>
          <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
            {tracks.map((track) => {
              const isSelected = selectedTrackIds.includes(track.id);
              return (
                <div
                  key={track.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                    isSelected
                      ? theme === "dark"
                        ? "bg-green-500/20 border-green-600"
                        : "bg-green-50 border-green-600"
                      : theme === "dark"
                        ? "bg-[#1a1a25] border-gray-700 hover:border-green-500/50"
                        : "bg-white border-gray-200 hover:border-green-300"
                  )}
                >
                  {/* Album Cover */}
                  {track.album.image ? (
                    <img
                      src={track.album.image}
                      alt={track.album.name}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className={cn(
                      "w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0",
                      theme === "dark" ? "bg-gray-800" : "bg-gray-200"
                    )}>
                      <MusicCircle size={32} color={theme === "dark" ? "#6B7280" : "#9CA3AF"} />
                    </div>
                  )}

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className={cn(
                      "text-sm font-bold truncate",
                      theme === "dark" ? "text-white" : "text-gray-900"
                    )}>
                      {track.name}
                    </h3>
                    <p className={cn(
                      "text-xs truncate",
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    )}>
                      {track.artists.map((a) => a.name).join(', ')}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={cn(
                        "text-xs",
                        theme === "dark" ? "text-gray-500" : "text-gray-500"
                      )}>
                        {track.album.name}
                      </span>
                      <span className={cn(
                        "text-xs",
                        theme === "dark" ? "text-gray-600" : "text-gray-400"
                      )}>•</span>
                      <span className={cn(
                        "text-xs",
                        theme === "dark" ? "text-gray-500" : "text-gray-500"
                      )}>
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
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all",
                        isSelected
                          ? "bg-green-600 text-white cursor-default"
                          : "bg-green-600 text-white hover:bg-green-700"
                      )}
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
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3",
            theme === "dark" ? "bg-gray-800" : "bg-gray-100"
          )}>
            <MusicCircle size={32} color={theme === "dark" ? "#6B7280" : "#9CA3AF"} />
          </div>
          <p className={cn(
            "text-sm",
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          )}>
            No tracks found. Try a different search query.
          </p>
        </div>
      )}

      {/* Initial State */}
      {!data && !loading && (
        <div className="text-center py-8">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3",
            theme === "dark" ? "bg-gray-800" : "bg-gray-100"
          )}>
            <SearchNormal1 size={32} color={theme === "dark" ? "#6B7280" : "#9CA3AF"} />
          </div>
          <p className={cn(
            "text-sm",
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          )}>
            Search for music to add to your video
          </p>
        </div>
      )}
    </div>
  );
};

export default SpotifyTrackSearch;
