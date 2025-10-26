import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { GET_THEMES, SUGGEST_THEME_FROM_TEXT } from '../../lib/graphql/queries';
import { CREATE_THEME } from '../../lib/graphql/mutations';
import { Add, CloseCircle, TickCircle, ArrowDown2, SearchNormal1, MagicStar } from 'iconsax-react';
import { Input } from '../forms/Input';
import { Textarea } from '../forms/Textarea';
import Portal from '../Portal';
import { useToast } from '../../context/toast-context';

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
          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {selectedTheme ? (
              <>
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: selectedTheme.color }}
                />
                <span className="font-medium text-gray-900 truncate">{selectedTheme.name}</span>
              </>
            ) : (
              <span className="text-gray-500">Select a theme...</span>
            )}
          </div>
          <ArrowDown2
            size={20}
            color="#6B7280"
            className={`flex-shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-xl max-h-80 overflow-hidden flex flex-col">
            {/* Search Input */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <SearchNormal1
                  size={18}
                  color="#9CA3AF"
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                />
                <input
                  type="text"
                  placeholder="Search themes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  autoFocus
                />
              </div>
            </div>

            {/* Theme List */}
            <div className="overflow-y-auto flex-1">
              {filteredThemes.length > 0 ? (
                filteredThemes.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleSelectTheme(theme.id)}
                    className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                      selectedThemeId === theme.id
                        ? 'bg-indigo-50 text-indigo-900'
                        : 'hover:bg-gray-50 text-gray-900'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: theme.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{theme.name}</div>
                      {theme.description && (
                        <div className="text-xs text-gray-500 truncate">{theme.description}</div>
                      )}
                    </div>
                    {selectedThemeId === theme.id && (
                      <TickCircle size={20} variant="Bulk" color="#4F46E5" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  No themes found
                </div>
              )}
            </div>

            {/* Create New Theme Button */}
            <div className="p-3 border-t border-gray-200">
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg font-medium transition-colors"
              >
                <Add size={20} color="#4F46E5" />
                <span>Create New Theme</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Portal>
          <div
            className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-[9999] p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsModalOpen(false);
              }
            }}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Create New Theme</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <CloseCircle size={24} variant="Bulk" color="#9CA3AF" />
              </button>
            </div>

            <form onSubmit={handleCreateTheme} className="p-6 space-y-6">
              {/* AI Suggestion Button */}
              {extractText && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <MagicStar size={24} variant="Bulk" color="#9333EA" className="flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-purple-900 mb-1">Suggestion IA</h3>
                      <p className="text-sm text-purple-700 mb-3">
                        Laissez l'IA suggérer un thème basé sur votre extrait
                      </p>
                      <button
                        type="button"
                        onClick={handleGetSuggestion}
                        disabled={loadingSuggestion}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Theme Color *
                </label>
                <div className="grid grid-cols-10 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewTheme({ ...newTheme, color })}
                      className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${
                        newTheme.color === color
                          ? 'ring-2 ring-offset-2 ring-gray-900'
                          : ''
                      }`}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div
                  className="h-20 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: newTheme.color }}
                >
                  <span className="text-lg font-bold text-white">
                    {newTheme.name || 'Theme Name'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {creating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <TickCircle size={20} variant="Bulk" color="#FFFFFF" />
                      Create Theme
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
