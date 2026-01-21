import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate, useParams } from 'react-router';
import { GET_VIDEO } from '../../../lib/graphql/queries';
import { ArrowLeft, VideoPlay, MusicCircle, Calendar, DocumentText1, Image } from 'iconsax-react';
import Button from '../../../components/actions/button';
import ThumbnailGeneratorModal from '../../../components/modals/ThumbnailGeneratorModal';
import { useTheme } from '../../../context/theme-context';
import { cn } from '../../../lib/utils';

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
  const { theme } = useTheme();
  const [showThumbnailModal, setShowThumbnailModal] = useState(false);

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
      <div className={cn(
        "min-h-screen flex items-center justify-center transition-colors duration-300",
        theme === "dark" ? "bg-[#0a0a0f]" : "bg-gray-50"
      )}>
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data?.video) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center transition-colors duration-300",
        theme === "dark" ? "bg-[#0a0a0f]" : "bg-gray-50"
      )}>
        <div className="text-center">
          <h2 className={cn(
            "text-2xl font-bold mb-4",
            theme === "dark" ? "text-white" : "text-gray-900"
          )}>
            Vidéo non trouvée
          </h2>
          <Button
            onClick={() => navigate('/dashboard/videos')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-400 hover:to-cyan-400 rounded-xl font-medium transition-all"
          >
            Retour aux Vidéos
          </Button>
        </div>
      </div>
    );
  }

  const video: Video = data.video;

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      theme === "dark" ? "bg-[#0a0a0f]" : "bg-gray-50"
    )}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard/videos')}
            className={cn(
              "flex items-center gap-2 mb-4 transition-colors",
              theme === "dark"
                ? "text-purple-400 hover:text-purple-300"
                : "text-purple-600 hover:text-purple-700"
            )}
          >
            <ArrowLeft size={20} variant="Outline" color={theme === "dark" ? "#a855f7" : "#9333ea"} />
            <span className="text-sm font-medium">Retour aux Vidéos</span>
          </button>

          <div className="bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl p-8 text-white shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <VideoPlay size={32} variant="Bold" color="#FFFFFF" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-4">{video.title}</h1>
                <div className="flex items-center gap-4 text-sm text-white/80 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} color="#FFFFFF" />
                    <span>Créé: {formatDate(video.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DocumentText1 size={16} color="#FFFFFF" />
                    <span>{video.segments.length} segment{video.segments.length !== 1 ? 's' : ''}</span>
                  </div>
                  {video.musicTracks.length > 0 && (
                    <div className="flex items-center gap-2">
                      <MusicCircle size={16} color="#FFFFFF" />
                      <span>{video.musicTracks.length} piste{video.musicTracks.length !== 1 ? 's' : ''}</span>
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
                Description
              </h2>
              <textarea
                readOnly
                value={video.description}
                className={cn(
                  "w-full p-4 rounded-lg text-sm font-mono resize-none focus:outline-none border",
                  theme === "dark"
                    ? "bg-gray-900/50 border-gray-800 text-gray-300"
                    : "bg-gray-50 border-gray-300 text-gray-700"
                )}
                rows={10}
              />
            </div>

            {/* Tags */}
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
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {video.tags.split(',').map((tag, index) => (
                  <span
                    key={index}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium",
                      theme === "dark"
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-purple-50 text-purple-700"
                    )}
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Segments */}
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
                Segments Vidéo ({video.segments.length})
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
                        className={cn(
                          "p-4 rounded-xl border-l-4",
                          theme === "dark" ? "bg-gray-900/50" : "bg-gray-50"
                        )}
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
                                    <span className={cn(
                                      "px-2 py-1 rounded text-xs font-medium",
                                      theme === "dark"
                                        ? "bg-gray-800 text-gray-400"
                                        : "bg-gray-200 text-gray-700"
                                    )}>
                                      Épisode {extract.episode}
                                    </span>
                                  )}
                                  {extract.timing && (
                                    <span className={cn(
                                      "px-2 py-1 rounded text-xs font-medium",
                                      theme === "dark"
                                        ? "bg-cyan-500/20 text-cyan-400"
                                        : "bg-blue-100 text-blue-700"
                                    )}>
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
                                  <div className={cn(
                                    "text-xs mb-2",
                                    theme === "dark" ? "text-gray-500" : "text-gray-600"
                                  )}>
                                    Personnages: {extract.characters.map((c) => c.name).join(', ')}
                                  </div>
                                )}
                              </div>
                            )}
                            <p className={cn(
                              "italic leading-relaxed",
                              theme === "dark" ? "text-gray-300" : "text-gray-900"
                            )}>
                              "{segment.text}"
                            </p>
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
                  Pistes Musicales ({video.musicTracks.length})
                </h2>
                <div className="space-y-4">
                  {video.musicTracks.map((track) => (
                    <div
                      key={track.id}
                      className={cn(
                        "p-4 rounded-xl transition-colors",
                        theme === "dark"
                          ? "bg-gray-900/50 hover:bg-gray-800/50"
                          : "bg-gray-50 hover:bg-gray-100"
                      )}
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
                          <h3 className={cn(
                            "font-semibold truncate mb-1",
                            theme === "dark" ? "text-white" : "text-gray-900"
                          )}>
                            {track.name}
                          </h3>
                          <p className={cn(
                            "text-sm truncate mb-1",
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          )}>
                            {track.artists.map((a) => a.name).join(', ')}
                          </p>
                          <p className={cn(
                            "text-xs truncate mb-2",
                            theme === "dark" ? "text-gray-500" : "text-gray-500"
                          )}>
                            {track.album.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-xs",
                              theme === "dark" ? "text-gray-500" : "text-gray-500"
                            )}>
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
                            className="inline-flex items-center gap-1 mt-2 text-xs text-green-500 hover:text-green-400 font-medium"
                          >
                            <MusicCircle size={14} color="#22c55e" />
                            Ouvrir dans Spotify
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
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
                Information
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className={cn(
                    theme === "dark" ? "text-gray-500" : "text-gray-500"
                  )}>
                    Créé:
                  </span>
                  <p className={cn(
                    "font-medium",
                    theme === "dark" ? "text-white" : "text-gray-900"
                  )}>
                    {formatDate(video.createdAt)}
                  </p>
                </div>
                <div>
                  <span className={cn(
                    theme === "dark" ? "text-gray-500" : "text-gray-500"
                  )}>
                    Dernière mise à jour:
                  </span>
                  <p className={cn(
                    "font-medium",
                    theme === "dark" ? "text-white" : "text-gray-900"
                  )}>
                    {formatDate(video.updatedAt)}
                  </p>
                </div>
                <div>
                  <span className={cn(
                    theme === "dark" ? "text-gray-500" : "text-gray-500"
                  )}>
                    Video ID:
                  </span>
                  <p className={cn(
                    "font-mono text-xs break-all",
                    theme === "dark" ? "text-gray-400" : "text-gray-700"
                  )}>
                    {video.id}
                  </p>
                </div>
              </div>

              {/* Thumbnail Generator Button */}
              <div className={cn(
                "mt-6 pt-6 border-t",
                theme === "dark" ? "border-gray-800" : "border-gray-200"
              )}>
                <Button
                  onClick={() => setShowThumbnailModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25"
                >
                  <Image size={20} variant="Bold" color="#FFFFFF" />
                  Générer la miniature
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnail Generator Modal */}
      <ThumbnailGeneratorModal
        isOpen={showThumbnailModal}
        onClose={() => setShowThumbnailModal(false)}
        videoTitle={video.title}
        segments={video.segments}
      />
    </div>
  );
};

export default VideoDetailsPage;
