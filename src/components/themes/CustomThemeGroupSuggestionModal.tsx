import React, { useState, useEffect, useRef } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { SUGGEST_CUSTOM_THEME_GROUPS, GET_THEME_GROUPS } from '../../lib/graphql/queries';
import { CREATE_THEME_GROUP } from '../../lib/graphql/mutations';
import { CloseCircle, MagicStar, TickCircle } from 'iconsax-react';
import { useToast } from '../../context/toast-context';
import { useTheme } from '../../context/theme-context';
import { cn } from '../../lib/utils';

interface ThemeGroupSuggestion {
  name: string;
  description: string;
  themeIds: string[];
  color: string;
}

interface CustomThemeGroupSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CustomThemeGroupSuggestionModal: React.FC<CustomThemeGroupSuggestionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { theme } = useTheme();
  const toast = useToast();
  const modalRef = useRef<HTMLDivElement>(null);
  const [userInput, setUserInput] = useState('');
  const [suggestions, setSuggestions] = useState<ThemeGroupSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handle click outside to close modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const [getSuggestions, { loading: loadingSuggestions }] = useLazyQuery(SUGGEST_CUSTOM_THEME_GROUPS, {
    onCompleted: (data) => {
      if (data.suggestCustomThemeGroups && data.suggestCustomThemeGroups.length > 0) {
        setSuggestions(data.suggestCustomThemeGroups);
        toast.success('Suggestions générées', `${data.suggestCustomThemeGroups.length} groupe(s) suggéré(s)`);
      } else {
        toast.warning('Aucune suggestion', 'Aucun groupe de thèmes correspondant à votre idée');
      }
    },
    onError: (error) => {
      console.error('Error getting suggestions:', error);
      toast.error('Erreur', error.message || 'Impossible de générer les suggestions');
    },
  });

  const [createThemeGroup, { loading: creatingGroup }] = useMutation(CREATE_THEME_GROUP, {
    refetchQueries: [{ query: GET_THEME_GROUPS }],
    onCompleted: () => {
      toast.success('Groupe créé', 'Le groupe de thèmes a été créé avec succès');
    },
    onError: (error) => {
      console.error('Error creating theme group:', error);
      toast.error('Erreur', 'Impossible de créer le groupe de thèmes');
    },
  });

  const handleGenerateSuggestions = () => {
    if (!userInput.trim()) {
      toast.error('Champ requis', 'Veuillez entrer votre idée ou concept');
      return;
    }

    getSuggestions({
      variables: { userInput: userInput.trim() },
    });
  };

  const handleToggleSuggestion = (index: number) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSuggestions(newSelected);
  };

  const handleCreateSelected = async () => {
    if (selectedSuggestions.size === 0) {
      toast.error('Aucune sélection', 'Veuillez sélectionner au moins un groupe');
      return;
    }

    try {
      for (const index of selectedSuggestions) {
        const suggestion = suggestions[index];
        await createThemeGroup({
          variables: {
            input: {
              name: suggestion.name,
              description: suggestion.description,
              color: suggestion.color,
              themeIds: suggestion.themeIds,
            },
          },
        });
      }

      toast.success(
        'Groupes créés',
        `${selectedSuggestions.size} groupe(s) créé(s) avec succès`
      );

      // Reset and close
      setUserInput('');
      setSuggestions([]);
      setSelectedSuggestions(new Set());
      onClose();
    } catch (error) {
      console.error('Error creating selected groups:', error);
    }
  };

  const handleClose = () => {
    setUserInput('');
    setSuggestions([]);
    setSelectedSuggestions(new Set());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={cn(
          "rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto",
          theme === "dark" ? "bg-[#12121a]" : "bg-white"
        )}
      >
        {/* Header */}
        <div className={cn(
          "sticky top-0 border-b px-6 py-4 flex items-center justify-between",
          theme === "dark"
            ? "bg-[#12121a] border-gray-700"
            : "bg-white border-gray-200"
        )}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <MagicStar size={22} variant="Bulk" color="#FFFFFF" />
            </div>
            <div>
              <h2 className={cn(
                "text-xl font-bold",
                theme === "dark" ? "text-white" : "text-gray-900"
              )}>Suggestion Personnalisée</h2>
              <p className={cn(
                "text-sm",
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              )}>Guidez l'IA avec votre concept</p>
            </div>
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
        <div className="p-6 space-y-6">
          {/* Input Section */}
          <div className="space-y-3">
            <label className={cn(
              "block text-sm font-semibold",
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            )}>
              Votre idée ou concept
            </label>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ex: amitié et loyauté, vérité et justice, courage face à l'adversité..."
              rows={4}
              className={cn(
                "w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none",
                theme === "dark"
                  ? "bg-[#0a0a0f] border-gray-700 text-white placeholder-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              )}
            />
            <p className={cn(
              "text-xs",
              theme === "dark" ? "text-gray-500" : "text-gray-500"
            )}>
              Décrivez le thème ou concept autour duquel vous voulez créer des groupes. L'IA cherchera parmi vos thèmes existants ceux qui correspondent à votre vision.
            </p>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateSuggestions}
            disabled={loadingSuggestions || !userInput.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-400 hover:to-cyan-400 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loadingSuggestions ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Génération en cours...</span>
              </>
            ) : (
              <>
                <MagicStar size={20} variant="Bulk" color="#FFFFFF" />
                <span>Générer des Suggestions</span>
              </>
            )}
          </button>

          {/* Suggestions List */}
          {suggestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={cn(
                  "text-lg font-semibold",
                  theme === "dark" ? "text-white" : "text-gray-900"
                )}>
                  Suggestions ({suggestions.length})
                </h3>
                <p className={cn(
                  "text-sm",
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                )}>
                  {selectedSuggestions.size} sélectionné(s)
                </p>
              </div>

              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleToggleSuggestion(index)}
                    className={cn(
                      "w-full p-4 rounded-lg border-2 transition-all text-left",
                      selectedSuggestions.has(index)
                        ? theme === "dark"
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-purple-500 bg-purple-50"
                        : theme === "dark"
                          ? "border-gray-700 bg-[#1a1a25] hover:border-gray-600"
                          : "border-gray-200 bg-white hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: suggestion.color }}
                          />
                          <h4 className={cn(
                            "text-lg font-bold",
                            theme === "dark" ? "text-white" : "text-gray-900"
                          )}>
                            {suggestion.name}
                          </h4>
                        </div>
                        <p className={cn(
                          "text-sm mb-2",
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        )}>
                          {suggestion.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-xs",
                            theme === "dark" ? "text-gray-500" : "text-gray-500"
                          )}>
                            {suggestion.themeIds.length} thème(s)
                          </span>
                        </div>
                      </div>
                      {selectedSuggestions.has(index) && (
                        <TickCircle size={24} variant="Bold" color="#A855F7" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {suggestions.length > 0 && (
          <div className={cn(
            "sticky bottom-0 border-t px-6 py-4 flex justify-between items-center",
            theme === "dark"
              ? "bg-[#0a0a0f] border-gray-700"
              : "bg-gray-50 border-gray-200"
          )}>
            <button
              onClick={handleClose}
              className={cn(
                "px-6 py-2 border-2 rounded-lg font-medium transition-all",
                theme === "dark"
                  ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              )}
            >
              Annuler
            </button>
            <button
              onClick={handleCreateSelected}
              disabled={selectedSuggestions.size === 0 || creatingGroup}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-400 hover:to-cyan-400 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creatingGroup ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Création...</span>
                </>
              ) : (
                <>
                  <TickCircle size={20} variant="Bulk" color="#FFFFFF" />
                  <span>Créer les groupes sélectionnés</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomThemeGroupSuggestionModal;
