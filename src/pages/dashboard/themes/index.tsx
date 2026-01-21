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
import { Add, Edit2, Trash, TickCircle, CloseCircle, Graph, MagicStar, SearchNormal1, VideoPlay, DocumentDownload, DocumentUpload } from 'iconsax-react';
import Button from '../../../components/actions/button';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import ActionConfirmationModal from '../../../components/modals/ActionConfirmationModal';
import ThemeGroupGraphModal from '../../../components/themes/ThemeGroupGraphModal';
import ThemeGroupVideoCreationModal from '../../../components/themes/ThemeGroupVideoCreationModal';
import CustomThemeGroupSuggestionModal from '../../../components/themes/CustomThemeGroupSuggestionModal';
import { ExportModal, ImportModal } from '../../../components/export-import';
import { useToast } from '../../../context/toast-context';
import { useTheme } from '../../../context/theme-context';
import { cn } from '../../../lib/utils';

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
  const { theme } = useTheme();
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
  const [showCustomSuggestionModal, setShowCustomSuggestionModal] = useState(false);
  const [showVideoCreationModal, setShowVideoCreationModal] = useState(false);
  const [selectedGroupForVideo, setSelectedGroupForVideo] = useState<ThemeGroup | null>(null);

  // Export/Import states
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedExportThemeIds, setSelectedExportThemeIds] = useState<string[]>([]);
  const [selectedExportGroupIds, setSelectedExportGroupIds] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

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

  const openThemeModal = (themeItem?: Theme) => {
    if (themeItem) {
      setEditingTheme(themeItem);
      setFormData({
        name: themeItem.name,
        description: themeItem.description || '',
        color: themeItem.color,
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

  const handleOpenVideoCreation = (group: ThemeGroup) => {
    setSelectedGroupForVideo(group);
    setShowVideoCreationModal(true);
  };

  const handleCloseVideoCreation = () => {
    setShowVideoCreationModal(false);
    setSelectedGroupForVideo(null);
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

  // Export/Import handlers
  const toggleExportThemeSelection = (themeId: string) => {
    setSelectedExportThemeIds(prev =>
      prev.includes(themeId) ? prev.filter(id => id !== themeId) : [...prev, themeId]
    );
  };

  const toggleExportGroupSelection = (groupId: string) => {
    setSelectedExportGroupIds(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const handleToggleSelectionMode = () => {
    if (isSelectionMode) {
      // Exiting selection mode - clear selections
      setSelectedExportThemeIds([]);
      setSelectedExportGroupIds([]);
    }
    setIsSelectionMode(!isSelectionMode);
  };

  const handleSelectAll = () => {
    if (activeTab === 'mini-themes') {
      if (selectedExportThemeIds.length === filteredThemes.length) {
        setSelectedExportThemeIds([]);
      } else {
        setSelectedExportThemeIds(filteredThemes.map((t: Theme) => t.id));
      }
    } else {
      if (selectedExportGroupIds.length === filteredGroups.length) {
        setSelectedExportGroupIds([]);
      } else {
        setSelectedExportGroupIds(filteredGroups.map((g: ThemeGroup) => g.id));
      }
    }
  };

  const handleOpenExportModal = () => {
    setShowExportModal(true);
  };

  const handleCloseExportModal = () => {
    setShowExportModal(false);
  };

  const handleOpenImportModal = () => {
    setShowImportModal(true);
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
  };

  const handleImportComplete = () => {
    refetchThemes();
    refetchThemeGroups();
  };

  const themes = themesData?.themes || [];
  const themeGroups = themeGroupsData?.themeGroups || [];
  const suggestions: ThemeGroupSuggestion[] = suggestionsData?.suggestThemeGroups || [];
  const loading = themesLoading || themeGroupsLoading;

  // Filter themes and groups based on search queries
  const filteredThemes = themes.filter((t: Theme) =>
    t.name.toLowerCase().includes(miniThemeSearchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(miniThemeSearchQuery.toLowerCase())
  );

  const filteredGroups = themeGroups.filter((group: ThemeGroup) =>
    group.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(groupSearchQuery.toLowerCase())
  );

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      theme === "dark" ? "bg-[#0a0a0f]" : "bg-gray-50"
    )}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={cn(
            "text-3xl font-bold mb-2",
            theme === "dark" ? "text-white" : "text-gray-900"
          )}>
            Thèmes
          </h1>
          <p className={cn(
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          )}>
            Organisez vos extraits avec des mini-thèmes et des groupes de thèmes
          </p>
        </div>

        {/* Tabs */}
        <div className={cn(
          "mb-6 border-b",
          theme === "dark" ? "border-gray-800" : "border-gray-200"
        )}>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('mini-themes')}
              className={cn(
                "px-4 py-3 font-medium transition-colors border-b-2",
                activeTab === 'mini-themes'
                  ? "border-purple-500 text-purple-500"
                  : theme === "dark"
                    ? "border-transparent text-gray-400 hover:text-white"
                    : "border-transparent text-gray-600 hover:text-gray-900"
              )}
            >
              Mini-Thèmes ({themes.length})
            </button>
            <button
              onClick={() => setActiveTab('theme-groups')}
              className={cn(
                "px-4 py-3 font-medium transition-colors border-b-2",
                activeTab === 'theme-groups'
                  ? "border-purple-500 text-purple-500"
                  : theme === "dark"
                    ? "border-transparent text-gray-400 hover:text-white"
                    : "border-transparent text-gray-600 hover:text-gray-900"
              )}
            >
              Groupes de Thèmes ({themeGroups.length})
            </button>
          </div>
        </div>

        {/* Action Buttons and Search */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative max-w-md w-full">
            <SearchNormal1
              size={20}
              color={theme === "dark" ? "#6b7280" : "#9CA3AF"}
              className="absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              type="text"
              placeholder={activeTab === 'mini-themes' ? 'Rechercher un mini-thème...' : 'Rechercher un groupe de thème...'}
              value={activeTab === 'mini-themes' ? miniThemeSearchQuery : groupSearchQuery}
              onChange={(e) => activeTab === 'mini-themes' ? setMiniThemeSearchQuery(e.target.value) : setGroupSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-colors focus:outline-none",
                theme === "dark"
                  ? "bg-[#12121a] border-gray-800 text-white placeholder-gray-500 focus:border-purple-500"
                  : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500"
              )}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {/* Import Button */}
            <Button
              onClick={handleOpenImportModal}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all",
                theme === "dark"
                  ? "border-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                  : "border-2 border-cyan-300 text-cyan-600 hover:bg-cyan-50"
              )}
            >
              <DocumentUpload size={20} color={theme === "dark" ? "#22d3ee" : "#0891b2"} />
              <span>Importer</span>
            </Button>

            {/* Selection Mode Toggle */}
            <Button
              onClick={handleToggleSelectionMode}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all",
                isSelectionMode
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : theme === "dark"
                    ? "border-2 border-gray-700 text-gray-300 hover:bg-gray-800"
                    : "border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              )}
            >
              <DocumentDownload size={20} color={isSelectionMode ? "#FFFFFF" : theme === "dark" ? "#d1d5db" : "#374151"} />
              <span>{isSelectionMode ? 'Mode Export' : 'Exporter'}</span>
            </Button>

            {/* Selection actions when in selection mode */}
            {isSelectionMode && (
              <>
                <Button
                  onClick={handleSelectAll}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all",
                    theme === "dark"
                      ? "border-2 border-gray-700 text-gray-300 hover:bg-gray-800"
                      : "border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <TickCircle size={20} color={theme === "dark" ? "#d1d5db" : "#374151"} />
                  <span>
                    {(activeTab === 'mini-themes' ? selectedExportThemeIds.length === filteredThemes.length : selectedExportGroupIds.length === filteredGroups.length)
                      ? 'Désélectionner tout'
                      : 'Tout sélectionner'}
                  </span>
                </Button>
                <Button
                  onClick={handleOpenExportModal}
                  disabled={(activeTab === 'mini-themes' ? selectedExportThemeIds.length : selectedExportGroupIds.length) === 0}
                  className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white hover:bg-green-700 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <DocumentDownload size={20} color="#FFFFFF" />
                  <span>
                    Exporter ({activeTab === 'mini-themes' ? selectedExportThemeIds.length : selectedExportGroupIds.length})
                  </span>
                </Button>
              </>
            )}

            {!isSelectionMode && (
              <>
                {activeTab === 'theme-groups' && themes.length >= 2 && (
                  <>
                    <Button
                      onClick={handleGetSuggestions}
                      disabled={loadingSuggestions}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-500 hover:to-purple-600 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <Button
                      onClick={() => setShowCustomSuggestionModal(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25"
                    >
                      <MagicStar size={20} variant="Bulk" color="#FFFFFF" />
                      <span>Personnalisée</span>
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => activeTab === 'mini-themes' ? openThemeModal() : openThemeGroupModal()}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-400 hover:to-cyan-400 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25"
                >
                  <Add size={20} variant="Bulk" color="#FFFFFF" />
                  {activeTab === 'mini-themes' ? 'Nouveau Mini-Thème' : 'Nouveau Groupe'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Mini-Themes Tab */}
        {!loading && activeTab === 'mini-themes' && (
          <>
            {themes.length === 0 ? (
              <div className={cn(
                "rounded-2xl border-2 p-12 text-center",
                theme === "dark"
                  ? "bg-[#12121a] border-gray-800"
                  : "bg-white border-gray-200"
              )}>
                <div className="max-w-md mx-auto flex flex-col items-center">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center mb-4",
                    theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                  )}>
                    <Add size={32} color={theme === "dark" ? "#6b7280" : "#9CA3AF"} />
                  </div>
                  <h3 className={cn(
                    "text-lg font-semibold mb-2",
                    theme === "dark" ? "text-white" : "text-gray-900"
                  )}>
                    Aucun mini-thème
                  </h3>
                  <p className={cn(
                    "mb-6",
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  )}>
                    Créez votre premier mini-thème pour commencer à organiser vos extraits
                  </p>
                  <Button
                    onClick={() => openThemeModal()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-400 hover:to-cyan-400 rounded-xl font-medium transition-all"
                  >
                    Créer un Mini-Thème
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {filteredThemes.length === 0 ? (
                  <div className={cn(
                    "rounded-2xl border-2 p-12 text-center",
                    theme === "dark"
                      ? "bg-[#12121a] border-gray-800"
                      : "bg-white border-gray-200"
                  )}>
                    <div className="max-w-md mx-auto">
                      <SearchNormal1 size={48} color={theme === "dark" ? "#6b7280" : "#9CA3AF"} className="mx-auto mb-4" />
                      <h3 className={cn(
                        "text-lg font-semibold mb-2",
                        theme === "dark" ? "text-white" : "text-gray-900"
                      )}>
                        Aucun résultat
                      </h3>
                      <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                        Aucun mini-thème ne correspond à votre recherche
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredThemes.map((t: Theme) => (
                      <div
                        key={t.id}
                        onClick={isSelectionMode ? () => toggleExportThemeSelection(t.id) : undefined}
                        className={cn(
                          "rounded-2xl border-2 overflow-hidden transition-all",
                          isSelectionMode
                            ? selectedExportThemeIds.includes(t.id)
                              ? "border-purple-500 ring-2 ring-purple-500/30 cursor-pointer"
                              : theme === "dark"
                                ? "border-gray-800 hover:border-purple-500/50 cursor-pointer"
                                : "border-gray-200 hover:border-purple-300 cursor-pointer"
                            : theme === "dark"
                              ? "bg-[#12121a] border-gray-800 hover:border-gray-700"
                              : "bg-white border-gray-200 hover:shadow-lg"
                        )}
                      >
                        <div
                          className="h-24 flex items-center justify-center relative"
                          style={{ backgroundColor: t.color }}
                        >
                          {isSelectionMode && (
                            <div className="absolute top-3 left-3">
                              <div className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                                selectedExportThemeIds.includes(t.id)
                                  ? "bg-purple-600 border-purple-600"
                                  : "bg-white/80 border-white"
                              )}>
                                {selectedExportThemeIds.includes(t.id) && (
                                  <TickCircle size={16} variant="Bold" color="#FFFFFF" />
                                )}
                              </div>
                            </div>
                          )}
                          <h3 className="text-xl font-bold text-white text-center px-4 drop-shadow-lg">
                            {t.name}
                          </h3>
                        </div>
                        <div className={cn(
                          "p-4",
                          theme === "dark" ? "bg-[#12121a]" : "bg-white"
                        )}>
                          {t.description && (
                            <p className={cn(
                              "text-sm mb-3 line-clamp-2",
                              theme === "dark" ? "text-gray-400" : "text-gray-600"
                            )}>
                              {t.description}
                            </p>
                          )}
                          <div className={cn(
                            "mb-4 px-3 py-2 rounded-lg border",
                            theme === "dark"
                              ? "bg-gray-900/50 border-gray-800"
                              : "bg-gray-50 border-gray-200"
                          )}>
                            <div className="flex items-center justify-between">
                              <span className={cn(
                                "text-xs font-medium",
                                theme === "dark" ? "text-gray-500" : "text-gray-600"
                              )}>
                                Extraits
                              </span>
                              <span className={cn(
                                "text-sm font-bold",
                                theme === "dark" ? "text-white" : "text-gray-900"
                              )}>
                                {t.extractCount}
                              </span>
                            </div>
                          </div>
                          {!isSelectionMode && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => openThemeModal(t)}
                                className={cn(
                                  "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                  theme === "dark"
                                    ? "text-purple-400 bg-purple-500/10 hover:bg-purple-500/20"
                                    : "text-purple-600 bg-purple-50 hover:bg-purple-100"
                                )}
                              >
                                <Edit2 size={16} variant="Bulk" color={theme === "dark" ? "#a855f7" : "#9333ea"} />
                                Modifier
                              </button>
                              <button
                                onClick={() => handleDeleteClick(t.id, t.name, 'theme')}
                                className={cn(
                                  "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                  theme === "dark"
                                    ? "text-red-400 bg-red-500/10 hover:bg-red-500/20"
                                    : "text-red-600 bg-red-50 hover:bg-red-100"
                                )}
                              >
                                <Trash size={16} variant="Bulk" color={theme === "dark" ? "#f87171" : "#dc2626"} />
                                Supprimer
                              </button>
                            </div>
                          )}
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
              <div className={cn(
                "rounded-2xl border-2 p-12 text-center",
                theme === "dark"
                  ? "bg-[#12121a] border-gray-800"
                  : "bg-white border-gray-200"
              )}>
                <div className="max-w-md mx-auto flex flex-col items-center">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center mb-4",
                    theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                  )}>
                    <Add size={32} color={theme === "dark" ? "#6b7280" : "#9CA3AF"} />
                  </div>
                  <h3 className={cn(
                    "text-lg font-semibold mb-2",
                    theme === "dark" ? "text-white" : "text-gray-900"
                  )}>
                    Aucun groupe de thème
                  </h3>
                  <p className={cn(
                    "mb-6",
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  )}>
                    Créez votre premier groupe de thème pour regrouper plusieurs mini-thèmes
                  </p>
                  <Button
                    onClick={() => openThemeGroupModal()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-400 hover:to-cyan-400 rounded-xl font-medium transition-all"
                  >
                    Créer un Groupe
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {filteredGroups.length === 0 ? (
                  <div className={cn(
                    "rounded-2xl border-2 p-12 text-center",
                    theme === "dark"
                      ? "bg-[#12121a] border-gray-800"
                      : "bg-white border-gray-200"
                  )}>
                    <div className="max-w-md mx-auto">
                      <SearchNormal1 size={48} color={theme === "dark" ? "#6b7280" : "#9CA3AF"} className="mx-auto mb-4" />
                      <h3 className={cn(
                        "text-lg font-semibold mb-2",
                        theme === "dark" ? "text-white" : "text-gray-900"
                      )}>
                        Aucun résultat
                      </h3>
                      <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                        Aucun groupe de thème ne correspond à votre recherche
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGroups.map((group: ThemeGroup) => (
                      <div
                        key={group.id}
                        onClick={isSelectionMode ? () => toggleExportGroupSelection(group.id) : undefined}
                        className={cn(
                          "rounded-2xl border-2 overflow-hidden transition-all",
                          isSelectionMode
                            ? selectedExportGroupIds.includes(group.id)
                              ? "border-purple-500 ring-2 ring-purple-500/30 cursor-pointer"
                              : theme === "dark"
                                ? "border-gray-800 hover:border-purple-500/50 cursor-pointer"
                                : "border-gray-200 hover:border-purple-300 cursor-pointer"
                            : theme === "dark"
                              ? "bg-[#12121a] border-gray-800 hover:border-gray-700"
                              : "bg-white border-gray-200 hover:shadow-lg"
                        )}
                      >
                        <div
                          className="h-24 flex items-center justify-center relative"
                          style={{ backgroundColor: group.color }}
                        >
                          {isSelectionMode && (
                            <div className="absolute top-3 left-3">
                              <div className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                                selectedExportGroupIds.includes(group.id)
                                  ? "bg-purple-600 border-purple-600"
                                  : "bg-white/80 border-white"
                              )}>
                                {selectedExportGroupIds.includes(group.id) && (
                                  <TickCircle size={16} variant="Bold" color="#FFFFFF" />
                                )}
                              </div>
                            </div>
                          )}
                          <h3 className="text-xl font-bold text-white text-center px-4 drop-shadow-lg">
                            {group.name}
                          </h3>
                        </div>
                        <div className={cn(
                          "p-4",
                          theme === "dark" ? "bg-[#12121a]" : "bg-white"
                        )}>
                          {group.description && (
                            <p className={cn(
                              "text-sm mb-3 line-clamp-2",
                              theme === "dark" ? "text-gray-400" : "text-gray-600"
                            )}>
                              {group.description}
                            </p>
                          )}
                          <div className="mb-3 space-y-2">
                            <div className={cn(
                              "px-3 py-2 rounded-lg border",
                              theme === "dark"
                                ? "bg-gray-900/50 border-gray-800"
                                : "bg-gray-50 border-gray-200"
                            )}>
                              <div className="flex items-center justify-between">
                                <span className={cn(
                                  "text-xs font-medium",
                                  theme === "dark" ? "text-gray-500" : "text-gray-600"
                                )}>
                                  Mini-thèmes
                                </span>
                                <span className={cn(
                                  "text-sm font-bold",
                                  theme === "dark" ? "text-white" : "text-gray-900"
                                )}>
                                  {group.themes.length}
                                </span>
                              </div>
                            </div>
                            <div className={cn(
                              "px-3 py-2 rounded-lg border",
                              theme === "dark"
                                ? "bg-purple-500/10 border-purple-500/30"
                                : "bg-purple-50 border-purple-200"
                            )}>
                              <div className="flex items-center justify-between">
                                <span className={cn(
                                  "text-xs font-medium",
                                  theme === "dark" ? "text-purple-400" : "text-purple-600"
                                )}>
                                  Extraits totaux
                                </span>
                                <span className={cn(
                                  "text-sm font-bold",
                                  theme === "dark" ? "text-purple-300" : "text-purple-900"
                                )}>
                                  {group.extractCount}
                                </span>
                              </div>
                            </div>
                          </div>
                          {group.themes.length > 0 && (
                            <div className="mb-4 flex flex-wrap gap-1">
                              {group.themes.slice(0, 3).map((t) => (
                                <span
                                  key={t.id}
                                  className="text-xs px-2 py-1 rounded-full text-white"
                                  style={{ backgroundColor: t.color }}
                                >
                                  {t.name}
                                </span>
                              ))}
                              {group.themes.length > 3 && (
                                <span className={cn(
                                  "text-xs px-2 py-1 rounded-full",
                                  theme === "dark"
                                    ? "bg-gray-800 text-gray-400"
                                    : "bg-gray-200 text-gray-700"
                                )}>
                                  +{group.themes.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                          {!isSelectionMode && (
                            <div className="space-y-2">
                              <button
                                onClick={() => handleOpenVideoCreation(group)}
                                className={cn(
                                  "w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                  theme === "dark"
                                    ? "text-pink-400 bg-pink-500/10 hover:bg-pink-500/20"
                                    : "text-pink-600 bg-pink-50 hover:bg-pink-100"
                                )}
                              >
                                <VideoPlay size={16} variant="Bulk" color={theme === "dark" ? "#f472b6" : "#db2777"} />
                                Créer une Vidéo
                              </button>
                              <button
                                onClick={() => handleOpenGraph(group)}
                                className={cn(
                                  "w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                  theme === "dark"
                                    ? "text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20"
                                    : "text-cyan-600 bg-cyan-50 hover:bg-cyan-100"
                                )}
                              >
                                <Graph size={16} variant="Bulk" color={theme === "dark" ? "#22d3ee" : "#0891b2"} />
                                Visualiser
                              </button>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openThemeGroupModal(group)}
                                  className={cn(
                                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                    theme === "dark"
                                      ? "text-purple-400 bg-purple-500/10 hover:bg-purple-500/20"
                                      : "text-purple-600 bg-purple-50 hover:bg-purple-100"
                                  )}
                                >
                                  <Edit2 size={16} variant="Bulk" color={theme === "dark" ? "#a855f7" : "#9333ea"} />
                                  Modifier
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(group.id, group.name, 'group')}
                                  className={cn(
                                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                    theme === "dark"
                                      ? "text-red-400 bg-red-500/10 hover:bg-red-500/20"
                                      : "text-red-600 bg-red-50 hover:bg-red-100"
                                  )}
                                >
                                  <Trash size={16} variant="Bulk" color={theme === "dark" ? "#f87171" : "#dc2626"} />
                                  Supprimer
                                </button>
                              </div>
                            </div>
                          )}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={cn(
            "rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto",
            theme === "dark" ? "bg-[#12121a]" : "bg-white"
          )}>
            <div className={cn(
              "sticky top-0 border-b px-6 py-4 flex items-center justify-between",
              theme === "dark"
                ? "bg-[#12121a] border-gray-800"
                : "bg-white border-gray-200"
            )}>
              <h2 className={cn(
                "text-xl font-bold",
                theme === "dark" ? "text-white" : "text-gray-900"
              )}>
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
                className={cn(
                  "transition-colors",
                  theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <CloseCircle size={24} variant="Bulk" color={theme === "dark" ? "#6b7280" : "#9CA3AF"} />
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
                <label className={cn(
                  "block text-sm font-medium mb-3",
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                )}>
                  Couleur *
                </label>
                <div className="grid grid-cols-10 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={cn(
                        "w-8 h-8 rounded-full transition-all hover:scale-110",
                        formData.color === color && "ring-2 ring-offset-2",
                        formData.color === color && (theme === "dark" ? "ring-white ring-offset-[#12121a]" : "ring-gray-900 ring-offset-white")
                      )}
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
                  <label className={cn(
                    "block text-sm font-medium mb-3",
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  )}>
                    Sélectionner les Mini-Thèmes
                  </label>
                  {themes.length === 0 ? (
                    <div className={cn(
                      "text-center py-6 rounded-lg border",
                      theme === "dark"
                        ? "bg-gray-900/50 border-gray-800 text-gray-400"
                        : "bg-gray-50 border-gray-200 text-gray-600"
                    )}>
                      <p>Aucun mini-thème disponible. Créez-en un d'abord.</p>
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
                          className={cn(
                            "w-full px-4 py-2 rounded-lg border text-sm focus:outline-none",
                            theme === "dark"
                              ? "bg-gray-900/50 border-gray-800 text-white placeholder-gray-500 focus:border-purple-500"
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500"
                          )}
                        />
                      </div>
                      <div className={cn(
                        "max-h-60 overflow-y-auto rounded-lg border p-2 space-y-2",
                        theme === "dark" ? "border-gray-800" : "border-gray-200"
                      )}>
                        {themes
                          .filter((t: Theme) =>
                            t.name.toLowerCase().includes(themeSearchQuery.toLowerCase())
                          )
                          .map((t: Theme) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => toggleThemeSelection(t.id)}
                              className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                                selectedThemeIds.includes(t.id)
                                  ? "border-purple-500 bg-purple-500/10"
                                  : theme === "dark"
                                    ? "border-gray-800 hover:border-gray-700"
                                    : "border-gray-200 hover:border-gray-300"
                              )}
                            >
                              <div
                                className="w-8 h-8 rounded-full flex-shrink-0"
                                style={{ backgroundColor: t.color }}
                              />
                              <div className="flex-1 text-left">
                                <div className={cn(
                                  "font-medium",
                                  theme === "dark" ? "text-white" : "text-gray-900"
                                )}>
                                  {t.name}
                                </div>
                                <div className={cn(
                                  "text-xs",
                                  theme === "dark" ? "text-gray-500" : "text-gray-500"
                                )}>
                                  {t.extractCount} extraits
                                </div>
                              </div>
                              {selectedThemeIds.includes(t.id) && (
                                <TickCircle size={24} variant="Bulk" color="#a855f7" />
                              )}
                            </button>
                          ))}
                        {themes.filter((t: Theme) =>
                          t.name.toLowerCase().includes(themeSearchQuery.toLowerCase())
                        ).length === 0 && (
                          <div className={cn(
                            "text-center py-6 text-sm",
                            theme === "dark" ? "text-gray-500" : "text-gray-500"
                          )}>
                            Aucun mini-thème trouvé
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  <div className={cn(
                    "mt-2 text-sm",
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  )}>
                    {selectedThemeIds.length} mini-thème(s) sélectionné(s)
                  </div>
                </div>
              )}

              {/* Preview */}
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2",
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                )}>
                  Aperçu
                </label>
                <div
                  className="h-20 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: formData.color }}
                >
                  <span className="text-lg font-bold text-white drop-shadow-lg">
                    {formData.name || 'Nom du thème'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={closeModal}
                  className={cn(
                    "flex-1 px-4 py-3 rounded-xl font-medium transition-all",
                    theme === "dark"
                      ? "border-2 border-gray-700 text-gray-300 hover:bg-gray-800"
                      : "border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                  )}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={creating || updating || creatingGroup || updatingGroup}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-400 hover:to-cyan-400 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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

      {/* Video Creation Modal */}
      {selectedGroupForVideo && (
        <ThemeGroupVideoCreationModal
          themeGroup={selectedGroupForVideo}
          isOpen={showVideoCreationModal}
          onClose={handleCloseVideoCreation}
        />
      )}

      {/* AI Suggestions Modal */}
      {showSuggestionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={cn(
            "rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto",
            theme === "dark" ? "bg-[#12121a]" : "bg-white"
          )}>
            <div className={cn(
              "sticky top-0 border-b px-6 py-4 flex items-center justify-between",
              theme === "dark"
                ? "bg-[#12121a] border-gray-800"
                : "bg-white border-gray-200"
            )}>
              <div>
                <h2 className={cn(
                  "text-xl font-bold flex items-center gap-2",
                  theme === "dark" ? "text-white" : "text-gray-900"
                )}>
                  <MagicStar size={24} variant="Bulk" color="#a855f7" />
                  Suggestions de Groupes de Thèmes
                </h2>
                <p className={cn(
                  "text-sm mt-1",
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                )}>
                  Sélectionnez les groupes que vous souhaitez créer
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSuggestionsModal(false);
                  setSelectedSuggestions([]);
                }}
                className={cn(
                  "transition-colors",
                  theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <CloseCircle size={24} variant="Bulk" color={theme === "dark" ? "#6b7280" : "#9CA3AF"} />
              </button>
            </div>

            <div className="p-6">
              {suggestions.length === 0 ? (
                <div className={cn(
                  "text-center py-12",
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                )}>
                  <p>Aucune suggestion générée pour le moment</p>
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
                        className={cn(
                          "w-full text-left p-4 rounded-xl border-2 transition-all",
                          isSelected
                            ? "border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/30"
                            : theme === "dark"
                              ? "border-gray-800 hover:border-gray-700 bg-[#0a0a0f]"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            <div
                              className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                isSelected
                                  ? "bg-purple-600 border-purple-600"
                                  : theme === "dark"
                                    ? "border-gray-600 bg-gray-800"
                                    : "border-gray-300 bg-white"
                              )}
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
                                <h3 className={cn(
                                  "font-bold text-lg",
                                  theme === "dark" ? "text-white" : "text-gray-900"
                                )}>
                                  {suggestion.name}
                                </h3>
                                {suggestion.description && (
                                  <p className={cn(
                                    "text-sm mt-1",
                                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                                  )}>
                                    {suggestion.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="mt-3">
                              <div className={cn(
                                "text-xs font-medium mb-2",
                                theme === "dark" ? "text-gray-500" : "text-gray-500"
                              )}>
                                {suggestedThemes.length} mini-thème(s) inclus :
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {suggestedThemes.map((t) => (
                                  <span
                                    key={t.id}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                                    style={{ backgroundColor: t.color }}
                                  >
                                    {t.name}
                                    <span className="opacity-75">({t.extractCount})</span>
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

            <div className={cn(
              "sticky bottom-0 border-t px-6 py-4 flex items-center justify-between",
              theme === "dark"
                ? "bg-[#0a0a0f] border-gray-800"
                : "bg-gray-50 border-gray-200"
            )}>
              <div className={cn(
                "text-sm",
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              )}>
                {selectedSuggestions.length} groupe(s) sélectionné(s)
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    setShowSuggestionsModal(false);
                    setSelectedSuggestions([]);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-all",
                    theme === "dark"
                      ? "border-2 border-gray-700 text-gray-300 hover:bg-gray-800"
                      : "border-2 border-gray-300 text-gray-700 hover:bg-gray-100"
                  )}
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateSuggestedGroups}
                  disabled={selectedSuggestions.length === 0 || creatingGroup}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-400 hover:to-cyan-400 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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

      {/* Custom Suggestion Modal */}
      <CustomThemeGroupSuggestionModal
        isOpen={showCustomSuggestionModal}
        onClose={() => setShowCustomSuggestionModal(false)}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={handleCloseExportModal}
        exportType={activeTab === 'mini-themes' ? 'themes' : 'themeGroups'}
        selectedIds={activeTab === 'mini-themes' ? selectedExportThemeIds : selectedExportGroupIds}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={handleCloseImportModal}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
};

export default ThemesPage;
