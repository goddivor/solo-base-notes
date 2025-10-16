import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_THEMES } from '../../../lib/graphql/queries';
import { CREATE_THEME, UPDATE_THEME, DELETE_THEME } from '../../../lib/graphql/mutations';
import { Add, Edit2, Trash, TickCircle, CloseCircle } from 'iconsax-react';
import Button from '../../../components/actions/button';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';

interface Theme {
  id: string;
  name: string;
  description?: string;
  color: string;
}

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E', '#64748B', '#475569', '#1E293B',
];

const ThemesPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366F1',
  });

  const { data, loading, refetch } = useQuery(GET_THEMES);

  const [createTheme, { loading: creating }] = useMutation(CREATE_THEME, {
    onCompleted: () => {
      refetch();
      closeModal();
    },
    onError: (error) => {
      console.error('Error creating theme:', error);
      alert('Failed to create theme. Please try again.');
    },
  });

  const [updateTheme, { loading: updating }] = useMutation(UPDATE_THEME, {
    onCompleted: () => {
      refetch();
      closeModal();
    },
    onError: (error) => {
      console.error('Error updating theme:', error);
      alert('Failed to update theme. Please try again.');
    },
  });

  const [deleteTheme] = useMutation(DELETE_THEME, {
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      console.error('Error deleting theme:', error);
      alert('Failed to delete theme. Please try again.');
    },
  });

  const openModal = (theme?: Theme) => {
    if (theme) {
      setEditingTheme(theme);
      setFormData({
        name: theme.name,
        description: theme.description || '',
        color: theme.color,
      });
    } else {
      setEditingTheme(null);
      setFormData({
        name: '',
        description: '',
        color: '#6366F1',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTheme(null);
    setFormData({
      name: '',
      description: '',
      color: '#6366F1',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Please enter a theme name');
      return;
    }

    const input = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      color: formData.color,
    };

    if (editingTheme) {
      updateTheme({ variables: { id: editingTheme.id, input } });
    } else {
      createTheme({ variables: { input } });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the theme "${name}"?`)) {
      deleteTheme({ variables: { id } });
    }
  };

  const themes = data?.themes || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Themes</h1>
            <p className="text-gray-600">Organize your extracts by themes</p>
          </div>
          <Button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
          >
            <Add size={20} variant="Bulk" />
            New Theme
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && themes.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Add size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No themes yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first theme to start organizing your anime extracts
              </p>
              <Button
                onClick={() => openModal()}
                className="px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium transition-all"
              >
                Create Theme
              </Button>
            </div>
          </div>
        )}

        {/* Themes Grid */}
        {!loading && themes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {themes.map((theme: Theme) => (
              <div
                key={theme.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div
                  className="h-24 flex items-center justify-center"
                  style={{ backgroundColor: theme.color }}
                >
                  <h3 className="text-xl font-bold text-white text-center px-4">
                    {theme.name}
                  </h3>
                </div>
                <div className="p-4">
                  {theme.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {theme.description}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(theme)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} variant="Bulk" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(theme.id, theme.name)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash size={16} variant="Bulk" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTheme ? 'Edit Theme' : 'Create New Theme'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <CloseCircle size={24} variant="Bulk" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Name */}
              <div>
                <Input
                  label="Theme Name *"
                  type="text"
                  placeholder="Enter theme name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Textarea
                  label="Description (Optional)"
                  placeholder="Enter theme description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${
                        formData.color === color
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
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
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
                  style={{ backgroundColor: formData.color }}
                >
                  <span className="text-lg font-bold text-white">
                    {formData.name || 'Theme Name'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-all"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating || updating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {creating || updating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {editingTheme ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <TickCircle size={20} variant="Bulk" />
                      {editingTheme ? 'Update Theme' : 'Create Theme'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemesPage;
