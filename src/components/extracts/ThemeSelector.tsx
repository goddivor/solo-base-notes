import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_THEMES } from '../../lib/graphql/queries';
import { CREATE_THEME } from '../../lib/graphql/mutations';
import { Add } from 'iconsax-react';

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

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ selectedThemeId, onThemeChange }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTheme, setNewTheme] = useState({ name: '', description: '', color: '#3B82F6' });

  const { data, loading, refetch } = useQuery(GET_THEMES);

  const [createTheme, { loading: creating }] = useMutation(CREATE_THEME, {
    onCompleted: (data) => {
      refetch();
      onThemeChange(data.createTheme.id);
      setNewTheme({ name: '', description: '', color: '#3B82F6' });
      setShowCreateForm(false);
    },
  });

  const handleCreateTheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTheme.name) return;

    createTheme({
      variables: {
        input: newTheme,
      },
    });
  };

  const themes: Theme[] = data?.themes || [];

  return (
    <div className="space-y-4">
      {/* Theme List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* No Theme Option */}
        <button
          type="button"
          onClick={() => onThemeChange(undefined)}
          className={`p-4 rounded-lg border-2 transition-all text-left ${
            !selectedThemeId
              ? 'border-gray-600 bg-gray-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="font-medium text-gray-900">No Theme</div>
          <div className="text-xs text-gray-500 mt-1">No theme assigned</div>
        </button>

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
      {!showCreateForm && (
        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
        >
          <Add size={20} color="#6B7280" />
          <span>Create New Theme</span>
        </button>
      )}

      {/* Create Theme Form */}
      {showCreateForm && (
        <form onSubmit={handleCreateTheme} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Theme Name *</label>
            <input
              type="text"
              value={newTheme.name}
              onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
              placeholder="e.g., Courage, Love, Friendship"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newTheme.description}
              onChange={(e) => setNewTheme({ ...newTheme, description: e.target.value })}
              placeholder="Optional description..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={newTheme.color}
                onChange={(e) => setNewTheme({ ...newTheme, color: e.target.value })}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={newTheme.color}
                onChange={(e) => setNewTheme({ ...newTheme, color: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Theme'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ThemeSelector;
