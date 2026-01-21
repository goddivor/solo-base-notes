import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { SEARCH_ANIME } from '../../lib/graphql/queries';
import { SearchNormal1 } from 'iconsax-react';
import { useTheme } from '../../context/theme-context';
import { cn } from '../../lib/utils';

interface Anime {
  id: number;
  title: string;
  image: string;
  synopsis?: string;
  episodes?: number;
  score?: number;
  year?: number;
}

interface AnimeSearchProps {
  onSelect: (anime: { id: number; title: string; image: string; season?: number }) => void;
  selectedAnime: { id: number; title: string; image: string; season?: number } | null;
  apiSource: 'MAL' | 'JIKAN';
}

const AnimeSearch: React.FC<AnimeSearchProps> = ({ onSelect, selectedAnime, apiSource }) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Anime[]>([]);
  const [showResults, setShowResults] = useState(false);

  const [searchAnime, { loading }] = useLazyQuery(SEARCH_ANIME, {
    onCompleted: (data) => {
      setResults(data.searchAnime);
      setShowResults(true);
    },
    onError: (error) => {
      console.error('Error searching anime:', error);
    },
  });

  // Real-time search with debounce
  React.useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(() => {
      searchAnime({
        variables: {
          query: searchQuery,
          source: apiSource,
        },
      });
    }, 500); // Debounce 500ms

    return () => clearTimeout(timer);
  }, [searchQuery, apiSource, searchAnime]);

  const handleSelect = (anime: Anime) => {
    // Try to extract season number from title (e.g., "Season 2", "2nd Season")
    const seasonMatch = anime.title.match(/Season\s+(\d+)|(\d+)(?:nd|rd|th)\s+Season/i);
    const season = seasonMatch ? parseInt(seasonMatch[1] || seasonMatch[2]) : undefined;

    onSelect({
      id: anime.id,
      title: anime.title,
      image: anime.image,
      season,
    });
    setShowResults(false);
    setSearchQuery('');
  };

  return (
    <div className="space-y-4">
      {selectedAnime ? (
        <div className={cn(
          "flex items-center gap-4 p-4 rounded-xl border-2",
          theme === "dark"
            ? "bg-[#0a0a0f] border-gray-700"
            : "bg-gray-50 border-gray-200"
        )}>
          <img
            src={selectedAnime.image}
            alt={selectedAnime.title}
            className="w-16 h-24 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h3 className={cn(
              "font-semibold",
              theme === "dark" ? "text-white" : "text-gray-900"
            )}>{selectedAnime.title}</h3>
            <p className={cn(
              "text-sm",
              theme === "dark" ? "text-gray-500" : "text-gray-500"
            )}>ID: {selectedAnime.id}</p>
          </div>
          <button
            type="button"
            onClick={() => onSelect(null!)}
            className={cn(
              "px-3 py-1 text-sm rounded-lg transition-colors",
              theme === "dark"
                ? "text-red-400 hover:bg-red-500/10"
                : "text-red-600 hover:bg-red-50"
            )}
          >
            Changer
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tapez pour rechercher un anime..."
              className={cn(
                "w-full px-4 py-3 pl-10 border-2 rounded-xl transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                theme === "dark"
                  ? "bg-[#0a0a0f] border-gray-700 text-white placeholder-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              )}
            />
            <SearchNormal1
              size={20}
              color={theme === "dark" ? "#6B7280" : "#9CA3AF"}
              className="absolute left-3 top-1/2 -translate-y-1/2"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {showResults && results.length > 0 && (
            <div className={cn(
              "absolute z-10 w-full mt-2 border-2 rounded-xl shadow-xl max-h-96 overflow-y-auto",
              theme === "dark"
                ? "bg-[#12121a] border-gray-700"
                : "bg-white border-gray-200"
            )}>
              {results.map((anime) => (
                <button
                  key={anime.id}
                  type="button"
                  onClick={() => handleSelect(anime)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 border-b last:border-0 text-left transition-colors",
                    theme === "dark"
                      ? "hover:bg-purple-500/10 border-gray-700"
                      : "hover:bg-gray-50 border-gray-100"
                  )}
                >
                  <img
                    src={anime.image}
                    alt={anime.title}
                    className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      "font-medium truncate",
                      theme === "dark" ? "text-white" : "text-gray-900"
                    )}>{anime.title}</h4>
                    <div className={cn(
                      "flex items-center gap-2 text-xs mt-1",
                      theme === "dark" ? "text-gray-500" : "text-gray-500"
                    )}>
                      {anime.year && <span>{anime.year}</span>}
                      {anime.episodes && <span>• {anime.episodes} eps</span>}
                      {anime.score && <span>• ⭐ {anime.score}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnimeSearch;
