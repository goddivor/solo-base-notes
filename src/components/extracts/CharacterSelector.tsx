import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ANIME_CHARACTERS } from '../../lib/graphql/queries';
import { CloseCircle } from 'iconsax-react';

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
              className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200"
            >
              {char.image && (
                <img src={char.image} alt={char.name} className="w-6 h-6 rounded-full" />
              )}
              <span className="text-sm font-medium">{char.name}</span>
              <button
                type="button"
                onClick={() => handleToggleCharacter(char)}
                className="hover:bg-indigo-100 rounded-full p-1"
              >
                <CloseCircle size={16} variant="Bulk" color="#4F46E5" />
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
        placeholder="Search characters..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />

      {/* Characters List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600 mt-2">Loading characters...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {filteredCharacters.map((character) => {
            const isSelected = selectedCharacters.some((c) => c.malId === character.malId);
            return (
              <button
                key={character.malId}
                type="button"
                onClick={() => handleToggleCharacter(character)}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {character.image && (
                  <img
                    src={character.image}
                    alt={character.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <span className="text-sm font-medium text-gray-900 truncate flex-1 text-left">
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
