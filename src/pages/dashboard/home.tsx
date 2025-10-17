import React, { useState } from 'react';
import { Link } from 'react-router';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { DocumentText1, Tag, Book, VideoCircle, Edit2, TickCircle, People, Play, Eye } from 'iconsax-react';
import { useAuth } from '../../hooks/useAuth';
import { GET_YOUTUBE_CHANNEL_INFO, GET_YOUTUBE_CHANNEL_VIDEOS, GET_SETTINGS } from '../../lib/graphql/queries';
import { UPDATE_SETTINGS } from '../../lib/graphql/mutations';
import { Input } from '@/components/forms/Input';
import Button from '../../components/actions/button';
import { useToast } from '../../context/toast-context';

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

const DashboardHome: React.FC = () => {
  useAuth();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const { data: settingsData } = useQuery(GET_SETTINGS);

  const [fetchChannelInfo, { data: channelData, loading: loadingChannel }] = useLazyQuery(
    GET_YOUTUBE_CHANNEL_INFO
  );

  const [fetchChannelVideos, { data: videosData, loading: loadingVideos }] = useLazyQuery(
    GET_YOUTUBE_CHANNEL_VIDEOS
  );

  const [updateYoutubeUrl, { loading: updating }] = useMutation(UPDATE_SETTINGS, {
    onCompleted: (data) => {
      setIsEditing(false);
      if (data.updateSettings.youtubeChannelUrl) {
        const url = data.updateSettings.youtubeChannelUrl;
        fetchChannelInfo({ variables: { url } });
        fetchChannelVideos({ variables: { url, maxResults: 50 } });
        toast.success('YouTube channel saved', 'Your YouTube channel has been connected successfully');
      }
    },
    onError: (error) => {
      console.error('Error updating YouTube URL:', error);
      toast.error('Failed to save YouTube URL', error.message || 'Please check the URL and try again');
    },
  });

  // Fetch channel info and videos on mount if URL exists
  React.useEffect(() => {
    const channelUrl = settingsData?.settings?.youtubeChannelUrl;
    if (channelUrl) {
      fetchChannelInfo({ variables: { url: channelUrl } });
      fetchChannelVideos({ variables: { url: channelUrl, maxResults: 50 } });
    }
  }, [settingsData, fetchChannelInfo, fetchChannelVideos]);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) {
      toast.error('URL required', 'Please enter a YouTube channel URL');
      return;
    }
    updateYoutubeUrl({ variables: { youtubeChannelUrl: youtubeUrl } });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const channelInfo = channelData?.getYouTubeChannelInfo;
  const videos: YouTubeVideo[] = videosData?.getYouTubeChannelVideos || [];

  // Separate videos by format
  const longFormVideos = videos.filter((video) => !video.isShort);
  const shortsVideos = videos.filter((video) => video.isShort);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to your Dashboard! 👋
        </h1>
        <p className="text-gray-600">
          Manage your anime extracts for your YouTube videos
        </p>
      </div>

      {/* YouTube Channel Section */}
      <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {channelInfo && !isEditing ? (
          // Display Channel Info
          <div>
            {channelInfo.bannerUrl && (
              <div
                className="h-32 bg-cover bg-center"
                style={{ backgroundImage: `url(${channelInfo.bannerUrl})` }}
              />
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4">
                  <img
                    src={channelInfo.thumbnail}
                    alt={channelInfo.title}
                    className="w-20 h-20 rounded-full"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {channelInfo.title}
                    </h2>
                    {channelInfo.customUrl && (
                      <p className="text-sm text-gray-500 mb-2">
                        {channelInfo.customUrl}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 line-clamp-2 max-w-2xl">
                      {channelInfo.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setYoutubeUrl(settingsData?.settings?.youtubeChannelUrl || '');
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  <Edit2 size={16} variant="Bulk" color="#4F46E5" />
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <People size={20} color="#6B7280" />
                    <span className="text-sm">Subscribers</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(channelInfo.subscriberCount)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <VideoCircle size={20} color="#6B7280" />
                    <span className="text-sm">Videos</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(channelInfo.videoCount)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <VideoCircle size={20} color="#6B7280" />
                    <span className="text-sm">Total Views</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(channelInfo.viewCount)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Edit/Add YouTube URL Form
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <VideoCircle size={24} variant="Bulk" color="#DC2626" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {settingsData?.settings?.youtubeChannelUrl ? 'Edit YouTube Channel' : 'Connect YouTube Channel'}
                </h2>
                <p className="text-sm text-gray-600">
                  Add your YouTube channel URL to display channel stats
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveUrl} className="space-y-4">
              <Input
                label="YouTube Channel URL"
                type="text"
                placeholder="https://www.youtube.com/@yourchannelname"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">
                Supported formats: @username, /channel/ID, /c/username
              </p>

              <div className="flex gap-3">
                {isEditing && (
                  <Button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-all"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={updating || loadingChannel}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {updating || loadingChannel ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {loadingChannel ? 'Checking...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <TickCircle size={20} variant="Bulk" color="#FFFFFF" />
                      Save Channel
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/dashboard/extracts/new"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 group"
        >
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
            <DocumentText1 size={24} variant="Bulk" color="#4F46E5" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">Create Extract</h3>
          <p className="text-gray-600 text-sm">
            Add new anime extracts with characters and timing
          </p>
        </Link>

        <Link
          to="/dashboard/themes"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 group"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
            <Tag size={24} variant="Bulk" color="#9333EA" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">Manage Themes</h3>
          <p className="text-gray-600 text-sm">
            Organize extracts by video themes
          </p>
        </Link>

        <Link
          to="/dashboard/extracts"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 group"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
            <Book size={24} variant="Bulk" color="#16A34A" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">View Library</h3>
          <p className="text-gray-600 text-sm">
            Browse all your saved extracts
          </p>
        </Link>
      </div>

      {/* YouTube Videos Section */}
      {channelInfo && (
        <>
          {/* Long-form Videos */}
          {longFormVideos.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Play size={20} variant="Bulk" color="#DC2626" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Long-form Videos</h2>
                  <p className="text-sm text-gray-600">{longFormVideos.length} videos</p>
                </div>
              </div>

              {loadingVideos ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
                    <p className="text-gray-700 font-medium">Loading videos...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {longFormVideos.map((video) => (
                    <a
                      key={video.id}
                      href={`https://www.youtube.com/watch?v=${video.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden group"
                    >
                      <div className="relative">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full aspect-video object-cover"
                        />
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                          {formatDuration(video.durationInSeconds)}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-red-600 transition-colors">
                          {video.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Eye size={16} color="#6B7280" />
                            <span>{formatNumber(video.viewCount)}</span>
                          </div>
                          <span>{formatDate(video.publishedAt)}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Shorts */}
          {shortsVideos.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <VideoCircle size={20} variant="Bulk" color="#EC4899" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Shorts</h2>
                  <p className="text-sm text-gray-600">{shortsVideos.length} shorts</p>
                </div>
              </div>

              {loadingVideos ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mb-4"></div>
                    <p className="text-gray-700 font-medium">Loading shorts...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                  {shortsVideos.map((video) => (
                    <a
                      key={video.id}
                      href={`https://www.youtube.com/shorts/${video.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden group"
                    >
                      <div className="relative">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full aspect-[9/16] object-cover"
                        />
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                          {formatDuration(video.durationInSeconds)}
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2 group-hover:text-pink-600 transition-colors">
                          {video.title}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Eye size={14} color="#6B7280" />
                          <span>{formatNumber(video.viewCount)}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardHome;
