import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_THEMES } from '../../lib/graphql/queries';
import { CREATE_THEME } from '../../lib/graphql/mutations';
import { Add, CloseCircle, TickCircle } from 'iconsax-react';
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
}

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E', '#64748B', '#475569', '#1E293B',
];

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ selectedThemeId, onThemeChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTheme, setNewTheme] = useState({ name: '', description: '', color: '#6366F1' });
  const toast = useToast();

  const { data, refetch } = useQuery(GET_THEMES);

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

  return (
    <>
      <div className="space-y-4">
        {/* Theme List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Existing Themes */}
          {themes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => onThemeChange(theme.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedThemeId === theme.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: theme.color }}
                />
                <div className="font-medium text-gray-900 truncate">{theme.name}</div>
              </div>
              {theme.description && (
                <div className="text-xs text-gray-500 mt-1 line-clamp-2">{theme.description}</div>
              )}
            </button>
          ))}
        </div>

        {/* Create New Theme Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
        >
          <Add size={20} color="#6B7280" />
          <span>Create New Theme</span>
        </button>
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
