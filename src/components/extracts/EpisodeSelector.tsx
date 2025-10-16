import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ANIME_EPISODES } from '../../lib/graphql/queries';

interface Episode {
  number: number;
  title: string;
  aired?: string;
  duration?: number;
}

interface EpisodeSelectorProps {
  animeId: number;
  apiSource: 'MAL' | 'JIKAN';
  selectedEpisode?: number;
  onEpisodeSelect: (episodeNumber: number, duration?: number) => void;
}

const EpisodeSelector: React.FC<EpisodeSelectorProps> = ({
  animeId,
  apiSource,
  selectedEpisode,
  onEpisodeSelect,
}) => {
  const { data, loading, error } = useQuery(GET_ANIME_EPISODES, {
    variables: { animeId, source: apiSource },
    skip: !animeId,
  });

  const episodes: Episode[] = data?.getAnimeEpisodes || [];

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-600 mt-2">Loading episodes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-red-600">Error loading episodes: {error.message}</p>
        <p className="text-xs text-gray-500 mt-2">
          Note: Episode data may not be available for all anime
        </p>
      </div>
    );
  }

  if (episodes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-600">No episodes found for this anime.</p>
        <p className="text-xs text-gray-500 mt-2">You can still enter the episode number manually below.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
        <div className="grid grid-cols-1 gap-2 p-3">
          {episodes.map((episode) => (
            <button
              key={episode.number}
              type="button"
              onClick={() => onEpisodeSelect(episode.number, episode.duration)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedEpisode === episode.number
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-indigo-600">
                      Episode {episode.number}
                    </span>
                    {episode.duration && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {episode.duration} min
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {episode.title || 'Untitled'}
                  </h4>
                  {episode.aired && (
                    <p className="text-xs text-gray-500 mt-1">
                      Aired: {new Date(episode.aired).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {selectedEpisode === episode.number && (
                  <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EpisodeSelector;
