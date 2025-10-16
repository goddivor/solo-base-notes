import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { SEARCH_ANIME } from '../../lib/graphql/queries';
import { SearchNormal1 } from 'iconsax-react';

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
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <img
            src={selectedAnime.image}
            alt={selectedAnime.title}
            className="w-16 h-24 object-cover rounded"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{selectedAnime.title}</h3>
            <p className="text-sm text-gray-500">ID: {selectedAnime.id}</p>
          </div>
          <button
            type="button"
            onClick={() => onSelect(null!)}
            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
          >
            Change
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type to search for an anime..."
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <SearchNormal1
              size={20}
              color="#9CA3AF"
              className="absolute left-3 top-1/2 -translate-y-1/2"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {showResults && results.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
              {results.map((anime) => (
                <button
                  key={anime.id}
                  type="button"
                  onClick={() => handleSelect(anime)}
                  className="w-full flex items-start gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 text-left"
                >
                  <img
                    src={anime.image}
                    alt={anime.title}
                    className="w-12 h-16 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{anime.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
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
