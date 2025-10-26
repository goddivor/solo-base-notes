import React, { useState } from 'react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { GET_THEMES, GET_THEME_GROUPS, SUGGEST_THEME_GROUPS } from '../../../lib/graphql/queries';
import {
  CREATE_THEME,
  UPDATE_THEME,
  DELETE_THEME,
  CREATE_THEME_GROUP,
  UPDATE_THEME_GROUP,
  DELETE_THEME_GROUP,
} from '../../../lib/graphql/mutations';
import { Add, Edit2, Trash, TickCircle, CloseCircle, Graph, MagicStar, SearchNormal1 } from 'iconsax-react';
import Button from '../../../components/actions/button';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import ActionConfirmationModal from '../../../components/modals/ActionConfirmationModal';
import ThemeGroupGraphModal from '../../../components/themes/ThemeGroupGraphModal';
import { useToast } from '../../../context/toast-context';

interface Theme {
  id: string;
  name: string;
  description?: string;
  color: string;
  extractCount: number;
}

interface ThemeGroup {
  id: string;
  name: string;
  description?: string;
  color: string;
  themes: Theme[];
  extractCount: number;
}

interface ThemeGroupSuggestion {
  name: string;
  description?: string;
  themeIds: string[];
  color: string;
}

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E', '#64748B', '#475569', '#1E293B',
];

type TabType = 'mini-themes' | 'theme-groups';

const ThemesPage: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('mini-themes');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [editingThemeGroup, setEditingThemeGroup] = useState<ThemeGroup | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366F1',
  });
  const [selectedThemeIds, setSelectedThemeIds] = useState<string[]>([]);
  const [themeSearchQuery, setThemeSearchQuery] = useState('');
  const [miniThemeSearchQuery, setMiniThemeSearchQuery] = useState('');
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; type: 'theme' | 'group' } | null>(null);
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [selectedGroupForGraph, setSelectedGroupForGraph] = useState<ThemeGroup | null>(null);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<number[]>([]);

  const { data: themesData, loading: themesLoading, refetch: refetchThemes } = useQuery(GET_THEMES);
  const { data: themeGroupsData, loading: themeGroupsLoading, refetch: refetchThemeGroups } = useQuery(GET_THEME_GROUPS);

  const [getSuggestions, { data: suggestionsData, loading: loadingSuggestions }] = useLazyQuery(SUGGEST_THEME_GROUPS, {
    onCompleted: () => {
      setShowSuggestionsModal(true);
      setSelectedSuggestions([]);
    },
    onError: (error) => {
      console.error('Error getting suggestions:', error);
      toast.error('Échec des suggestions', error.message || 'Impossible d\'obtenir des suggestions');
    },
  });

  const [createTheme, { loading: creating }] = useMutation(CREATE_THEME, {
    onCompleted: () => {
      refetchThemes();
      closeModal();
      toast.success('Mini-thème créé', 'Le mini-thème a été créé avec succès');
    },
    onError: (error) => {
      console.error('Error creating theme:', error);
      toast.error('Échec de la création', error.message || 'Veuillez réessayer');
    },
  });

  const [updateTheme, { loading: updating }] = useMutation(UPDATE_THEME, {
    onCompleted: () => {
      refetchThemes();
      closeModal();
      toast.success('Mini-thème mis à jour', 'Le mini-thème a été mis à jour avec succès');
    },
    onError: (error) => {
      console.error('Error updating theme:', error);
      toast.error('Échec de la mise à jour', error.message || 'Veuillez réessayer');
    },
  });

  const [deleteTheme, { loading: deleting }] = useMutation(DELETE_THEME, {
    onCompleted: () => {
      refetchThemes();
      refetchThemeGroups(); // Refresh groups in case deleted theme was in a group
      setShowDeleteModal(false);
      setItemToDelete(null);
      toast.success('Mini-thème supprimé', 'Le mini-thème a été supprimé avec succès');
    },
    onError: (error) => {
      console.error('Error deleting theme:', error);
      toast.error('Échec de la suppression', error.message || 'Veuillez réessayer');
    },
  });

  const [createThemeGroup, { loading: creatingGroup }] = useMutation(CREATE_THEME_GROUP, {
    onCompleted: () => {
      refetchThemeGroups();
      closeModal();
      toast.success('Groupe de thème créé', 'Le groupe de thème a été créé avec succès');
    },
    onError: (error) => {
      console.error('Error creating theme group:', error);
      toast.error('Échec de la création', error.message || 'Veuillez réessayer');
    },
  });

  const [updateThemeGroup, { loading: updatingGroup }] = useMutation(UPDATE_THEME_GROUP, {
    onCompleted: () => {
      refetchThemeGroups();
      closeModal();
      toast.success('Groupe de thème mis à jour', 'Le groupe de thème a été mis à jour avec succès');
    },
    onError: (error) => {
      console.error('Error updating theme group:', error);
      toast.error('Échec de la mise à jour', error.message || 'Veuillez réessayer');
    },
  });

  const [deleteThemeGroup, { loading: deletingGroup }] = useMutation(DELETE_THEME_GROUP, {
    onCompleted: () => {
      refetchThemeGroups();
      setShowDeleteModal(false);
      setItemToDelete(null);
      toast.success('Groupe de thème supprimé', 'Le groupe de thème a été supprimé avec succès');
    },
    onError: (error) => {
      console.error('Error deleting theme group:', error);
      toast.error('Échec de la suppression', error.message || 'Veuillez réessayer');
    },
  });

  const openThemeModal = (theme?: Theme) => {
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
    setEditingThemeGroup(null);
    setSelectedThemeIds([]);
    setIsModalOpen(true);
  };

  const openThemeGroupModal = (themeGroup?: ThemeGroup) => {
    if (themeGroup) {
      setEditingThemeGroup(themeGroup);
      setFormData({
        name: themeGroup.name,
        description: themeGroup.description || '',
        color: themeGroup.color,
      });
      setSelectedThemeIds(themeGroup.themes.map(t => t.id));
    } else {
      setEditingThemeGroup(null);
      setFormData({
        name: '',
        description: '',
        color: '#6366F1',
      });
      setSelectedThemeIds([]);
    }
    setEditingTheme(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTheme(null);
    setEditingThemeGroup(null);
    setFormData({
      name: '',
      description: '',
      color: '#6366F1',
    });
    setSelectedThemeIds([]);
    setThemeSearchQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Nom requis', 'Veuillez entrer un nom');
      return;
    }

    const input = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      color: formData.color,
    };

    if (editingThemeGroup || (!editingTheme && activeTab === 'theme-groups')) {
      // Theme Group logic
      const groupInput = {
        ...input,
        themeIds: selectedThemeIds,
      };

      if (editingThemeGroup) {
        updateThemeGroup({ variables: { id: editingThemeGroup.id, input: groupInput } });
      } else {
        createThemeGroup({ variables: { input: groupInput } });
      }
    } else {
      // Mini-theme logic
      if (editingTheme) {
        updateTheme({ variables: { id: editingTheme.id, input } });
      } else {
        createTheme({ variables: { input } });
      }
    }
  };

  const handleDeleteClick = (id: string, name: string, type: 'theme' | 'group') => {
    setItemToDelete({ id, name, type });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'group') {
        deleteThemeGroup({ variables: { id: itemToDelete.id } });
      } else {
        deleteTheme({ variables: { id: itemToDelete.id } });
      }
    }
  };

  const toggleThemeSelection = (themeId: string) => {
    setSelectedThemeIds(prev =>
      prev.includes(themeId)
        ? prev.filter(id => id !== themeId)
        : [...prev, themeId]
    );
  };

  const handleOpenGraph = (group: ThemeGroup) => {
    setSelectedGroupForGraph(group);
    setShowGraphModal(true);
  };

  const handleCloseGraph = () => {
    setShowGraphModal(false);
    setSelectedGroupForGraph(null);
  };

  const handleGetSuggestions = () => {
    if (themes.length < 2) {
      toast.error('Pas assez de thèmes', 'Créez au moins 2 mini-thèmes pour obtenir des suggestions');
      return;
    }
    getSuggestions();
  };

  const toggleSuggestionSelection = (index: number) => {
    setSelectedSuggestions(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleCreateSuggestedGroups = async () => {
    if (selectedSuggestions.length === 0) {
      toast.error('Aucune sélection', 'Veuillez sélectionner au moins une suggestion');
      return;
    }

    const suggestions: ThemeGroupSuggestion[] = suggestionsData?.suggestThemeGroups || [];

    try {
      for (const index of selectedSuggestions) {
        const suggestion = suggestions[index];
        if (suggestion) {
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
      }
      setShowSuggestionsModal(false);
      setSelectedSuggestions([]);
      toast.success('Groupes créés', `${selectedSuggestions.length} groupe(s) de thème créé(s) avec succès`);
    } catch (error) {
      console.error('Error creating suggested groups:', error);
    }
  };

  const themes = themesData?.themes || [];
  const themeGroups = themeGroupsData?.themeGroups || [];
  const suggestions: ThemeGroupSuggestion[] = suggestionsData?.suggestThemeGroups || [];
  const loading = themesLoading || themeGroupsLoading;

  // Filter themes and groups based on search queries
  const filteredThemes = themes.filter((theme: Theme) =>
    theme.name.toLowerCase().includes(miniThemeSearchQuery.toLowerCase()) ||
    theme.description?.toLowerCase().includes(miniThemeSearchQuery.toLowerCase())
  );

  const filteredGroups = themeGroups.filter((group: ThemeGroup) =>
    group.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(groupSearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thèmes</h1>
          <p className="text-gray-600">Organisez vos extraits avec des mini-thèmes et des groupes de thèmes</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('mini-themes')}
              className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'mini-themes'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Mini-Thèmes ({themes.length})
            </button>
            <button
              onClick={() => setActiveTab('theme-groups')}
              className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'theme-groups'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Groupes de Thèmes ({themeGroups.length})
            </button>
          </div>
        </div>

        {/* Action Buttons and Search */}
        <div className="mb-6 flex items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative max-w-md w-full">
            <SearchNormal1
              size={20}
              color="#9CA3AF"
              className="absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              type="text"
              placeholder={activeTab === 'mini-themes' ? 'Rechercher un mini-thème...' : 'Rechercher un groupe de thème...'}
              value={activeTab === 'mini-themes' ? miniThemeSearchQuery : groupSearchQuery}
              onChange={(e) => activeTab === 'mini-themes' ? setMiniThemeSearchQuery(e.target.value) : setGroupSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {activeTab === 'theme-groups' && themes.length >= 2 && (
              <Button
                onClick={handleGetSuggestions}
                disabled={loadingSuggestions}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingSuggestions ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Génération...</span>
                  </>
                ) : (
                  <>
                    <MagicStar size={20} variant="Bulk" color="#FFFFFF" />
                    <span>Suggestions IA</span>
                  </>
                )}
              </Button>
            )}
            <Button
              onClick={() => activeTab === 'mini-themes' ? openThemeModal() : openThemeGroupModal()}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
            >
              <Add size={20} variant="Bulk" color="#FFFFFF" />
              {activeTab === 'mini-themes' ? 'Nouveau Mini-Thème' : 'Nouveau Groupe'}
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Mini-Themes Tab */}
        {!loading && activeTab === 'mini-themes' && (
          <>
            {themes.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="max-w-md mx-auto flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Add size={32} color="#9CA3AF" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun mini-thème</h3>
                  <p className="text-gray-600 mb-6">
                    Créez votre premier mini-thème pour commencer à organiser vos extraits
                  </p>
                  <Button
                    onClick={() => openThemeModal()}
                    className="px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium transition-all"
                  >
                    Créer un Mini-Thème
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {filteredThemes.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="max-w-md mx-auto">
                      <SearchNormal1 size={48} color="#9CA3AF" className="mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun résultat</h3>
                      <p className="text-gray-600">
                        Aucun mini-thème ne correspond à votre recherche
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredThemes.map((theme: Theme) => (
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
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {theme.description}
                        </p>
                      )}
                      <div className="mb-4 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600">Extraits</span>
                          <span className="text-sm font-bold text-gray-900">
                            {theme.extractCount}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openThemeModal(theme)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} variant="Bulk" color="#4F46E5" />
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteClick(theme.id, theme.name, 'theme')}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash size={16} variant="Bulk" color="#DC2626" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Theme Groups Tab */}
        {!loading && activeTab === 'theme-groups' && (
          <>
            {themeGroups.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="max-w-md mx-auto flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Add size={32} color="#9CA3AF" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun groupe de thème</h3>
                  <p className="text-gray-600 mb-6">
                    Créez votre premier groupe de thème pour regrouper plusieurs mini-thèmes
                  </p>
                  <Button
                    onClick={() => openThemeGroupModal()}
                    className="px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium transition-all"
                  >
                    Créer un Groupe
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {filteredGroups.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="max-w-md mx-auto">
                      <SearchNormal1 size={48} color="#9CA3AF" className="mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun résultat</h3>
                      <p className="text-gray-600">
                        Aucun groupe de thème ne correspond à votre recherche
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGroups.map((group: ThemeGroup) => (
                  <div
                    key={group.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div
                      className="h-24 flex items-center justify-center"
                      style={{ backgroundColor: group.color }}
                    >
                      <h3 className="text-xl font-bold text-white text-center px-4">
                        {group.name}
                      </h3>
                    </div>
                    <div className="p-4">
                      {group.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {group.description}
                        </p>
                      )}
                      <div className="mb-3 space-y-2">
                        <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-600">Mini-thèmes</span>
                            <span className="text-sm font-bold text-gray-900">
                              {group.themes.length}
                            </span>
                          </div>
                        </div>
                        <div className="px-3 py-2 bg-indigo-50 rounded-lg border border-indigo-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-indigo-600">Extraits totaux</span>
                            <span className="text-sm font-bold text-indigo-900">
                              {group.extractCount}
                            </span>
                          </div>
                        </div>
                      </div>
                      {group.themes.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-1">
                          {group.themes.slice(0, 3).map((theme) => (
                            <span
                              key={theme.id}
                              className="text-xs px-2 py-1 rounded-full text-white"
                              style={{ backgroundColor: theme.color }}
                            >
                              {theme.name}
                            </span>
                          ))}
                          {group.themes.length > 3 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                              +{group.themes.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="space-y-2">
                        <button
                          onClick={() => handleOpenGraph(group)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                        >
                          <Graph size={16} variant="Bulk" color="#16A34A" />
                          Visualiser
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openThemeGroupModal(group)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} variant="Bulk" color="#4F46E5" />
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteClick(group.id, group.name, 'group')}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash size={16} variant="Bulk" color="#DC2626" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingThemeGroup
                  ? 'Modifier le Groupe de Thème'
                  : editingTheme
                  ? 'Modifier le Mini-Thème'
                  : activeTab === 'theme-groups'
                  ? 'Créer un Groupe de Thème'
                  : 'Créer un Mini-Thème'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <CloseCircle size={24} variant="Bulk" color="#9CA3AF" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Name */}
              <div>
                <Input
                  label="Nom *"
                  type="text"
                  placeholder="Entrez le nom"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Textarea
                  label="Description (Optionnel)"
                  placeholder="Entrez une description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Couleur *
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

              {/* Theme Selection (only for Theme Groups) */}
              {(editingThemeGroup || (!editingTheme && activeTab === 'theme-groups')) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Sélectionner les Mini-Thèmes
                  </label>
                  {themes.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-600">Aucun mini-thème disponible. Créez-en un d'abord.</p>
                    </div>
                  ) : (
                    <>
                      {/* Search bar for themes */}
                      <div className="mb-3">
                        <input
                          type="text"
                          placeholder="Rechercher un mini-thème..."
                          value={themeSearchQuery}
                          onChange={(e) => setThemeSearchQuery(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-2">
                        {themes
                          .filter((theme: Theme) =>
                            theme.name.toLowerCase().includes(themeSearchQuery.toLowerCase())
                          )
                          .map((theme: Theme) => (
                            <button
                              key={theme.id}
                              type="button"
                              onClick={() => toggleThemeSelection(theme.id)}
                              className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                                selectedThemeIds.includes(theme.id)
                                  ? 'border-indigo-600 bg-indigo-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div
                                className="w-8 h-8 rounded-full flex-shrink-0"
                                style={{ backgroundColor: theme.color }}
                              />
                              <div className="flex-1 text-left">
                                <div className="font-medium text-gray-900">{theme.name}</div>
                                <div className="text-xs text-gray-500">{theme.extractCount} extraits</div>
                              </div>
                              {selectedThemeIds.includes(theme.id) && (
                                <TickCircle size={24} variant="Bulk" color="#4F46E5" />
                              )}
                            </button>
                          ))}
                        {themes.filter((theme: Theme) =>
                          theme.name.toLowerCase().includes(themeSearchQuery.toLowerCase())
                        ).length === 0 && (
                          <div className="text-center py-6 text-gray-500 text-sm">
                            Aucun mini-thème trouvé
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  <div className="mt-2 text-sm text-gray-600">
                    {selectedThemeIds.length} mini-thème(s) sélectionné(s)
                  </div>
                </div>
              )}

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aperçu
                </label>
                <div
                  className="h-20 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: formData.color }}
                >
                  <span className="text-lg font-bold text-white">
                    {formData.name || 'Nom du thème'}
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
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={creating || updating || creatingGroup || updatingGroup}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {creating || updating || creatingGroup || updatingGroup ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      En cours...
                    </>
                  ) : (
                    <>
                      <TickCircle size={20} variant="Bulk" color="#FFFFFF" />
                      {editingTheme || editingThemeGroup ? 'Mettre à jour' : 'Créer'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ActionConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={itemToDelete?.type === 'group' ? 'Supprimer le Groupe' : 'Supprimer le Mini-Thème'}
        message={`Êtes-vous sûr de vouloir supprimer "${itemToDelete?.name}" ? Cette action est irréversible.`}
        type="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
        loading={deleting || deletingGroup}
      />

      {/* Graph Visualization Modal */}
      {selectedGroupForGraph && (
        <ThemeGroupGraphModal
          themeGroup={selectedGroupForGraph}
          isOpen={showGraphModal}
          onClose={handleCloseGraph}
        />
      )}

      {/* AI Suggestions Modal */}
      {showSuggestionsModal && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <MagicStar size={24} variant="Bulk" color="#9333EA" />
                  Suggestions de Groupes de Thèmes
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Sélectionnez les groupes que vous souhaitez créer
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSuggestionsModal(false);
                  setSelectedSuggestions([]);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <CloseCircle size={24} variant="Bulk" color="#9CA3AF" />
              </button>
            </div>

            <div className="p-6">
              {suggestions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Aucune suggestion générée pour le moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => {
                    const isSelected = selectedSuggestions.includes(index);
                    const suggestedThemes = suggestion.themeIds
                      .map(id => themes.find((t: { id: string; }) => t.id === id))
                      .filter(Boolean) as Theme[];

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleSuggestionSelection(index)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-200'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-purple-600 border-purple-600'
                                  : 'border-gray-300 bg-white'
                              }`}
                            >
                              {isSelected && (
                                <TickCircle size={16} variant="Bold" color="#FFFFFF" />
                              )}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3 mb-2">
                              <div
                                className="w-8 h-8 rounded-lg flex-shrink-0"
                                style={{ backgroundColor: suggestion.color }}
                              />
                              <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-lg">
                                  {suggestion.name}
                                </h3>
                                {suggestion.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {suggestion.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="mt-3">
                              <div className="text-xs font-medium text-gray-500 mb-2">
                                {suggestedThemes.length} mini-thème(s) inclus :
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {suggestedThemes.map((theme) => (
                                  <span
                                    key={theme.id}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                                    style={{ backgroundColor: theme.color }}
                                  >
                                    {theme.name}
                                    <span className="opacity-75">({theme.extractCount})</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedSuggestions.length} groupe(s) sélectionné(s)
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    setShowSuggestionsModal(false);
                    setSelectedSuggestions([]);
                  }}
                  className="px-4 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-all"
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateSuggestedGroups}
                  disabled={selectedSuggestions.length === 0 || creatingGroup}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {creatingGroup ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Création...
                    </>
                  ) : (
                    <>
                      <TickCircle size={20} variant="Bulk" color="#FFFFFF" />
                      Créer les groupes sélectionnés
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemesPage;
