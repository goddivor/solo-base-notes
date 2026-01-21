import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ANIME_CHARACTERS } from '../../lib/graphql/queries';
import { CloseCircle } from 'iconsax-react';
import { useTheme } from '../../context/theme-context';
import { cn } from '../../lib/utils';

interface Character {
  malId: number;
  name: string;
  image?: string;
}

interface CharacterSelectorProps {
  animeId: number;
  apiSource: 'MAL' | 'JIKAN';
  selectedCharacters: Character[];
  onCharactersChange: (characters: Character[]) => void;
}

const CharacterSelector: React.FC<CharacterSelectorProps> = ({
  animeId,
  apiSource,
  selectedCharacters,
  onCharactersChange,
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);

  const { loading } = useQuery(GET_ANIME_CHARACTERS, {
    variables: { animeId, source: apiSource },
    skip: !animeId,
    onCompleted: (data) => {
      setAllCharacters(data.getAnimeCharacters);
    },
  });

  const filteredCharacters = allCharacters.filter((char) =>
    char.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleCharacter = (character: Character) => {
    const isSelected = selectedCharacters.some((c) => c.malId === character.malId);
    if (isSelected) {
      onCharactersChange(selectedCharacters.filter((c) => c.malId !== character.malId));
    } else {
      onCharactersChange([...selectedCharacters, character]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Selected Characters */}
      {selectedCharacters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCharacters.map((char) => (
            <div
              key={char.malId}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl border-2",
                theme === "dark"
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                  : "bg-purple-50 text-purple-700 border-purple-200"
              )}
            >
              {char.image && (
                <img src={char.image} alt={char.name} className="w-6 h-6 rounded-full object-cover" />
              )}
              <span className="text-sm font-medium">{char.name}</span>
              <button
                type="button"
                onClick={() => handleToggleCharacter(char)}
                className={cn(
                  "rounded-full p-1 transition-colors",
                  theme === "dark" ? "hover:bg-purple-500/30" : "hover:bg-purple-100"
                )}
              >
                <CloseCircle size={16} variant="Bulk" color={theme === "dark" ? "#C084FC" : "#7C3AED"} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Rechercher des personnages..."
        className={cn(
          "w-full px-4 py-3 border-2 rounded-xl transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
          theme === "dark"
            ? "bg-[#0a0a0f] border-gray-700 text-white placeholder-gray-500"
            : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
        )}
      />

      {/* Characters List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className={cn(
            "text-sm mt-2",
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          )}>Chargement des personnages...</p>
        </div>
      ) : (
        <div className={cn(
          "grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1 rounded-xl",
          theme === "dark" ? "scrollbar-dark" : "scrollbar-light"
        )}>
          {filteredCharacters.map((character) => {
            const isSelected = selectedCharacters.some((c) => c.malId === character.malId);
            return (
              <button
                key={character.malId}
                type="button"
                onClick={() => handleToggleCharacter(character)}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-xl border-2 transition-all",
                  isSelected
                    ? theme === "dark"
                      ? "border-purple-500 bg-purple-500/20"
                      : "border-purple-600 bg-purple-50"
                    : theme === "dark"
                      ? "border-gray-700 hover:border-gray-600 bg-[#0a0a0f]"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                )}
              >
                {character.image && (
                  <img
                    src={character.image}
                    alt={character.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <span className={cn(
                  "text-sm font-medium truncate flex-1 text-left",
                  theme === "dark" ? "text-white" : "text-gray-900"
                )}>
                  {character.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CharacterSelector;
