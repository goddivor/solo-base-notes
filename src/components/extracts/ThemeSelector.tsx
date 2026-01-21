import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { GET_THEMES, SUGGEST_THEME_FROM_TEXT } from '../../lib/graphql/queries';
import { CREATE_THEME } from '../../lib/graphql/mutations';
import { Add, CloseCircle, TickCircle, ArrowDown2, SearchNormal1, MagicStar } from 'iconsax-react';
import { Input } from '../forms/Input';
import { Textarea } from '../forms/Textarea';
import Portal from '../Portal';
import { useToast } from '../../context/toast-context';
import { useTheme } from '../../context/theme-context';
import { cn } from '../../lib/utils';

interface Theme {
  id: string;
  name: string;
  description?: string;
  color: string;
}

interface ThemeSelectorProps {
  selectedThemeId?: string;
  onThemeChange: (themeId?: string) => void;
  extractText?: string;
}

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E', '#64748B', '#475569', '#1E293B',
];

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ selectedThemeId, onThemeChange, extractText }) => {
  const { theme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTheme, setNewTheme] = useState({ name: '', description: '', color: '#6366F1' });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const { data, refetch } = useQuery(GET_THEMES);

  const [getSuggestion, { loading: loadingSuggestion }] = useLazyQuery(SUGGEST_THEME_FROM_TEXT, {
    onCompleted: (data) => {
      if (data.suggestThemeFromText) {
        setNewTheme({
          name: data.suggestThemeFromText.name,
          description: data.suggestThemeFromText.description,
          color: '#6366F1',
        });
        toast.success('Suggestion générée', 'Le thème a été suggéré par l\'IA');
      }
    },
    onError: (error) => {
      console.error('Error getting theme suggestion:', error);
      toast.error('Échec de la suggestion', error.message || 'Impossible d\'obtenir une suggestion');
    },
  });

  const [createTheme, { loading: creating }] = useMutation(CREATE_THEME, {
    onCompleted: (data) => {
      refetch();
      onThemeChange(data.createTheme.id);
      setNewTheme({ name: '', description: '', color: '#6366F1' });
      setIsModalOpen(false);
      toast.success('Theme created', 'The theme has been created successfully');
    },
    onError: (error) => {
      console.error('Error creating theme:', error);
      toast.error('Failed to create theme', error.message || 'Please try again');
    },
  });

  const handleCreateTheme = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newTheme.name) return;

    createTheme({
      variables: {
        input: newTheme,
      },
    });
  };

  const themes: Theme[] = data?.themes || [];
  const selectedTheme = themes.find(t => t.id === selectedThemeId);

  // Filter themes by search query
  const filteredThemes = themes.filter(theme =>
    theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    theme.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchQuery('');
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleSelectTheme = (themeId: string) => {
    onThemeChange(themeId);
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  const handleOpenCreateModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
    setIsDropdownOpen(false);
  };

  const handleGetSuggestion = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!extractText || extractText.trim().length === 0) {
      toast.error('Texte requis', 'Veuillez d\'abord remplir le texte de l\'extrait');
      return;
    }
    getSuggestion({ variables: { text: extractText } });
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Dropdown Trigger */}
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={cn(
            "w-full px-4 py-3 border-2 rounded-xl text-left flex items-center justify-between transition-all",
            "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
            theme === "dark"
              ? "bg-[#0a0a0f] border-gray-700 hover:border-gray-600"
              : "bg-white border-gray-300 hover:border-gray-400"
          )}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {selectedTheme ? (
              <>
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: selectedTheme.color }}
                />
                <span className={cn(
                  "font-medium truncate",
                  theme === "dark" ? "text-white" : "text-gray-900"
                )}>{selectedTheme.name}</span>
              </>
            ) : (
              <span className={theme === "dark" ? "text-gray-500" : "text-gray-500"}>Sélectionner un thème...</span>
            )}
          </div>
          <ArrowDown2
            size={20}
            color={theme === "dark" ? "#6B7280" : "#9CA3AF"}
            className={`flex-shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className={cn(
            "absolute z-50 w-full mt-2 border-2 rounded-xl shadow-xl max-h-80 overflow-hidden flex flex-col",
            theme === "dark"
              ? "bg-[#12121a] border-gray-700"
              : "bg-white border-gray-200"
          )}>
            {/* Search Input */}
            <div className={cn(
              "p-3 border-b",
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            )}>
              <div className="relative">
                <SearchNormal1
                  size={18}
                  color={theme === "dark" ? "#6B7280" : "#9CA3AF"}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                />
                <input
                  type="text"
                  placeholder="Rechercher un thème..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-4 py-2 border-2 rounded-lg text-sm transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                    theme === "dark"
                      ? "bg-[#0a0a0f] border-gray-700 text-white placeholder-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  )}
                  autoFocus
                />
              </div>
            </div>

            {/* Theme List */}
            <div className="overflow-y-auto flex-1">
              {filteredThemes.length > 0 ? (
                filteredThemes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTheme(t.id)}
                    className={cn(
                      "w-full px-4 py-3 text-left flex items-center gap-3 transition-colors",
                      selectedThemeId === t.id
                        ? theme === "dark"
                          ? "bg-purple-500/20 text-purple-300"
                          : "bg-purple-50 text-purple-900"
                        : theme === "dark"
                          ? "hover:bg-gray-800 text-white"
                          : "hover:bg-gray-50 text-gray-900"
                    )}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: t.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{t.name}</div>
                      {t.description && (
                        <div className={cn(
                          "text-xs truncate",
                          theme === "dark" ? "text-gray-500" : "text-gray-500"
                        )}>{t.description}</div>
                      )}
                    </div>
                    {selectedThemeId === t.id && (
                      <TickCircle size={20} variant="Bulk" color="#A855F7" />
                    )}
                  </button>
                ))
              ) : (
                <div className={cn(
                  "px-4 py-8 text-center text-sm",
                  theme === "dark" ? "text-gray-500" : "text-gray-500"
                )}>
                  Aucun thème trouvé
                </div>
              )}
            </div>

            {/* Create New Theme Button */}
            <div className={cn(
              "p-3 border-t",
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            )}>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors",
                  theme === "dark"
                    ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                    : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                )}
              >
                <Add size={20} color={theme === "dark" ? "#C084FC" : "#9333EA"} />
                <span>Créer un nouveau thème</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Portal>
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsModalOpen(false);
              }
            }}
          >
            <div
              className={cn(
                "rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto",
                theme === "dark" ? "bg-[#12121a]" : "bg-white"
              )}
              onClick={(e) => e.stopPropagation()}
            >
            <div className={cn(
              "sticky top-0 border-b px-6 py-4 flex items-center justify-between",
              theme === "dark"
                ? "bg-[#12121a] border-gray-700"
                : "bg-white border-gray-200"
            )}>
              <h2 className={cn(
                "text-xl font-bold",
                theme === "dark" ? "text-white" : "text-gray-900"
              )}>Créer un nouveau thème</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={cn(
                  "transition-colors",
                  theme === "dark" ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <CloseCircle size={24} variant="Bulk" color={theme === "dark" ? "#6B7280" : "#9CA3AF"} />
              </button>
            </div>

            <form onSubmit={handleCreateTheme} className="p-6 space-y-6">
              {/* AI Suggestion Button */}
              {extractText && (
                <div className={cn(
                  "border-2 rounded-xl p-4",
                  theme === "dark"
                    ? "bg-purple-500/10 border-purple-500/30"
                    : "bg-purple-50 border-purple-200"
                )}>
                  <div className="flex items-start gap-3">
                    <MagicStar size={24} variant="Bulk" color="#A855F7" className="flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "font-semibold mb-1",
                        theme === "dark" ? "text-purple-300" : "text-purple-900"
                      )}>Suggestion IA</h3>
                      <p className={cn(
                        "text-sm mb-3",
                        theme === "dark" ? "text-purple-400" : "text-purple-700"
                      )}>
                        Laissez l'IA suggérer un thème basé sur votre extrait
                      </p>
                      <button
                        type="button"
                        onClick={handleGetSuggestion}
                        disabled={loadingSuggestion}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-400 hover:to-cyan-400 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingSuggestion ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Génération...</span>
                          </>
                        ) : (
                          <>
                            <MagicStar size={20} variant="Bulk" color="#FFFFFF" />
                            <span>Suggérer un thème</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Name */}
              <div>
                <Input
                  label="Theme Name *"
                  type="text"
                  placeholder="e.g., Courage, Love, Friendship"
                  value={newTheme.name}
                  onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Textarea
                  label="Description (Optional)"
                  placeholder="Optional description..."
                  value={newTheme.description}
                  onChange={(e) => setNewTheme({ ...newTheme, description: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-3",
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                )}>
                  Couleur du thème *
                </label>
                <div className="grid grid-cols-10 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewTheme({ ...newTheme, color })}
                      className={cn(
                        "w-8 h-8 rounded-full transition-all hover:scale-110",
                        newTheme.color === color && (
                          theme === "dark"
                            ? "ring-2 ring-offset-2 ring-offset-[#12121a] ring-white"
                            : "ring-2 ring-offset-2 ring-gray-900"
                        )
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="color"
                    value={newTheme.color}
                    onChange={(e) => setNewTheme({ ...newTheme, color: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={newTheme.color}
                    onChange={(e) => setNewTheme({ ...newTheme, color: e.target.value })}
                    placeholder="#6366F1"
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2",
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                )}>
                  Aperçu
                </label>
                <div
                  className="h-20 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: newTheme.color }}
                >
                  <span className="text-lg font-bold text-white">
                    {newTheme.name || 'Nom du thème'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={cn(
                    "flex-1 px-4 py-3 border-2 rounded-xl font-medium transition-all",
                    theme === "dark"
                      ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  )}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-400 hover:to-cyan-400 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {creating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Création...
                    </>
                  ) : (
                    <>
                      <TickCircle size={20} variant="Bulk" color="#FFFFFF" />
                      Créer le thème
                    </>
                  )}
                </button>
              </div>
            </form>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
};

export default ThemeSelector;
