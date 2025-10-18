import React from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate, useParams } from 'react-router';
import { GET_VIDEO } from '../../../lib/graphql/queries';
import { ArrowLeft, VideoPlay, MusicCircle, Calendar, DocumentText1 } from 'iconsax-react';
import Button from '../../../components/actions/button';

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
  animeId: number;
  animeTitle: string;
  animeImage?: string;
  episode?: number;
  season?: number;
  timing: {
    start: string;
    end: string;
  };
  characters: Character[];
  theme?: Theme;
}

interface VideoSegment {
  extractId: string;
  text: string;
  order: number;
  extract?: Extract;
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
  createdAt: string;
  updatedAt: string;
}

const VideoDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data, loading } = useQuery(GET_VIDEO, {
    variables: { id },
    skip: !id,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(parseInt(dateString));
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Generate consistent color for each anime
  const getAnimeColor = (animeId: number): string => {
    const colors = [
      '#EF4444', // red-500
      '#F59E0B', // amber-500
      '#10B981', // emerald-500
      '#3B82F6', // blue-500
      '#8B5CF6', // violet-500
      '#EC4899', // pink-500
      '#14B8A6', // teal-500
      '#F97316', // orange-500
      '#06B6D4', // cyan-500
      '#A855F7', // purple-500
    ];
    return colors[animeId % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data?.video) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Video not found</h2>
          <Button
            onClick={() => navigate('/dashboard/videos')}
            className="px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium transition-all"
          >
            Back to Videos
          </Button>
        </div>
      </div>
    );
  }

  const video: Video = data.video;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard/videos')}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4 transition-colors"
          >
            <ArrowLeft size={20} variant="Outline" color="#4F46E5" />
            <span className="text-sm font-medium">Back to Videos</span>
          </button>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <VideoPlay size={32} variant="Bold" color="#FFFFFF" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-4">{video.title}</h1>
                <div className="flex items-center gap-4 text-sm text-white/80 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} color="#FFFFFF" />
                    <span>Created: {formatDate(video.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DocumentText1 size={16} color="#FFFFFF" />
                    <span>{video.segments.length} segment{video.segments.length !== 1 ? 's' : ''}</span>
                  </div>
                  {video.musicTracks.length > 0 && (
                    <div className="flex items-center gap-2">
                      <MusicCircle size={16} color="#FFFFFF" />
                      <span>{video.musicTracks.length} track{video.musicTracks.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Description & Segments */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Description</h2>
              <textarea
                readOnly
                value={video.description}
                className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm font-mono resize-none focus:outline-none"
                rows={10}
              />
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {video.tags.split(',').map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Segments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Video Segments ({video.segments.length})
              </h2>
              <div className="space-y-4">
                {[...video.segments]
                  .sort((a, b) => a.order - b.order)
                  .map((segment, index) => {
                    const extract = segment.extract;
                    const animeColor = extract ? getAnimeColor(extract.animeId) : '#6366F1';

                    return (
                      <div
                        key={segment.extractId}
                        className="p-4 bg-gray-50 rounded-lg border-l-4"
                        style={{ borderLeftColor: animeColor }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: animeColor }}
                          >
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            {extract && (
                              <div className="mb-3">
                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                  <span
                                    className="px-2 py-1 rounded text-xs font-bold text-white"
                                    style={{ backgroundColor: animeColor }}
                                  >
                                    {extract.animeTitle}
                                  </span>
                                  {extract.episode && (
                                    <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">
                                      Épisode {extract.episode}
                                    </span>
                                  )}
                                  {extract.timing && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                      {extract.timing.start} - {extract.timing.end}
                                    </span>
                                  )}
                                  {extract.theme && (
                                    <span
                                      className="px-2 py-1 rounded text-xs font-medium text-white"
                                      style={{ backgroundColor: extract.theme.color }}
                                    >
                                      {extract.theme.name}
                                    </span>
                                  )}
                                </div>
                                {extract.characters && extract.characters.length > 0 && (
                                  <div className="text-xs text-gray-600 mb-2">
                                    Personnages: {extract.characters.map((c) => c.name).join(', ')}
                                  </div>
                                )}
                              </div>
                            )}
                            <p className="text-gray-900 italic leading-relaxed">"{segment.text}"</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Right Column - Music Tracks */}
          <div className="space-y-6">
            {video.musicTracks.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Music Tracks ({video.musicTracks.length})
                </h2>
                <div className="space-y-4">
                  {video.musicTracks.map((track) => (
                    <div
                      key={track.id}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex gap-3">
                        {track.album.image && (
                          <img
                            src={track.album.image}
                            alt={track.album.name}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate mb-1">
                            {track.name}
                          </h3>
                          <p className="text-sm text-gray-600 truncate mb-1">
                            {track.artists.map((a) => a.name).join(', ')}
                          </p>
                          <p className="text-xs text-gray-500 truncate mb-2">
                            {track.album.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {formatDuration(track.duration)}
                            </span>
                            {track.previewUrl && (
                              <audio
                                controls
                                className="h-8"
                                style={{ width: '100%', maxWidth: '200px' }}
                              >
                                <source src={track.previewUrl} type="audio/mpeg" />
                              </audio>
                            )}
                          </div>
                          <a
                            href={track.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-2 text-xs text-green-600 hover:text-green-700 font-medium"
                          >
                            <MusicCircle size={14} color="#16A34A" />
                            Open in Spotify
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Information</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Created:</span>
                  <p className="font-medium text-gray-900">{formatDate(video.createdAt)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>
                  <p className="font-medium text-gray-900">{formatDate(video.updatedAt)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Video ID:</span>
                  <p className="font-mono text-xs text-gray-700 break-all">{video.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetailsPage;
