import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router';
import { GET_EXTRACTS, GET_THEMES } from '../../../lib/graphql/queries';
import { DELETE_EXTRACT } from '../../../lib/graphql/mutations';
import { Add, Edit2, Trash, Clock, Calendar, Profile2User, VideoPlay, TickCircle, CloseCircle } from 'iconsax-react';
import Button from '../../../components/actions/button';
import ActionConfirmationModal from '../../../components/modals/ActionConfirmationModal';
import { useToast } from '../../../context/toast-context';

interface Character {
  malId: number;
  name: string;
  image?: string;
}

interface Theme {
  id: string;
  name: string;
  color: string;
}

interface Extract {
  id: string;
  text: string;
  characters: Character[];
  animeId: number;
  animeTitle: string;
  animeImage?: string;
  timing: {
    start: string;
    end: string;
  };
  season?: number;
  episode?: number;
  theme?: Theme;
  createdAt: string;
}

const ExtractsPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [selectedThemeId, setSelectedThemeId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [extractToDelete, setExtractToDelete] = useState<{ id: string; text: string } | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedExtracts, setSelectedExtracts] = useState<string[]>([]);

  const { data: themesData } = useQuery(GET_THEMES);
  const { data, loading, refetch } = useQuery(GET_EXTRACTS, {
    variables: {
      themeId: selectedThemeId,
    },
  });

  const [deleteExtract, { loading: deleting }] = useMutation(DELETE_EXTRACT, {
    onCompleted: () => {
      refetch();
      setShowDeleteModal(false);
      setExtractToDelete(null);
      toast.success('Extract deleted', 'The extract has been deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting extract:', error);
      toast.error('Failed to delete extract', error.message || 'Please try again');
    },
  });

  const handleDeleteClick = (id: string, text: string) => {
    setExtractToDelete({ id, text });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (extractToDelete) {
      deleteExtract({ variables: { id: extractToDelete.id } });
    }
  };

  const toggleExtractSelection = (extractId: string) => {
    setSelectedExtracts((prev) =>
      prev.includes(extractId)
        ? prev.filter((id) => id !== extractId)
        : [...prev, extractId]
    );
  };

  const handleCreateVideo = () => {
    if (selectedExtracts.length === 0) {
      toast.error('No extracts selected', 'Please select at least one extract to create a video');
      return;
    }
    // Navigate to video builder with selected extracts
    navigate('/dashboard/video/builder', {
      state: { extractIds: selectedExtracts }
    });
  };

  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedExtracts([]);
  };

  const themes: Theme[] = themesData?.themes || [];
  const extracts: Extract[] = data?.extracts || [];

  // Filter extracts by search query
  const filteredExtracts = extracts.filter((extract) =>
    extract.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    extract.animeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    extract.characters.some((char) => char.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">All Extracts</h1>
            <p className="text-gray-600">
              {isSelectionMode
                ? `${selectedExtracts.length} extract${selectedExtracts.length !== 1 ? 's' : ''} selected for video`
                : 'Browse and manage your anime extracts'
              }
            </p>
          </div>
          <div className="flex gap-3">
            {isSelectionMode ? (
              <>
                <Button
                  onClick={handleCancelSelection}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg font-medium transition-all"
                >
                  <CloseCircle size={20} variant="Bulk" color="#374151" />
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateVideo}
                  disabled={selectedExtracts.length === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TickCircle size={20} variant="Bulk" color="#FFFFFF" />
                  Continue ({selectedExtracts.length})
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setIsSelectionMode(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
                >
                  <VideoPlay size={20} variant="Bulk" color="#FFFFFF" />
                  Create Video
                </Button>
                <Button
                  onClick={() => navigate('/dashboard/extracts/new')}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
                >
                  <Add size={20} variant="Bulk" color="#FFFFFF" />
                  New Extract
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search by text, anime, or character..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Theme Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedThemeId(undefined)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                !selectedThemeId
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All Themes
            </button>
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedThemeId(theme.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  selectedThemeId === theme.id
                    ? 'text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: selectedThemeId === theme.id ? theme.color : undefined,
                }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: theme.color }}
                />
                {theme.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredExtracts.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Add size={32} color="#9CA3AF" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery || selectedThemeId ? 'No extracts found' : 'No extracts yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedThemeId
                  ? 'Try adjusting your filters or search query'
                  : 'Create your first extract to start building your collection'}
              </p>
              <Button
                onClick={() => navigate('/dashboard/extracts/new')}
                className="px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium transition-all"
              >
                Create Extract
              </Button>
            </div>
          </div>
        )}

        {/* Extracts Grid */}
        {!loading && filteredExtracts.length > 0 && (
          <div>
            <div className="mb-4 text-sm text-gray-600">
              {filteredExtracts.length} extract{filteredExtracts.length > 1 ? 's' : ''} found
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredExtracts.map((extract) => {
                const isSelected = selectedExtracts.includes(extract.id);
                return (
                <div
                  key={extract.id}
                  onClick={() => isSelectionMode && toggleExtractSelection(extract.id)}
                  className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all ${
                    isSelectionMode ? 'cursor-pointer' : ''
                  } ${
                    isSelected
                      ? 'border-purple-600 ring-2 ring-purple-200 shadow-lg'
                      : 'border-gray-200 hover:shadow-lg'
                  }`}
                >
                  {/* Theme Bar */}
                  {extract.theme && (
                    <div
                      className="h-2"
                      style={{ backgroundColor: extract.theme.color }}
                    />
                  )}

                  <div className="p-6">
                    {/* Selection Indicator */}
                    {isSelectionMode && (
                      <div className="mb-4 flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'bg-purple-600 border-purple-600'
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <TickCircle size={16} variant="Bold" color="#FFFFFF" />
                          )}
                        </div>
                        <span className={`text-sm font-medium ${
                          isSelected ? 'text-purple-600' : 'text-gray-500'
                        }`}>
                          {isSelected ? 'Selected' : 'Click to select'}
                        </span>
                      </div>
                    )}

                    {/* Anime Info */}
                    <div className="flex gap-4 mb-4">
                      {extract.animeImage && (
                        <img
                          src={extract.animeImage}
                          alt={extract.animeTitle}
                          className="w-16 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                          {extract.animeTitle}
                        </h3>
                        {extract.theme && (
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-white mb-2"
                            style={{ backgroundColor: extract.theme.color }}
                          >
                            {extract.theme.name}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          {extract.episode && (
                            <div className="flex items-center gap-1">
                              <Calendar size={14} color="#6B7280" />
                              <span>Ep. {extract.episode}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock size={14} color="#6B7280" />
                            <span>{extract.timing.start} - {extract.timing.end}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Extract Text */}
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-900 italic line-clamp-4">
                        "{extract.text}"
                      </p>
                    </div>

                    {/* Characters */}
                    {extract.characters.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <Profile2User size={14} color="#6B7280" />
                          <span>Characters:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {extract.characters.map((char) => (
                            <div
                              key={char.malId}
                              className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium"
                            >
                              {char.image && (
                                <img
                                  src={char.image}
                                  alt={char.name}
                                  className="w-5 h-5 rounded-full object-cover"
                                />
                              )}
                              <span>{char.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {!isSelectionMode && (
                      <div className="flex gap-2 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => navigate(`/dashboard/extracts/${extract.id}/edit`)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} variant="Bulk" color="#4F46E5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(extract.id, extract.text)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash size={16} variant="Bulk" color="#DC2626" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ActionConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setExtractToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Extract"
        message={`Are you sure you want to delete this extract? This action cannot be undone.\n\n"${extractToDelete?.text.substring(0, 80)}${extractToDelete && extractToDelete.text.length > 80 ? '...' : ''}"`}
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleting}
      />
    </div>
  );
};

export default ExtractsPage;
