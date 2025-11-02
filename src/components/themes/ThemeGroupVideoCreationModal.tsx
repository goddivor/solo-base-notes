import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router';
import { GET_THEME_GROUP_WITH_EXTRACTS } from '../../lib/graphql/queries';
import { CloseCircle, TickCircle, VideoPlay } from 'iconsax-react';
import Button from '../actions/button';
import { useToast } from '../../context/toast-context';

interface Character {
  malId: number;
  name: string;
  image?: string;
}

interface Theme {
  id: string;
  name: string;
  color: string;
  extractCount: number;
}

interface ThemeGroup {
  id: string;
  name: string;
  color: string;
  themes: Theme[];
  extractCount: number;
}

interface Extract {
  id: string;
  text: string;
  animeTitle: string;
  animeImage?: string;
  episode?: number;
  characters: Character[];
  theme?: {
    id: string;
    name: string;
    color: string;
  };
  isUsedInVideo: boolean;
}

interface Props {
  themeGroup: ThemeGroup;
  isOpen: boolean;
  onClose: () => void;
}

const ThemeGroupVideoCreationModal: React.FC<Props> = ({ themeGroup, isOpen, onClose }) => {
  const toast = useToast();
  const navigate = useNavigate();
  const [selectedThemeIds, setSelectedThemeIds] = useState<Set<string>>(
    new Set(themeGroup.themes.map(t => t.id))
  );
  const [selectedExtractIds, setSelectedExtractIds] = useState<Set<string>>(new Set());

  const { data, loading } = useQuery(GET_THEME_GROUP_WITH_EXTRACTS, {
    variables: { id: themeGroup.id },
    skip: !isOpen,
    onCompleted: (data) => {
      // Initialize all unused extracts as selected when data loads
      if (data?.extracts) {
        const availableExtractIds = data.extracts
          .filter((extract: Extract) =>
            selectedThemeIds.has(extract.theme?.id || '') &&
            !extract.isUsedInVideo  // Only select extracts not already used
          )
          .map((extract: Extract) => extract.id);
        setSelectedExtractIds(new Set(availableExtractIds));
      }
    },
  });


  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allExtracts: Extract[] = data?.extracts || [];

  // Group extracts by theme
  const extractsByTheme = useMemo(() => {
    const grouped = new Map<string, Extract[]>();

    allExtracts.forEach(extract => {
      if (extract.theme) {
        const themeId = extract.theme.id;
        if (!grouped.has(themeId)) {
          grouped.set(themeId, []);
        }
        grouped.get(themeId)?.push(extract);
      }
    });

    return grouped;
  }, [allExtracts]);

  const toggleTheme = (themeId: string) => {
    const newSelectedThemes = new Set(selectedThemeIds);
    const themeExtracts = extractsByTheme.get(themeId) || [];

    if (newSelectedThemes.has(themeId)) {
      // Deselecting theme - remove all its extracts
      newSelectedThemes.delete(themeId);
      const newSelectedExtracts = new Set(selectedExtractIds);
      themeExtracts.forEach(extract => newSelectedExtracts.delete(extract.id));
      setSelectedExtractIds(newSelectedExtracts);
    } else {
      // Selecting theme - add only unused extracts
      newSelectedThemes.add(themeId);
      const newSelectedExtracts = new Set(selectedExtractIds);
      themeExtracts.forEach(extract => {
        if (!extract.isUsedInVideo) {
          newSelectedExtracts.add(extract.id);
        }
      });
      setSelectedExtractIds(newSelectedExtracts);
    }

    setSelectedThemeIds(newSelectedThemes);
  };

  const toggleExtract = (extractId: string, themeId: string, isUsedInVideo: boolean) => {
    // Prevent selection of extracts already used in a video
    if (isUsedInVideo) {
      toast.error('Extrait déjà utilisé', 'Cet extrait est déjà utilisé dans une vidéo et ne peut pas être sélectionné');
      return;
    }

    const newSelectedExtracts = new Set(selectedExtractIds);

    if (newSelectedExtracts.has(extractId)) {
      newSelectedExtracts.delete(extractId);
    } else {
      newSelectedExtracts.add(extractId);
      // If extract is selected, make sure its theme is also selected
      if (!selectedThemeIds.has(themeId)) {
        setSelectedThemeIds(new Set([...selectedThemeIds, themeId]));
      }
    }

    setSelectedExtractIds(newSelectedExtracts);
  };

  const handleContinueToBuilder = () => {
    if (selectedExtractIds.size === 0) {
      toast.error('Aucun extrait sélectionné', 'Veuillez sélectionner au moins un extrait');
      return;
    }

    // Navigate to video builder with selected extract IDs (same as extracts page)
    navigate('/dashboard/video/builder', {
      state: { extractIds: Array.from(selectedExtractIds) }
    });

    onClose();
  };

  const handleClose = () => {
    // Reset selections when closing
    setSelectedThemeIds(new Set(themeGroup.themes.map(t => t.id)));
    setSelectedExtractIds(new Set());
    onClose();
  };

  if (!isOpen) return null;

  const selectedExtractCount = selectedExtractIds.size;
  const totalExtractCount = allExtracts.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <VideoPlay size={24} variant="Bulk" color="#9333EA" />
              Créer une Vidéo - {themeGroup.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Sélectionnez les thèmes et extraits à inclure dans la vidéo
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <CloseCircle size={28} variant="Bulk" color="#9CA3AF" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {themeGroup.themes.map(theme => {
                const themeExtracts = extractsByTheme.get(theme.id) || [];
                const isThemeSelected = selectedThemeIds.has(theme.id);
                const selectedCount = themeExtracts.filter(e => selectedExtractIds.has(e.id)).length;

                return (
                  <div
                    key={theme.id}
                    className={`border-2 rounded-xl overflow-hidden transition-all ${
                      isThemeSelected ? 'border-purple-300 bg-purple-50/30' : 'border-gray-200'
                    }`}
                  >
                    {/* Theme Header */}
                    <button
                      onClick={() => toggleTheme(theme.id)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: theme.color }}
                        >
                          {isThemeSelected && (
                            <TickCircle size={20} variant="Bold" color="#FFFFFF" />
                          )}
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-gray-900">{theme.name}</h3>
                          <p className="text-sm text-gray-600">
                            {selectedCount} / {themeExtracts.length} extraits sélectionnés
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isThemeSelected
                              ? 'bg-purple-600 border-purple-600'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isThemeSelected && (
                            <TickCircle size={16} variant="Bold" color="#FFFFFF" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Theme Extracts */}
                    {isThemeSelected && themeExtracts.length > 0 && (
                      <div className="px-4 pb-4 space-y-2">
                        {themeExtracts.map(extract => {
                          const isExtractSelected = selectedExtractIds.has(extract.id);
                          const isUsed = extract.isUsedInVideo;
                          const isDisabled = isUsed;

                          return (
                            <button
                              key={extract.id}
                              onClick={() => toggleExtract(extract.id, theme.id, isUsed)}
                              disabled={isDisabled}
                              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                                isDisabled
                                  ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50'
                                  : isExtractSelected
                                  ? 'border-purple-400 bg-purple-50'
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-all ${
                                    isExtractSelected && !isDisabled
                                      ? 'bg-purple-600 border-purple-600'
                                      : isDisabled
                                      ? 'border-gray-400 bg-gray-200'
                                      : 'border-gray-300 bg-white'
                                  }`}
                                >
                                  {isExtractSelected && !isDisabled && (
                                    <TickCircle size={12} variant="Bold" color="#FFFFFF" />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start gap-3">
                                    {extract.animeImage && (
                                      <img
                                        src={extract.animeImage}
                                        alt={extract.animeTitle}
                                        className="w-12 h-16 object-cover rounded flex-shrink-0"
                                      />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <div className="font-medium text-gray-900 text-sm">
                                          {extract.animeTitle}
                                          {extract.episode && (
                                            <span className="text-gray-500 ml-1">
                                              - Ep. {extract.episode}
                                            </span>
                                          )}
                                        </div>
                                        {isUsed && (
                                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                                            Déjà utilisé
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-700 italic mt-1 line-clamp-2">
                                        "{extract.text}"
                                      </p>
                                      {extract.characters.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {extract.characters.slice(0, 3).map(char => (
                                            <span
                                              key={char.malId}
                                              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full"
                                            >
                                              {char.name}
                                            </span>
                                          ))}
                                          {extract.characters.length > 3 && (
                                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                                              +{extract.characters.length - 3}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {isThemeSelected && themeExtracts.length === 0 && (
                      <div className="px-4 pb-4 text-center py-6 text-gray-500 text-sm">
                        Aucun extrait disponible pour ce thème
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-purple-600">{selectedExtractCount}</span> / {totalExtractCount} extraits sélectionnés
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-purple-600">{selectedThemeIds.size}</span> / {themeGroup.themes.length} thèmes sélectionnés
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-all"
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleContinueToBuilder}
              disabled={selectedExtractIds.size === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <TickCircle size={20} variant="Bulk" color="#FFFFFF" />
              Continuer ({selectedExtractIds.size} extraits)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeGroupVideoCreationModal;
