import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ANIME_EPISODES } from '../../lib/graphql/queries';
import { useTheme } from '../../context/theme-context';
import { cn } from '../../lib/utils';

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
  const { theme } = useTheme();
  const { data, loading, error } = useQuery(GET_ANIME_EPISODES, {
    variables: { animeId, source: apiSource },
    skip: !animeId,
  });

  const episodes: Episode[] = data?.getAnimeEpisodes || [];

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className={cn(
          "text-sm mt-2",
          theme === "dark" ? "text-gray-400" : "text-gray-600"
        )}>Chargement des épisodes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-red-500">Erreur de chargement: {error.message}</p>
        <p className={cn(
          "text-xs mt-2",
          theme === "dark" ? "text-gray-500" : "text-gray-500"
        )}>
          Note: Les données d'épisodes peuvent ne pas être disponibles pour tous les animes
        </p>
      </div>
    );
  }

  if (episodes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className={cn(
          "text-sm",
          theme === "dark" ? "text-gray-400" : "text-gray-600"
        )}>Aucun épisode trouvé pour cet anime.</p>
        <p className={cn(
          "text-xs mt-2",
          theme === "dark" ? "text-gray-500" : "text-gray-500"
        )}>Vous pouvez toujours entrer le numéro d'épisode manuellement ci-dessous.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className={cn(
        "max-h-96 overflow-y-auto border-2 rounded-xl",
        theme === "dark" ? "border-gray-700" : "border-gray-200"
      )}>
        <div className="grid grid-cols-1 gap-2 p-3">
          {episodes.map((episode) => (
            <button
              key={episode.number}
              type="button"
              onClick={() => onEpisodeSelect(episode.number, episode.duration)}
              className={cn(
                "p-4 rounded-xl border-2 transition-all text-left",
                selectedEpisode === episode.number
                  ? theme === "dark"
                    ? "border-purple-500 bg-purple-500/20"
                    : "border-purple-600 bg-purple-50"
                  : theme === "dark"
                    ? "border-gray-700 hover:border-gray-600 bg-[#0a0a0f]"
                    : "border-gray-200 hover:border-gray-300 bg-white"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "font-semibold",
                      theme === "dark" ? "text-purple-400" : "text-purple-600"
                    )}>
                      Épisode {episode.number}
                    </span>
                    {episode.duration && (
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-lg",
                        theme === "dark"
                          ? "text-gray-400 bg-gray-800"
                          : "text-gray-500 bg-gray-100"
                      )}>
                        {episode.duration} min
                      </span>
                    )}
                  </div>
                  <h4 className={cn(
                    "text-sm font-medium truncate",
                    theme === "dark" ? "text-white" : "text-gray-900"
                  )}>
                    {episode.title || 'Sans titre'}
                  </h4>
                  {episode.aired && (
                    <p className={cn(
                      "text-xs mt-1",
                      theme === "dark" ? "text-gray-500" : "text-gray-500"
                    )}>
                      Diffusé le: {new Date(episode.aired).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
                {selectedEpisode === episode.number && (
                  <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
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
