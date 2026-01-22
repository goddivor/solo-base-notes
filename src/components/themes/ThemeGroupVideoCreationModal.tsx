import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router';
import { GET_THEME_GROUP_WITH_EXTRACTS } from '../../lib/graphql/queries';
import { CloseCircle, TickCircle, VideoPlay } from 'iconsax-react';
import Button from '../actions/button';
import { useToast } from '../../context/toast-context';
import { useTheme } from '../../context/theme-context';
import { cn } from '../../lib/utils';

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
  const { theme } = useTheme();
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={cn(
        "rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col border",
        theme === "dark"
          ? "bg-[#1a1a25] border-gray-700"
          : "bg-white border-gray-200"
      )}>
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between px-6 py-4 border-b",
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        )}>
          <div>
            <h2 className={cn(
              "text-xl font-bold flex items-center gap-2",
              theme === "dark" ? "text-white" : "text-gray-900"
            )}>
              <VideoPlay size={24} variant="Bulk" color="#9333EA" />
              Créer une Vidéo - {themeGroup.name}
            </h2>
            <p className={cn(
              "text-sm mt-1",
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}>
              Sélectionnez les thèmes et extraits à inclure dans la vidéo
            </p>
          </div>
          <button
            onClick={handleClose}
            className={cn(
              "transition-colors",
              theme === "dark" ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <CloseCircle size={28} variant="Bulk" color={theme === "dark" ? "#6B7280" : "#9CA3AF"} />
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
              {themeGroup.themes.map(themeItem => {
                const themeExtracts = extractsByTheme.get(themeItem.id) || [];
                const isThemeSelected = selectedThemeIds.has(themeItem.id);
                const selectedCount = themeExtracts.filter(e => selectedExtractIds.has(e.id)).length;

                return (
                  <div
                    key={themeItem.id}
                    className={cn(
                      "border-2 rounded-xl overflow-hidden transition-all",
                      isThemeSelected
                        ? theme === "dark"
                          ? "border-purple-500/50 bg-purple-500/10"
                          : "border-purple-300 bg-purple-50/30"
                        : theme === "dark"
                        ? "border-gray-700"
                        : "border-gray-200"
                    )}
                  >
                    {/* Theme Header */}
                    <button
                      onClick={() => toggleTheme(themeItem.id)}
                      className={cn(
                        "w-full px-4 py-3 flex items-center justify-between transition-colors",
                        theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-50/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: themeItem.color }}
                        >
                          {isThemeSelected && (
                            <TickCircle size={20} variant="Bold" color="#FFFFFF" />
                          )}
                        </div>
                        <div className="text-left">
                          <h3 className={cn(
                            "font-bold",
                            theme === "dark" ? "text-white" : "text-gray-900"
                          )}>{themeItem.name}</h3>
                          <p className={cn(
                            "text-sm",
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          )}>
                            {selectedCount} / {themeExtracts.length} extraits sélectionnés
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                            isThemeSelected
                              ? "bg-purple-600 border-purple-600"
                              : theme === "dark"
                              ? "border-gray-600 bg-gray-800"
                              : "border-gray-300 bg-white"
                          )}
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
                              onClick={() => toggleExtract(extract.id, themeItem.id, isUsed)}
                              disabled={isDisabled}
                              className={cn(
                                "w-full p-3 rounded-lg border-2 transition-all text-left",
                                isDisabled
                                  ? theme === "dark"
                                    ? "opacity-50 cursor-not-allowed border-gray-700 bg-gray-800"
                                    : "opacity-50 cursor-not-allowed border-gray-200 bg-gray-50"
                                  : isExtractSelected
                                  ? theme === "dark"
                                    ? "border-purple-500 bg-purple-500/20"
                                    : "border-purple-400 bg-purple-50"
                                  : theme === "dark"
                                  ? "border-gray-700 bg-[#12121a] hover:border-gray-600"
                                  : "border-gray-200 bg-white hover:border-gray-300"
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={cn(
                                    "flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-all",
                                    isExtractSelected && !isDisabled
                                      ? "bg-purple-600 border-purple-600"
                                      : isDisabled
                                      ? theme === "dark"
                                        ? "border-gray-600 bg-gray-700"
                                        : "border-gray-400 bg-gray-200"
                                      : theme === "dark"
                                      ? "border-gray-600 bg-gray-800"
                                      : "border-gray-300 bg-white"
                                  )}
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
                                        <div className={cn(
                                          "font-medium text-sm",
                                          theme === "dark" ? "text-white" : "text-gray-900"
                                        )}>
                                          {extract.animeTitle}
                                          {extract.episode && (
                                            <span className={cn(
                                              "ml-1",
                                              theme === "dark" ? "text-gray-500" : "text-gray-500"
                                            )}>
                                              - Ep. {extract.episode}
                                            </span>
                                          )}
                                        </div>
                                        {isUsed && (
                                          <span className={cn(
                                            "px-2 py-0.5 rounded text-xs font-medium",
                                            theme === "dark"
                                              ? "bg-orange-500/20 text-orange-400"
                                              : "bg-orange-100 text-orange-700"
                                          )}>
                                            Déjà utilisé
                                          </span>
                                        )}
                                      </div>
                                      <p className={cn(
                                        "text-sm italic mt-1 line-clamp-2",
                                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                                      )}>
                                        "{extract.text}"
                                      </p>
                                      {extract.characters.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {extract.characters.slice(0, 3).map(char => (
                                            <span
                                              key={char.malId}
                                              className={cn(
                                                "text-xs px-2 py-0.5 rounded-full",
                                                theme === "dark"
                                                  ? "bg-gray-700 text-gray-300"
                                                  : "bg-gray-100 text-gray-700"
                                              )}
                                            >
                                              {char.name}
                                            </span>
                                          ))}
                                          {extract.characters.length > 3 && (
                                            <span className={cn(
                                              "text-xs px-2 py-0.5 rounded-full",
                                              theme === "dark"
                                                ? "bg-gray-700 text-gray-300"
                                                : "bg-gray-100 text-gray-700"
                                            )}>
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
                      <div className={cn(
                        "px-4 pb-4 text-center py-6 text-sm",
                        theme === "dark" ? "text-gray-500" : "text-gray-500"
                      )}>
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
        <div className={cn(
          "sticky bottom-0 border-t px-6 py-4",
          theme === "dark"
            ? "bg-[#12121a] border-gray-700"
            : "bg-gray-50 border-gray-200"
        )}>
          <div className="flex items-center justify-between mb-3">
            <div className={cn(
              "text-sm",
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}>
              <span className="font-semibold text-purple-500">{selectedExtractCount}</span> / {totalExtractCount} extraits sélectionnés
            </div>
            <div className={cn(
              "text-sm",
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}>
              <span className="font-semibold text-purple-500">{selectedThemeIds.size}</span> / {themeGroup.themes.length} thèmes sélectionnés
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={handleClose}
              className={cn(
                "flex-1 px-4 py-3 border-2 rounded-xl font-medium transition-all",
                theme === "dark"
                  ? "border-gray-600 text-gray-300 hover:bg-white/10"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              )}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleContinueToBuilder}
              disabled={selectedExtractIds.size === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-400 hover:to-cyan-400 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
