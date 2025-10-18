import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_YOUTUBE_CHANNEL_VIDEOS, GET_EXTRACTS, GET_PUBLISHED_VIDEO_BY_YOUTUBE_ID, GET_SETTINGS } from '../../../lib/graphql/queries';
import { LINK_PUBLISHED_VIDEO, UPDATE_PUBLISHED_VIDEO, DELETE_PUBLISHED_VIDEO } from '../../../lib/graphql/mutations';
import { Add, Trash, TickCircle, CloseCircle, Eye } from 'iconsax-react';
import Button from '../../../components/actions/button';
import ActionConfirmationModal from '../../../components/modals/ActionConfirmationModal';
import { useToast } from '../../../context/toast-context';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  duration: string;
  durationInSeconds: number;
  isShort: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

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
  episode?: number;
  theme?: Theme;
  isUsedInVideo: boolean;
}

interface PublishedVideo {
  id: string;
  youtubeVideoId: string;
  extractIds: string[];
  extracts?: Extract[];
}

const PublishedVideosPage: React.FC = () => {
  const toast = useToast();
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [selectedExtracts, setSelectedExtracts] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [publishedVideoToDelete, setPublishedVideoToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isLinkingMode, setIsLinkingMode] = useState(false);

  const { data: settingsData } = useQuery(GET_SETTINGS);
  const youtubeChannelUrl = settingsData?.settings?.youtubeChannelUrl;

  const { data: ytData, loading: ytLoading } = useQuery(GET_YOUTUBE_CHANNEL_VIDEOS, {
    variables: { url: youtubeChannelUrl, maxResults: 50 },
    skip: !youtubeChannelUrl,
  });

  const { data: extractsData, loading: extractsLoading, refetch: refetchExtracts } = useQuery(GET_EXTRACTS);

  const { data: existingPublishedVideo, refetch: refetchPublished } = useQuery(GET_PUBLISHED_VIDEO_BY_YOUTUBE_ID, {
    variables: { youtubeVideoId: selectedVideo?.id || '' },
    skip: !selectedVideo,
  });

  const [linkPublishedVideo, { loading: linking }] = useMutation(LINK_PUBLISHED_VIDEO, {
    onCompleted: () => {
      toast.success('Video linked!', 'YouTube video has been linked to extracts successfully');
      refetchExtracts();
      refetchPublished();
      setIsLinkingMode(false);
      setSelectedExtracts([]);
    },
    onError: (error) => {
      console.error('Error linking video:', error);
      toast.error('Failed to link video', error.message || 'Please try again');
    },
  });

  const [updatePublishedVideo, { loading: updating }] = useMutation(UPDATE_PUBLISHED_VIDEO, {
    onCompleted: () => {
      toast.success('Video updated!', 'Linked extracts have been updated successfully');
      refetchExtracts();
      refetchPublished();
      setIsLinkingMode(false);
      setSelectedExtracts([]);
    },
    onError: (error) => {
      console.error('Error updating video:', error);
      toast.error('Failed to update video', error.message || 'Please try again');
    },
  });

  const [deletePublishedVideo, { loading: deleting }] = useMutation(DELETE_PUBLISHED_VIDEO, {
    onCompleted: () => {
      toast.success('Link removed!', 'Video link has been removed successfully');
      refetchExtracts();
      refetchPublished();
      setShowDeleteModal(false);
      setPublishedVideoToDelete(null);
    },
    onError: (error) => {
      console.error('Error deleting published video:', error);
      toast.error('Failed to remove link', error.message || 'Please try again');
    },
  });

  const youtubeVideos: YouTubeVideo[] = ytData?.getYouTubeChannelVideos || [];
  const extracts: Extract[] = extractsData?.extracts || [];
  const publishedVideo: PublishedVideo | null = existingPublishedVideo?.publishedVideoByYoutubeId || null;

  const handleVideoSelect = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    setSelectedExtracts([]);
    setIsLinkingMode(false);
  };

  const handleStartLinking = () => {
    if (publishedVideo) {
      setSelectedExtracts(publishedVideo.extractIds);
    } else {
      setSelectedExtracts([]);
    }
    setIsLinkingMode(true);
  };

  const handleCancelLinking = () => {
    setIsLinkingMode(false);
    setSelectedExtracts([]);
  };

  const toggleExtractSelection = (extractId: string, isUsed: boolean) => {
    if (isUsed && !selectedExtracts.includes(extractId)) {
      toast.error('Extract already in use', 'This extract is already used in another video');
      return;
    }

    setSelectedExtracts((prev) =>
      prev.includes(extractId)
        ? prev.filter((id) => id !== extractId)
        : [...prev, extractId]
    );
  };

  const handleSaveLink = () => {
    if (!selectedVideo) {
      toast.error('No video selected', 'Please select a YouTube video first');
      return;
    }

    if (selectedExtracts.length === 0) {
      toast.error('No extracts selected', 'Please select at least one extract');
      return;
    }

    const input = {
      youtubeVideoId: selectedVideo.id,
      title: selectedVideo.title,
      description: selectedVideo.description,
      thumbnail: selectedVideo.thumbnail,
      publishedAt: selectedVideo.publishedAt,
      duration: selectedVideo.duration,
      viewCount: selectedVideo.viewCount,
      likeCount: selectedVideo.likeCount,
      commentCount: selectedVideo.commentCount,
      extractIds: selectedExtracts,
    };

    if (publishedVideo) {
      updatePublishedVideo({ variables: { id: publishedVideo.id, extractIds: selectedExtracts } });
    } else {
      linkPublishedVideo({ variables: { input } });
    }
  };

  const handleDeleteClick = (id: string, title: string) => {
    setPublishedVideoToDelete({ id, title });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (publishedVideoToDelete) {
      deletePublishedVideo({ variables: { id: publishedVideoToDelete.id } });
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (!youtubeChannelUrl) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No YouTube channel configured</h2>
          <p className="text-gray-600 mb-6">
            Please configure your YouTube channel URL in the settings before linking videos to extracts.
          </p>
          <Button
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium transition-all"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Link YouTube Videos to Extracts</h1>
          <p className="text-gray-600">
            Select a published YouTube video and link it to the extracts used in that video
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - YouTube Videos */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">YouTube Videos</h2>

              {ytLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                  {youtubeVideos.filter(v => !v.isShort).map((video) => (
                    <div
                      key={video.id}
                      onClick={() => handleVideoSelect(video)}
                      className={`cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                        selectedVideo?.id === video.id
                          ? 'border-indigo-600 ring-2 ring-indigo-200'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-3">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">
                          {video.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{formatNumber(video.viewCount)} views</span>
                          <span>{video.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Video Details & Extracts */}
          <div className="lg:col-span-2 space-y-6">
            {selectedVideo ? (
              <>
                {/* Video Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedVideo.title}</h2>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>{formatNumber(selectedVideo.viewCount)} views</span>
                        <span>{formatNumber(selectedVideo.likeCount)} likes</span>
                        <span>{selectedVideo.duration}</span>
                      </div>
                      {publishedVideo && !isLinkingMode && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Linked to {publishedVideo.extractIds.length} extract{publishedVideo.extractIds.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {isLinkingMode ? (
                      <>
                        <Button
                          onClick={handleCancelLinking}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg font-medium transition-all"
                        >
                          <CloseCircle size={20} variant="Bulk" color="#374151" />
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveLink}
                          disabled={linking || updating || selectedExtracts.length === 0}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {linking || updating ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <TickCircle size={20} variant="Bulk" color="#FFFFFF" />
                              Save ({selectedExtracts.length})
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <>
                        {publishedVideo && (
                          <Button
                            onClick={() => handleDeleteClick(publishedVideo.id, selectedVideo.title)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-all"
                          >
                            <Trash size={20} variant="Bulk" color="#FFFFFF" />
                            Remove Link
                          </Button>
                        )}
                        <Button
                          onClick={handleStartLinking}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium transition-all"
                        >
                          <Add size={20} variant="Bulk" color="#FFFFFF" />
                          {publishedVideo ? 'Update Extracts' : 'Link Extracts'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Linked Extracts Display */}
                {publishedVideo && !isLinkingMode && publishedVideo.extracts && publishedVideo.extracts.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                      Linked Extracts ({publishedVideo.extracts.length})
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[calc(100vh-500px)] overflow-y-auto pr-2">
                      {publishedVideo.extracts.map((extract) => (
                        <div
                          key={extract.id}
                          className="border-2 border-green-200 rounded-lg p-4 bg-green-50"
                        >
                          {/* Linked Badge */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="px-2 py-1 bg-green-600 text-white rounded text-xs font-medium flex items-center gap-1">
                              <TickCircle size={12} variant="Bold" color="#FFFFFF" />
                              Linked
                            </span>
                          </div>

                          {/* Extract Info */}
                          <div className="mb-2">
                            <span className="text-xs font-semibold text-gray-900">
                              {extract.animeTitle}
                            </span>
                            {extract.episode && (
                              <span className="text-xs text-gray-500 ml-2">
                                Ep. {extract.episode}
                              </span>
                            )}
                          </div>

                          {extract.theme && (
                            <div
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-white mb-2"
                              style={{ backgroundColor: extract.theme.color }}
                            >
                              {extract.theme.name}
                            </div>
                          )}

                          <p className="text-xs text-gray-600 italic line-clamp-3">
                            "{extract.text}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extracts Selection */}
                {isLinkingMode && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                      Select Extracts ({selectedExtracts.length} selected)
                    </h2>

                    {extractsLoading ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[calc(100vh-500px)] overflow-y-auto pr-2">
                        {extracts.map((extract) => {
                          const isSelected = selectedExtracts.includes(extract.id);
                          const isUsed = extract.isUsedInVideo && !isSelected;
                          const isDisabled = isUsed;

                          return (
                            <div
                              key={extract.id}
                              onClick={() => !isDisabled && toggleExtractSelection(extract.id, isUsed)}
                              className={`border-2 rounded-lg p-4 transition-all ${
                                !isDisabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                              } ${
                                isSelected
                                  ? 'border-indigo-600 ring-2 ring-indigo-200 bg-indigo-50'
                                  : 'border-gray-200 hover:border-indigo-300 bg-white'
                              }`}
                            >
                              {/* Selection Indicator */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    isSelected
                                      ? 'bg-indigo-600 border-indigo-600'
                                      : isUsed
                                      ? 'border-gray-400 bg-gray-200'
                                      : 'border-gray-300'
                                  }`}>
                                    {isSelected && (
                                      <TickCircle size={16} variant="Bold" color="#FFFFFF" />
                                    )}
                                  </div>
                                  <span className={`text-xs font-medium ${
                                    isSelected ? 'text-indigo-600' : isUsed ? 'text-gray-500' : 'text-gray-500'
                                  }`}>
                                    {isSelected ? 'Selected' : isUsed ? 'Already used' : 'Click to select'}
                                  </span>
                                </div>
                                {isUsed && (
                                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                                    In use
                                  </span>
                                )}
                              </div>

                              {/* Extract Info */}
                              <div className="mb-2">
                                <span className="text-xs font-semibold text-gray-900">
                                  {extract.animeTitle}
                                </span>
                                {extract.episode && (
                                  <span className="text-xs text-gray-500 ml-2">
                                    Ep. {extract.episode}
                                  </span>
                                )}
                              </div>

                              {extract.theme && (
                                <div
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-white mb-2"
                                  style={{ backgroundColor: extract.theme.color }}
                                >
                                  {extract.theme.name}
                                </div>
                              )}

                              <p className="text-xs text-gray-600 italic line-clamp-3">
                                "{extract.text}"
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye size={32} color="#9CA3AF" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a video</h3>
                <p className="text-gray-600">
                  Choose a YouTube video from the left to link it with extracts
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ActionConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPublishedVideoToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Remove Video Link"
        message={`Are you sure you want to remove the link for "${publishedVideoToDelete?.title}"? This will free up the linked extracts but will not delete the YouTube video.`}
        type="warning"
        confirmText="Remove Link"
        cancelText="Cancel"
        loading={deleting}
      />
    </div>
  );
};

export default PublishedVideosPage;
