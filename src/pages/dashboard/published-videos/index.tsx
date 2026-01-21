import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_YOUTUBE_CHANNEL_VIDEOS, GET_EXTRACTS, GET_PUBLISHED_VIDEO_BY_YOUTUBE_ID, GET_SETTINGS } from '../../../lib/graphql/queries';
import { LINK_PUBLISHED_VIDEO, UPDATE_PUBLISHED_VIDEO, DELETE_PUBLISHED_VIDEO } from '../../../lib/graphql/mutations';
import { Add, Trash, TickCircle, CloseCircle, Eye } from 'iconsax-react';
import Button from '../../../components/actions/button';
import ActionConfirmationModal from '../../../components/modals/ActionConfirmationModal';
import { useToast } from '../../../context/toast-context';
import { useTheme } from '../../../context/theme-context';
import { cn } from '../../../lib/utils';

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
  const { theme } = useTheme();
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
      toast.success('Vidéo liée !', 'La vidéo YouTube a été liée aux extraits avec succès');
      refetchExtracts();
      refetchPublished();
      setIsLinkingMode(false);
      setSelectedExtracts([]);
    },
    onError: (error) => {
      console.error('Error linking video:', error);
      toast.error('Échec du lien', error.message || 'Veuillez réessayer');
    },
  });

  const [updatePublishedVideo, { loading: updating }] = useMutation(UPDATE_PUBLISHED_VIDEO, {
    onCompleted: () => {
      toast.success('Vidéo mise à jour !', 'Les extraits liés ont été mis à jour');
      refetchExtracts();
      refetchPublished();
      setIsLinkingMode(false);
      setSelectedExtracts([]);
    },
    onError: (error) => {
      console.error('Error updating video:', error);
      toast.error('Échec de la mise à jour', error.message || 'Veuillez réessayer');
    },
  });

  const [deletePublishedVideo, { loading: deleting }] = useMutation(DELETE_PUBLISHED_VIDEO, {
    onCompleted: () => {
      toast.success('Lien supprimé !', 'Le lien vidéo a été supprimé');
      refetchExtracts();
      refetchPublished();
      setShowDeleteModal(false);
      setPublishedVideoToDelete(null);
    },
    onError: (error) => {
      console.error('Error deleting published video:', error);
      toast.error('Échec de la suppression', error.message || 'Veuillez réessayer');
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
      toast.error('Extrait déjà utilisé', 'Cet extrait est déjà utilisé dans une autre vidéo');
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
      toast.error('Aucune vidéo sélectionnée', 'Veuillez sélectionner une vidéo YouTube');
      return;
    }

    if (selectedExtracts.length === 0) {
      toast.error('Aucun extrait sélectionné', 'Veuillez sélectionner au moins un extrait');
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
      <div className={cn(
        "min-h-screen flex items-center justify-center transition-colors duration-300",
        theme === "dark" ? "bg-[#0a0a0f]" : "bg-gray-50"
      )}>
        <div className="text-center max-w-md">
          <h2 className={cn(
            "text-2xl font-bold mb-4",
            theme === "dark" ? "text-white" : "text-gray-900"
          )}>
            Aucune chaîne YouTube configurée
          </h2>
          <p className={cn(
            "mb-6",
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          )}>
            Veuillez configurer l'URL de votre chaîne YouTube dans les paramètres avant de lier des vidéos aux extraits.
          </p>
          <Button
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-400 hover:to-cyan-400 rounded-xl font-medium transition-all"
          >
            Aller au Dashboard
          </Button>
        </div>
      </div>
    );
  }

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
            Lier Vidéos YouTube aux Extraits
          </h1>
          <p className={cn(
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          )}>
            Sélectionnez une vidéo YouTube publiée et liez-la aux extraits utilisés
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - YouTube Videos */}
          <div className="lg:col-span-1">
            <div className={cn(
              "rounded-2xl border-2 p-6",
              theme === "dark"
                ? "bg-[#12121a] border-gray-800"
                : "bg-white border-gray-200"
            )}>
              <h2 className={cn(
                "text-lg font-bold mb-4",
                theme === "dark" ? "text-white" : "text-gray-900"
              )}>
                Vidéos YouTube
              </h2>

              {ytLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                  {youtubeVideos.filter(v => !v.isShort).map((video) => (
                    <div
                      key={video.id}
                      onClick={() => handleVideoSelect(video)}
                      className={cn(
                        "cursor-pointer rounded-xl border-2 overflow-hidden transition-all",
                        selectedVideo?.id === video.id
                          ? "border-purple-500 ring-2 ring-purple-500/30"
                          : theme === "dark"
                            ? "border-gray-800 hover:border-purple-500/50"
                            : "border-gray-200 hover:border-purple-300"
                      )}
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className={cn(
                        "p-3",
                        theme === "dark" ? "bg-[#12121a]" : "bg-white"
                      )}>
                        <h3 className={cn(
                          "text-sm font-semibold line-clamp-2 mb-2",
                          theme === "dark" ? "text-white" : "text-gray-900"
                        )}>
                          {video.title}
                        </h3>
                        <div className={cn(
                          "flex items-center gap-3 text-xs",
                          theme === "dark" ? "text-gray-500" : "text-gray-500"
                        )}>
                          <span>{formatNumber(video.viewCount)} vues</span>
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
                <div className={cn(
                  "rounded-2xl border-2 p-6",
                  theme === "dark"
                    ? "bg-[#12121a] border-gray-800"
                    : "bg-white border-gray-200"
                )}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className={cn(
                        "text-xl font-bold mb-2",
                        theme === "dark" ? "text-white" : "text-gray-900"
                      )}>
                        {selectedVideo.title}
                      </h2>
                      <div className={cn(
                        "flex items-center gap-4 text-sm mb-3",
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      )}>
                        <span>{formatNumber(selectedVideo.viewCount)} vues</span>
                        <span>{formatNumber(selectedVideo.likeCount)} likes</span>
                        <span>{selectedVideo.duration}</span>
                      </div>
                      {publishedVideo && !isLinkingMode && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium",
                            theme === "dark"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-green-100 text-green-700"
                          )}>
                            Lié à {publishedVideo.extractIds.length} extrait{publishedVideo.extractIds.length !== 1 ? 's' : ''}
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
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                            theme === "dark"
                              ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          )}
                        >
                          <CloseCircle size={20} variant="Bulk" color={theme === "dark" ? "#d1d5db" : "#374151"} />
                          Annuler
                        </Button>
                        <Button
                          onClick={handleSaveLink}
                          disabled={linking || updating || selectedExtracts.length === 0}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-400 hover:to-emerald-400 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {linking || updating ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Sauvegarde...
                            </>
                          ) : (
                            <>
                              <TickCircle size={20} variant="Bulk" color="#FFFFFF" />
                              Sauvegarder ({selectedExtracts.length})
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <>
                        {publishedVideo && (
                          <Button
                            onClick={() => handleDeleteClick(publishedVideo.id, selectedVideo.title)}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                              theme === "dark"
                                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                : "bg-red-600 text-white hover:bg-red-700"
                            )}
                          >
                            <Trash size={20} variant="Bulk" color={theme === "dark" ? "#f87171" : "#FFFFFF"} />
                            Supprimer le lien
                          </Button>
                        )}
                        <Button
                          onClick={handleStartLinking}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-400 hover:to-cyan-400 rounded-lg font-medium transition-all"
                        >
                          <Add size={20} variant="Bulk" color="#FFFFFF" />
                          {publishedVideo ? 'Modifier les extraits' : 'Lier des extraits'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Linked Extracts Display */}
                {publishedVideo && !isLinkingMode && publishedVideo.extracts && publishedVideo.extracts.length > 0 && (
                  <div className={cn(
                    "rounded-2xl border-2 p-6",
                    theme === "dark"
                      ? "bg-[#12121a] border-gray-800"
                      : "bg-white border-gray-200"
                  )}>
                    <h2 className={cn(
                      "text-lg font-bold mb-4",
                      theme === "dark" ? "text-white" : "text-gray-900"
                    )}>
                      Extraits liés ({publishedVideo.extracts.length})
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[calc(100vh-500px)] overflow-y-auto pr-2">
                      {publishedVideo.extracts.map((extract) => (
                        <div
                          key={extract.id}
                          className={cn(
                            "border-2 rounded-xl p-4",
                            theme === "dark"
                              ? "border-green-500/30 bg-green-500/10"
                              : "border-green-200 bg-green-50"
                          )}
                        >
                          {/* Linked Badge */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="px-2 py-1 bg-green-600 text-white rounded text-xs font-medium flex items-center gap-1">
                              <TickCircle size={12} variant="Bold" color="#FFFFFF" />
                              Lié
                            </span>
                          </div>

                          {/* Extract Info */}
                          <div className="mb-2">
                            <span className={cn(
                              "text-xs font-semibold",
                              theme === "dark" ? "text-white" : "text-gray-900"
                            )}>
                              {extract.animeTitle}
                            </span>
                            {extract.episode && (
                              <span className={cn(
                                "text-xs ml-2",
                                theme === "dark" ? "text-gray-500" : "text-gray-500"
                              )}>
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

                          <p className={cn(
                            "text-xs italic line-clamp-3",
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          )}>
                            "{extract.text}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extracts Selection */}
                {isLinkingMode && (
                  <div className={cn(
                    "rounded-2xl border-2 p-6",
                    theme === "dark"
                      ? "bg-[#12121a] border-gray-800"
                      : "bg-white border-gray-200"
                  )}>
                    <h2 className={cn(
                      "text-lg font-bold mb-4",
                      theme === "dark" ? "text-white" : "text-gray-900"
                    )}>
                      Sélectionner les extraits ({selectedExtracts.length} sélectionné{selectedExtracts.length !== 1 ? 's' : ''})
                    </h2>

                    {extractsLoading ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
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
                              className={cn(
                                "border-2 rounded-xl p-4 transition-all",
                                !isDisabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
                                isSelected
                                  ? "border-purple-500 ring-2 ring-purple-500/30"
                                  : theme === "dark"
                                    ? "border-gray-800 hover:border-purple-500/50"
                                    : "border-gray-200 hover:border-purple-300",
                                isSelected
                                  ? theme === "dark" ? "bg-purple-500/10" : "bg-purple-50"
                                  : theme === "dark" ? "bg-[#12121a]" : "bg-white"
                              )}
                            >
                              {/* Selection Indicator */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className={cn(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                                    isSelected
                                      ? "bg-purple-600 border-purple-600"
                                      : isUsed
                                        ? theme === "dark" ? "border-gray-600 bg-gray-700" : "border-gray-400 bg-gray-200"
                                        : theme === "dark" ? "border-gray-600" : "border-gray-300"
                                  )}>
                                    {isSelected && (
                                      <TickCircle size={16} variant="Bold" color="#FFFFFF" />
                                    )}
                                  </div>
                                  <span className={cn(
                                    "text-xs font-medium",
                                    isSelected
                                      ? "text-purple-500"
                                      : theme === "dark" ? "text-gray-500" : "text-gray-500"
                                  )}>
                                    {isSelected ? 'Sélectionné' : isUsed ? 'Déjà utilisé' : 'Cliquer pour sélectionner'}
                                  </span>
                                </div>
                                {isUsed && (
                                  <span className={cn(
                                    "px-2 py-1 rounded text-xs font-medium",
                                    theme === "dark"
                                      ? "bg-orange-500/20 text-orange-400"
                                      : "bg-orange-100 text-orange-700"
                                  )}>
                                    En cours
                                  </span>
                                )}
                              </div>

                              {/* Extract Info */}
                              <div className="mb-2">
                                <span className={cn(
                                  "text-xs font-semibold",
                                  theme === "dark" ? "text-white" : "text-gray-900"
                                )}>
                                  {extract.animeTitle}
                                </span>
                                {extract.episode && (
                                  <span className={cn(
                                    "text-xs ml-2",
                                    theme === "dark" ? "text-gray-500" : "text-gray-500"
                                  )}>
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

                              <p className={cn(
                                "text-xs italic line-clamp-3",
                                theme === "dark" ? "text-gray-400" : "text-gray-600"
                              )}>
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
              <div className={cn(
                "rounded-2xl border-2 p-12 text-center",
                theme === "dark"
                  ? "bg-[#12121a] border-gray-800"
                  : "bg-white border-gray-200"
              )}>
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                  theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                )}>
                  <Eye size={32} color={theme === "dark" ? "#6b7280" : "#9CA3AF"} />
                </div>
                <h3 className={cn(
                  "text-lg font-semibold mb-2",
                  theme === "dark" ? "text-white" : "text-gray-900"
                )}>
                  Sélectionnez une vidéo
                </h3>
                <p className={cn(
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                )}>
                  Choisissez une vidéo YouTube à gauche pour la lier avec des extraits
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
        title="Supprimer le lien vidéo"
        message={`Êtes-vous sûr de vouloir supprimer le lien pour "${publishedVideoToDelete?.title}" ? Cela libérera les extraits liés mais ne supprimera pas la vidéo YouTube.`}
        type="warning"
        confirmText="Supprimer le lien"
        cancelText="Annuler"
        loading={deleting}
      />
    </div>
  );
};

export default PublishedVideosPage;
