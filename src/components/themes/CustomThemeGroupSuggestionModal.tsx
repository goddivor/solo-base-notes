import React, { useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { SUGGEST_CUSTOM_THEME_GROUPS, GET_THEME_GROUPS } from '../../lib/graphql/queries';
import { CREATE_THEME_GROUP } from '../../lib/graphql/mutations';
import { CloseCircle, MagicStar, TickCircle } from 'iconsax-react';
import { useToast } from '../../context/toast-context';

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
  const toast = useToast();
  const [userInput, setUserInput] = useState('');
  const [suggestions, setSuggestions] = useState<ThemeGroupSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <MagicStar size={22} variant="Bulk" color="#FFFFFF" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Suggestion Personnalisée</h2>
              <p className="text-sm text-gray-600">Guidez l'IA avec votre concept</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <CloseCircle size={28} variant="Bulk" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Input Section */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Votre idée ou concept
            </label>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ex: amitié et loyauté, vérité et justice, courage face à l'adversité..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500">
              Décrivez le thème ou concept autour duquel vous voulez créer des groupes. L'IA cherchera parmi vos thèmes existants ceux qui correspondent à votre vision.
            </p>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateSuggestions}
            disabled={loadingSuggestions || !userInput.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
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
                <h3 className="text-lg font-semibold text-gray-900">
                  Suggestions ({suggestions.length})
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedSuggestions.size} sélectionné(s)
                </p>
              </div>

              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleToggleSuggestion(index)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedSuggestions.has(index)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: suggestion.color }}
                          />
                          <h4 className="text-lg font-bold text-gray-900">
                            {suggestion.name}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {suggestion.themeIds.length} thème(s)
                          </span>
                        </div>
                      </div>
                      {selectedSuggestions.has(index) && (
                        <TickCircle size={24} variant="Bold" color="#9333EA" />
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
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center">
            <button
              onClick={handleClose}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleCreateSelected}
              disabled={selectedSuggestions.size === 0 || creatingGroup}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
