import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router';
import { GET_VIDEOS } from '../../../lib/graphql/queries';
import { DELETE_VIDEO, PUBLISH_VIDEO } from '../../../lib/graphql/mutations';
import { VideoPlay, Trash, MusicCircle, Calendar, TickCircle } from 'iconsax-react';
import Button from '../../../components/actions/button';
import ActionConfirmationModal from '../../../components/modals/ActionConfirmationModal';
import { useToast } from '../../../context/toast-context';
import { useTheme } from '../../../context/theme-context';
import { cn } from '../../../lib/utils';

interface VideoSegment {
  extractId: string;
  text: string;
  order: number;
}

interface SpotifyArtist {
  id: string;
  name: string;
}

interface SpotifyAlbum {
  id: string;
  name: string;
  image: string | null;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration: number;
  previewUrl: string | null;
  spotifyUrl: string;
  uri: string;
}

interface Video {
  id: string;
  title: string;
  description: string;
  tags: string;
  segments: VideoSegment[];
  musicTracks: SpotifyTrack[];
  isPublished: boolean;
  youtubeVideoId: string | null;
  createdAt: string;
  updatedAt: string;
}

const VideosPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { theme } = useTheme();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<{ id: string; title: string } | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [videoToPublish, setVideoToPublish] = useState<{ id: string; title: string } | null>(null);
  const [youtubeVideoId, setYoutubeVideoId] = useState('');

  const { data, loading, refetch } = useQuery(GET_VIDEOS);

  const [deleteVideo, { loading: deleting }] = useMutation(DELETE_VIDEO, {
    onCompleted: () => {
      refetch();
      setShowDeleteModal(false);
      setVideoToDelete(null);
      toast.success('Vidéo supprimée', 'La vidéo a été supprimée avec succès');
    },
    onError: (error) => {
      console.error('Error deleting video:', error);
      toast.error('Échec de la suppression', error.message || 'Veuillez réessayer');
    },
  });

  const [publishVideo, { loading: publishing }] = useMutation(PUBLISH_VIDEO, {
    onCompleted: () => {
      refetch();
      setShowPublishModal(false);
      setVideoToPublish(null);
      setYoutubeVideoId('');
      toast.success('Vidéo publiée !', 'La vidéo a été marquée comme publiée');
    },
    onError: (error) => {
      console.error('Error publishing video:', error);
      toast.error('Échec de la publication', error.message || 'Veuillez réessayer');
    },
  });

  const handleDeleteClick = (id: string, title: string) => {
    setVideoToDelete({ id, title });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (videoToDelete) {
      deleteVideo({ variables: { id: videoToDelete.id } });
    }
  };

  const handlePublishClick = (id: string, title: string) => {
    setVideoToPublish({ id, title });
    setYoutubeVideoId('');
    setShowPublishModal(true);
  };

  const handleConfirmPublish = () => {
    if (videoToPublish && youtubeVideoId.trim()) {
      publishVideo({ variables: { id: videoToPublish.id, youtubeVideoId: youtubeVideoId.trim() } });
    } else {
      toast.error('ID YouTube requis', 'Veuillez entrer un ID de vidéo YouTube');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(parseInt(dateString));
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const videos: Video[] = data?.videos || [];

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
            Mes Vidéos
          </h1>
          <p className={cn(
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          )}>
            Tous vos projets vidéo sauvegardés
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && videos.length === 0 && (
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
                <VideoPlay size={32} color={theme === "dark" ? "#6b7280" : "#9CA3AF"} />
              </div>
              <h3 className={cn(
                "text-lg font-semibold mb-2",
                theme === "dark" ? "text-white" : "text-gray-900"
              )}>
                Aucune vidéo
              </h3>
              <p className={cn(
                "mb-6",
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              )}>
                Créez votre première vidéo à partir de vos extraits
              </p>
              <Button
                onClick={() => navigate('/dashboard/extracts')}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-400 hover:to-cyan-400 rounded-xl font-medium transition-all"
              >
                Aller aux Extraits
              </Button>
            </div>
          </div>
        )}

        {/* Videos Grid */}
        {!loading && videos.length > 0 && (
          <div>
            <div className={cn(
              "mb-4 text-sm",
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}>
              {videos.length} vidéo{videos.length > 1 ? 's' : ''} trouvée{videos.length > 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => navigate(`/dashboard/videos/${video.id}`)}
                  className={cn(
                    "rounded-2xl border-2 overflow-hidden transition-all cursor-pointer",
                    theme === "dark"
                      ? "bg-[#12121a] border-gray-800 hover:border-purple-500/50"
                      : "bg-white border-gray-200 hover:shadow-lg hover:border-purple-300"
                  )}
                >
                  {/* Header with Gradient */}
                  <div className="bg-gradient-to-r from-purple-600 to-cyan-600 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                        <VideoPlay size={24} variant="Bold" color="#FFFFFF" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-lg font-bold text-white line-clamp-2 flex-1">
                            {video.title}
                          </h3>
                          {video.isPublished && (
                            <span className="flex-shrink-0 px-2 py-1 bg-green-500 text-white rounded text-xs font-medium flex items-center gap-1">
                              <TickCircle size={12} variant="Bold" color="#FFFFFF" />
                              Publié
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/80">
                          <Calendar size={14} color="#FFFFFF" />
                          <span>{formatDate(video.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    {/* Description */}
                    <p className={cn(
                      "text-sm line-clamp-3 mb-4",
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    )}>
                      {video.description}
                    </p>

                    {/* Stats */}
                    <div className={cn(
                      "flex items-center gap-4 mb-4 text-xs",
                      theme === "dark" ? "text-gray-500" : "text-gray-500"
                    )}>
                      <div className="flex items-center gap-1">
                        <VideoPlay size={14} color={theme === "dark" ? "#6b7280" : "#6B7280"} />
                        <span>{video.segments.length} segment{video.segments.length !== 1 ? 's' : ''}</span>
                      </div>
                      {video.musicTracks.length > 0 && (
                        <div className="flex items-center gap-1">
                          <MusicCircle size={14} color={theme === "dark" ? "#6b7280" : "#6B7280"} />
                          <span>{video.musicTracks.length} piste{video.musicTracks.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {video.tags.split(',').slice(0, 4).map((tag, index) => (
                          <span
                            key={index}
                            className={cn(
                              "px-2 py-1 rounded text-xs",
                              theme === "dark"
                                ? "bg-gray-800 text-gray-400"
                                : "bg-gray-100 text-gray-700"
                            )}
                          >
                            {tag.trim()}
                          </span>
                        ))}
                        {video.tags.split(',').length > 4 && (
                          <span className={cn(
                            "px-2 py-1 rounded text-xs",
                            theme === "dark"
                              ? "bg-gray-800 text-gray-500"
                              : "bg-gray-100 text-gray-600"
                          )}>
                            +{video.tags.split(',').length - 4}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={cn(
                      "pt-4 border-t",
                      theme === "dark" ? "border-gray-800" : "border-gray-200"
                    )}>
                      <div className="flex gap-2">
                        {!video.isPublished && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePublishClick(video.id, video.title);
                            }}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                              theme === "dark"
                                ? "text-green-400 bg-green-500/10 hover:bg-green-500/20"
                                : "text-green-600 bg-green-50 hover:bg-green-100"
                            )}
                          >
                            <TickCircle size={16} variant="Bulk" color={theme === "dark" ? "#4ade80" : "#10B981"} />
                            Publier
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(video.id, video.title);
                          }}
                          className={cn(
                            "flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                            theme === "dark"
                              ? "text-red-400 bg-red-500/10 hover:bg-red-500/20"
                              : "text-red-600 bg-red-50 hover:bg-red-100",
                            video.isPublished ? 'w-full' : 'flex-1'
                          )}
                        >
                          <Trash size={16} variant="Bulk" color={theme === "dark" ? "#f87171" : "#DC2626"} />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={cn(
            "rounded-2xl shadow-2xl max-w-md w-full",
            theme === "dark" ? "bg-[#12121a]" : "bg-white"
          )}>
            <div className={cn(
              "sticky top-0 border-b px-6 py-4",
              theme === "dark"
                ? "bg-[#12121a] border-gray-800"
                : "bg-white border-gray-200"
            )}>
              <h2 className={cn(
                "text-xl font-bold",
                theme === "dark" ? "text-white" : "text-gray-900"
              )}>
                Publier la Vidéo
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <p className={cn(
                "text-sm mb-4",
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              )}>
                Entrez l'ID de la vidéo YouTube pour marquer "{videoToPublish?.title}" comme publiée.
              </p>

              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2",
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                )}>
                  ID de la Vidéo YouTube *
                </label>
                <input
                  type="text"
                  value={youtubeVideoId}
                  onChange={(e) => setYoutubeVideoId(e.target.value)}
                  placeholder="ex: dQw4w9WgXcQ"
                  className={cn(
                    "w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-purple-500",
                    theme === "dark"
                      ? "bg-gray-900/50 border-gray-800 text-white placeholder-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  )}
                />
                <p className={cn(
                  "text-xs mt-1",
                  theme === "dark" ? "text-gray-500" : "text-gray-500"
                )}>
                  L'ID se trouve dans l'URL YouTube: youtube.com/watch?v=<strong>VIDEO_ID</strong>
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    setShowPublishModal(false);
                    setVideoToPublish(null);
                    setYoutubeVideoId('');
                  }}
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
                  onClick={handleConfirmPublish}
                  disabled={publishing || !youtubeVideoId.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-400 hover:to-emerald-400 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {publishing ? 'Publication...' : 'Publier'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ActionConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setVideoToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer la Vidéo"
        message={`Êtes-vous sûr de vouloir supprimer "${videoToDelete?.title}" ? Cette action est irréversible.`}
        type="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
        loading={deleting}
      />
    </div>
  );
};

export default VideosPage;
