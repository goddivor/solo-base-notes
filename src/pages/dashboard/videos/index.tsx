import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router';
import { GET_VIDEOS } from '../../../lib/graphql/queries';
import { DELETE_VIDEO, PUBLISH_VIDEO } from '../../../lib/graphql/mutations';
import { VideoPlay, Trash, MusicCircle, Calendar, TickCircle } from 'iconsax-react';
import Button from '../../../components/actions/button';
import ActionConfirmationModal from '../../../components/modals/ActionConfirmationModal';
import { useToast } from '../../../context/toast-context';

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
      toast.success('Video deleted', 'The video has been deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video', error.message || 'Please try again');
    },
  });

  const [publishVideo, { loading: publishing }] = useMutation(PUBLISH_VIDEO, {
    onCompleted: () => {
      refetch();
      setShowPublishModal(false);
      setVideoToPublish(null);
      setYoutubeVideoId('');
      toast.success('Video published!', 'The video has been marked as published');
    },
    onError: (error) => {
      console.error('Error publishing video:', error);
      toast.error('Failed to publish video', error.message || 'Please try again');
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
      toast.error('YouTube Video ID required', 'Please enter a YouTube video ID');
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Videos</h1>
          <p className="text-gray-600">
            All your saved video projects
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && videos.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <VideoPlay size={32} color="#9CA3AF" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No videos yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first video from your extracts collection
              </p>
              <Button
                onClick={() => navigate('/dashboard/extracts')}
                className="px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium transition-all"
              >
                Go to Extracts
              </Button>
            </div>
          </div>
        )}

        {/* Videos Grid */}
        {!loading && videos.length > 0 && (
          <div>
            <div className="mb-4 text-sm text-gray-600">
              {videos.length} video{videos.length > 1 ? 's' : ''} found
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => navigate(`/dashboard/videos/${video.id}`)}
                  className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden transition-all hover:shadow-lg hover:border-indigo-300 cursor-pointer"
                >
                  {/* Header with Gradient */}
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
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
                              Published
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
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {video.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <VideoPlay size={14} color="#6B7280" />
                        <span>{video.segments.length} segment{video.segments.length !== 1 ? 's' : ''}</span>
                      </div>
                      {video.musicTracks.length > 0 && (
                        <div className="flex items-center gap-1">
                          <MusicCircle size={14} color="#6B7280" />
                          <span>{video.musicTracks.length} track{video.musicTracks.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {video.tags.split(',').slice(0, 4).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                        {video.tags.split(',').length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            +{video.tags.split(',').length - 4}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex gap-2">
                        {!video.isPublished && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePublishClick(video.id, video.title);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            <TickCircle size={16} variant="Bulk" color="#10B981" />
                            Publish
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(video.id, video.title);
                          }}
                          className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors ${
                            video.isPublished ? 'w-full' : 'flex-1'
                          }`}
                        >
                          <Trash size={16} variant="Bulk" color="#DC2626" />
                          Delete
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
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">Publish Video</h2>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Enter the YouTube video ID to mark "{videoToPublish?.title}" as published.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube Video ID *
                </label>
                <input
                  type="text"
                  value={youtubeVideoId}
                  onChange={(e) => setYoutubeVideoId(e.target.value)}
                  placeholder="e.g., dQw4w9WgXcQ"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The video ID can be found in the YouTube URL: youtube.com/watch?v=<strong>VIDEO_ID</strong>
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    setShowPublishModal(false);
                    setVideoToPublish(null);
                    setYoutubeVideoId('');
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-all"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmPublish}
                  disabled={publishing || !youtubeVideoId.trim()}
                  className="flex-1 px-4 py-3 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {publishing ? 'Publishing...' : 'Publish'}
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
        title="Delete Video"
        message={`Are you sure you want to delete "${videoToDelete?.title}"? This action cannot be undone.`}
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleting}
      />
    </div>
  );
};

export default VideosPage;
