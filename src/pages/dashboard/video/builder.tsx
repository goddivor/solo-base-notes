import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useQuery, useMutation } from '@apollo/client';
import { GET_EXTRACTS } from '../../../lib/graphql/queries';
import { CREATE_VIDEO } from '../../../lib/graphql/mutations';
import { ArrowLeft, Add, Trash, ArrowUp, ArrowDown, Edit2, TickCircle, MusicCircle, DocumentUpload } from 'iconsax-react';
import Button from '../../../components/actions/button';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import SpotifyTrackSearch from '../../../components/SpotifyTrackSearch';
import ActionConfirmationModal from '../../../components/modals/ActionConfirmationModal';
import { useToast } from '../../../context/toast-context';
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

interface VideoSegment {
  id: string;
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

const VideoBuilder: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { theme } = useTheme();
  const extractIds = (location.state as { extractIds?: string[] })?.extractIds || [];

  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoTags, setVideoTags] = useState('');
  const [videoSegments, setVideoSegments] = useState<VideoSegment[]>([]);
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [selectedTracks, setSelectedTracks] = useState<SpotifyTrack[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [userEditedTitle, setUserEditedTitle] = useState(false);
  const [userEditedDescription, setUserEditedDescription] = useState(false);
  const [userEditedTags, setUserEditedTags] = useState(false);

  const { data, loading } = useQuery(GET_EXTRACTS);

  const [createVideo, { loading: saving }] = useMutation(CREATE_VIDEO, {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onCompleted: (_data) => {
      toast.success('Vidéo sauvegardée !', 'Votre vidéo a été sauvegardée avec succès');
      navigate('/dashboard/videos');
    },
    onError: (error) => {
      console.error('Error saving video:', error);
      toast.error('Échec de la sauvegarde', error.message || 'Veuillez réessayer');
    },
  });

  const allExtracts: Extract[] = data?.extracts || [];
  const selectedExtracts = allExtracts.filter((extract) => extractIds.includes(extract.id));

  // Generate video title
  useEffect(() => {
    if (selectedExtracts.length > 0 && !userEditedTitle) {
      const themeObj = selectedExtracts[0].theme;
      const animes = [...new Set(selectedExtracts.map((e) => e.animeTitle))];

      if (themeObj) {
        const animeTitles = animes.join(' x ');
        const title = `${themeObj.name.toUpperCase()} !! - Citation VF ${animeTitles}`;
        setVideoTitle(title);
      }
    }
  }, [selectedExtracts, userEditedTitle]);

  // Generate video description
  useEffect(() => {
    if (selectedExtracts.length > 0 && !userEditedDescription) {
      let description = 'Extraits d\'anime:\n\n';

      selectedExtracts.forEach((extract, index) => {
        description += `${index + 1}. ${extract.animeTitle}`;
        if (extract.episode) {
          description += ` - Épisode ${extract.episode}`;
        }
        description += '\n';

        if (extract.characters.length > 0) {
          const charNames = extract.characters.map((c) => c.name).join(', ');
          description += `   Personnages: ${charNames}\n`;
        }

        description += `   Timing: ${extract.timing.start} - ${extract.timing.end}\n\n`;
      });

      description += '\n#anime #citation #vf';

      setVideoDescription(description);
    }
  }, [selectedExtracts, userEditedDescription]);

  // Generate video tags
  useEffect(() => {
    if (selectedExtracts.length > 0 && !userEditedTags) {
      const themeObj = selectedExtracts[0].theme;
      const animes = [...new Set(selectedExtracts.map((e) => e.animeTitle))];

      const tags = [
        'anime',
        'citation',
        'vf',
        ...(themeObj ? [themeObj.name.toLowerCase()] : []),
        ...animes.map((a) => a.toLowerCase().replace(/\s+/g, ''))
      ];

      setVideoTags(tags.join(', '));
    }
  }, [selectedExtracts, userEditedTags]);

  // Initialize video segments
  useEffect(() => {
    if (selectedExtracts.length > 0 && videoSegments.length === 0) {
      const initialSegments = selectedExtracts.map((extract, index) => ({
        id: `segment-${Date.now()}-${index}`,
        extractId: extract.id,
        text: extract.text,
        order: index,
      }));
      setVideoSegments(initialSegments);
    }
  }, [selectedExtracts, videoSegments.length]);

  const handleAddSegment = (extractId: string, text: string) => {
    const newSegment: VideoSegment = {
      id: `segment-${Date.now()}`,
      extractId,
      text,
      order: videoSegments.length,
    };
    setVideoSegments([...videoSegments, newSegment]);
  };

  const handleRemoveSegment = (segmentId: string) => {
    const filtered = videoSegments.filter((s) => s.id !== segmentId);
    const reordered = filtered.map((s, index) => ({ ...s, order: index }));
    setVideoSegments(reordered);
  };

  const handleMoveSegment = (segmentId: string, direction: 'up' | 'down') => {
    const index = videoSegments.findIndex((s) => s.id === segmentId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= videoSegments.length) return;

    const newSegments = [...videoSegments];
    [newSegments[index], newSegments[newIndex]] = [newSegments[newIndex], newSegments[index]];

    const reordered = newSegments.map((s, i) => ({ ...s, order: i }));
    setVideoSegments(reordered);
  };

  const handleEditSegment = (segmentId: string, text: string) => {
    setEditingSegmentId(segmentId);
    setEditingText(text);
  };

  const handleSaveSegmentEdit = () => {
    if (editingSegmentId) {
      const updated = videoSegments.map((s) =>
        s.id === editingSegmentId ? { ...s, text: editingText } : s
      );
      setVideoSegments(updated);
      setEditingSegmentId(null);
      setEditingText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingSegmentId(null);
    setEditingText('');
  };

  const handleSelectTrack = (track: SpotifyTrack) => {
    if (!selectedTracks.find((t) => t.id === track.id)) {
      setSelectedTracks([...selectedTracks, track]);
    }
  };

  const handleRemoveTrack = (trackId: string) => {
    setSelectedTracks(selectedTracks.filter((t) => t.id !== trackId));
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSaveVideoClick = () => {
    if (!videoTitle.trim()) {
      setValidationError('Veuillez entrer un titre pour la vidéo');
      setShowSaveModal(true);
      return;
    }
    if (!videoDescription.trim()) {
      setValidationError('Veuillez entrer une description pour la vidéo');
      setShowSaveModal(true);
      return;
    }
    if (!videoTags.trim()) {
      setValidationError('Veuillez entrer des tags pour la vidéo');
      setShowSaveModal(true);
      return;
    }
    if (videoSegments.length === 0) {
      setValidationError('Veuillez ajouter au moins un segment à la timeline');
      setShowSaveModal(true);
      return;
    }

    setValidationError('');
    setShowSaveModal(true);
  };

  const handleConfirmSave = () => {
    const input = {
      title: videoTitle,
      description: videoDescription,
      tags: videoTags,
      segments: videoSegments.map((segment) => ({
        extractId: segment.extractId,
        text: segment.text,
        order: segment.order,
      })),
      musicTracks: selectedTracks.map((track) => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map((artist) => ({
          id: artist.id,
          name: artist.name,
        })),
        album: {
          id: track.album.id,
          name: track.album.name,
          image: track.album.image,
        },
        duration: track.duration,
        previewUrl: track.previewUrl,
        spotifyUrl: track.spotifyUrl,
        uri: track.uri,
      })),
    };

    createVideo({ variables: { input } });
    setShowSaveModal(false);
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

  if (selectedExtracts.length === 0) {
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
            Aucun extrait sélectionné
          </h2>
          <Button
            onClick={() => navigate('/dashboard/extracts')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-400 hover:to-cyan-400 rounded-xl font-medium transition-all"
          >
            Retour aux Extraits
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
          <button
            onClick={() => navigate('/dashboard/extracts')}
            className={cn(
              "flex items-center gap-2 mb-4 transition-colors",
              theme === "dark"
                ? "text-purple-400 hover:text-purple-300"
                : "text-purple-600 hover:text-purple-700"
            )}
          >
            <ArrowLeft size={20} variant="Outline" color={theme === "dark" ? "#a855f7" : "#9333ea"} />
            <span className="text-sm font-medium">Retour aux Extraits</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={cn(
                "text-3xl font-bold mb-2",
                theme === "dark" ? "text-white" : "text-gray-900"
              )}>
                Construire votre Vidéo
              </h1>
              <p className={cn(
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              )}>
                Personnalisez les détails de votre vidéo et organisez les segments
              </p>
            </div>
            <Button
              onClick={handleSaveVideoClick}
              disabled={saving || videoSegments.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-400 hover:to-cyan-400 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <DocumentUpload size={20} variant="Bold" color="#FFFFFF" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Video Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Information */}
            <div className={cn(
              "p-6 rounded-2xl border-2",
              theme === "dark"
                ? "bg-[#12121a] border-gray-800"
                : "bg-white border-gray-200"
            )}>
              <h2 className={cn(
                "text-xl font-bold mb-4",
                theme === "dark" ? "text-white" : "text-gray-900"
              )}>
                Informations Vidéo
              </h2>

              <div className="space-y-4">
                <Input
                  label="Titre de la Vidéo *"
                  type="text"
                  value={videoTitle}
                  onChange={(e) => {
                    setVideoTitle(e.target.value);
                    setUserEditedTitle(true);
                  }}
                  placeholder="Entrez le titre de la vidéo"
                />

                <Textarea
                  label="Description de la Vidéo *"
                  value={videoDescription}
                  onChange={(e) => {
                    setVideoDescription(e.target.value);
                    setUserEditedDescription(true);
                  }}
                  placeholder="Entrez la description de la vidéo"
                  rows={8}
                />

                <Input
                  label="Tags (séparés par des virgules) *"
                  type="text"
                  value={videoTags}
                  onChange={(e) => {
                    setVideoTags(e.target.value);
                    setUserEditedTags(true);
                  }}
                  placeholder="anime, citation, vf..."
                />
              </div>
            </div>

            {/* Video Timeline */}
            <div className={cn(
              "p-6 rounded-2xl border-2",
              theme === "dark"
                ? "bg-[#12121a] border-gray-800"
                : "bg-white border-gray-200"
            )}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className={cn(
                    "text-xl font-bold",
                    theme === "dark" ? "text-white" : "text-gray-900"
                  )}>
                    Timeline Vidéo
                  </h2>
                  <p className={cn(
                    "text-xs mt-1",
                    theme === "dark" ? "text-gray-500" : "text-gray-500"
                  )}>
                    {videoSegments.length} segment{videoSegments.length !== 1 ? 's' : ''} dans la timeline
                  </p>
                </div>
              </div>

              <div className={cn(
                "rounded-xl p-3 mb-4 border",
                theme === "dark"
                  ? "bg-cyan-500/10 border-cyan-500/30"
                  : "bg-blue-50 border-blue-200"
              )}>
                <p className={cn(
                  "text-sm",
                  theme === "dark" ? "text-cyan-400" : "text-blue-800"
                )}>
                  <strong>Astuce:</strong> Utilisez les flèches (↑↓) pour réorganiser, le crayon pour modifier et la corbeille pour supprimer.
                </p>
              </div>

              {videoSegments.length === 0 ? (
                <div className={cn(
                  "text-center py-12 border-2 border-dashed rounded-xl",
                  theme === "dark" ? "border-gray-700" : "border-gray-300"
                )}>
                  <p className={cn(
                    "mb-2",
                    theme === "dark" ? "text-gray-500" : "text-gray-500"
                  )}>
                    Aucun segment dans la timeline
                  </p>
                  <p className={cn(
                    "text-sm",
                    theme === "dark" ? "text-gray-600" : "text-gray-400"
                  )}>
                    Cliquez sur "Ajouter à la Timeline" à droite pour ajouter des extraits
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {videoSegments.map((segment, index) => {
                    const extract = selectedExtracts.find((e) => e.id === segment.extractId);
                    const isEditing = editingSegmentId === segment.id;

                    return (
                      <div
                        key={segment.id}
                        className={cn(
                          "border-2 rounded-xl p-4 transition-all",
                          isEditing
                            ? theme === "dark"
                              ? "bg-purple-500/10 border-purple-500"
                              : "bg-blue-50 border-blue-400"
                            : theme === "dark"
                              ? "bg-[#0a0a0f] border-gray-800 hover:border-gray-700"
                              : "bg-white border-gray-200 hover:border-purple-300"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* Position Number */}
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow">
                              {index + 1}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={cn(
                                "text-xs font-medium",
                                theme === "dark" ? "text-gray-300" : "text-gray-700"
                              )}>
                                {extract?.animeTitle}
                              </span>
                              {extract?.episode && (
                                <span className={cn(
                                  "text-xs",
                                  theme === "dark" ? "text-gray-500" : "text-gray-500"
                                )}>
                                  Ep. {extract.episode}
                                </span>
                              )}
                            </div>

                            {isEditing ? (
                              <div className="space-y-3">
                                <div>
                                  <label className={cn(
                                    "block text-xs font-medium mb-1",
                                    theme === "dark" ? "text-gray-400" : "text-gray-700"
                                  )}>
                                    Modifier le texte du segment:
                                  </label>
                                  <Textarea
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    rows={4}
                                    className="text-sm"
                                    placeholder="Entrez le texte pour ce segment..."
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={handleSaveSegmentEdit}
                                    className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium"
                                  >
                                    <TickCircle size={16} variant="Bold" color="#FFFFFF" />
                                    Sauvegarder
                                  </Button>
                                  <Button
                                    onClick={handleCancelEdit}
                                    className={cn(
                                      "px-4 py-2 text-sm rounded-lg font-medium",
                                      theme === "dark"
                                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    )}
                                  >
                                    Annuler
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className={cn(
                                "text-sm italic leading-relaxed",
                                theme === "dark" ? "text-gray-300" : "text-gray-900"
                              )}>
                                "{segment.text}"
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex-shrink-0 flex flex-col gap-1">
                            <button
                              onClick={() => handleMoveSegment(segment.id, 'up')}
                              disabled={index === 0}
                              title="Monter"
                              className={cn(
                                "p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
                                theme === "dark"
                                  ? "hover:bg-gray-800"
                                  : "hover:bg-purple-50"
                              )}
                            >
                              <ArrowUp size={20} color={index === 0 ? '#6b7280' : '#a855f7'} />
                            </button>
                            <button
                              onClick={() => handleMoveSegment(segment.id, 'down')}
                              disabled={index === videoSegments.length - 1}
                              title="Descendre"
                              className={cn(
                                "p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
                                theme === "dark"
                                  ? "hover:bg-gray-800"
                                  : "hover:bg-purple-50"
                              )}
                            >
                              <ArrowDown size={20} color={index === videoSegments.length - 1 ? '#6b7280' : '#a855f7'} />
                            </button>
                            <div className={cn(
                              "h-px my-1",
                              theme === "dark" ? "bg-gray-700" : "bg-gray-300"
                            )}></div>
                            <button
                              onClick={() => handleEditSegment(segment.id, segment.text)}
                              disabled={isEditing}
                              title="Modifier"
                              className={cn(
                                "p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                                theme === "dark"
                                  ? "hover:bg-gray-800"
                                  : "hover:bg-blue-50"
                              )}
                            >
                              <Edit2 size={20} color={isEditing ? '#6b7280' : '#3B82F6'} />
                            </button>
                            <button
                              onClick={() => handleRemoveSegment(segment.id)}
                              title="Supprimer"
                              className={cn(
                                "p-2 rounded-lg transition-colors",
                                theme === "dark"
                                  ? "hover:bg-red-500/20"
                                  : "hover:bg-red-50"
                              )}
                            >
                              <Trash size={20} color="#DC2626" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Spotify Music Section */}
            <SpotifyTrackSearch
              onSelectTrack={handleSelectTrack}
              selectedTrackIds={selectedTracks.map((t) => t.id)}
            />

            {/* Selected Music Display */}
            {selectedTracks.length > 0 && (
              <div className={cn(
                "p-6 rounded-2xl border-2",
                theme === "dark"
                  ? "bg-[#12121a] border-gray-800"
                  : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    theme === "dark" ? "bg-green-500/20" : "bg-green-100"
                  )}>
                    <MusicCircle size={24} variant="Bulk" color="#10B981" />
                  </div>
                  <div>
                    <h2 className={cn(
                      "text-xl font-bold",
                      theme === "dark" ? "text-white" : "text-gray-900"
                    )}>
                      Musique Sélectionnée
                    </h2>
                    <p className={cn(
                      "text-sm",
                      theme === "dark" ? "text-gray-500" : "text-gray-500"
                    )}>
                      {selectedTracks.length} piste{selectedTracks.length !== 1 ? 's' : ''} sélectionnée{selectedTracks.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedTracks.map((track, index) => (
                    <div
                      key={track.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border-2",
                        theme === "dark"
                          ? "border-green-500/30 bg-green-500/10"
                          : "border-green-200 bg-green-50"
                      )}
                    >
                      {/* Track Number */}
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                      </div>

                      {/* Album Cover */}
                      {track.album.image ? (
                        <img
                          src={track.album.image}
                          alt={track.album.name}
                          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className={cn(
                          "w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0",
                          theme === "dark" ? "bg-gray-800" : "bg-gray-200"
                        )}>
                          <MusicCircle size={28} color={theme === "dark" ? "#6b7280" : "#9CA3AF"} />
                        </div>
                      )}

                      {/* Track Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "text-sm font-bold truncate",
                          theme === "dark" ? "text-white" : "text-gray-900"
                        )}>
                          {track.name}
                        </h3>
                        <p className={cn(
                          "text-xs truncate",
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        )}>
                          {track.artists.map((a) => a.name).join(', ')}
                        </p>
                        <span className={cn(
                          "text-xs",
                          theme === "dark" ? "text-gray-500" : "text-gray-500"
                        )}>
                          {formatDuration(track.duration)}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveTrack(track.id)}
                        className={cn(
                          "flex-shrink-0 p-2 rounded-lg transition-colors",
                          theme === "dark"
                            ? "hover:bg-red-500/20"
                            : "hover:bg-red-100"
                        )}
                        title="Retirer"
                      >
                        <Trash size={20} color="#DC2626" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Selected Extracts */}
          <div className="space-y-6">
            <div className={cn(
              "p-6 rounded-2xl border-2 sticky top-6",
              theme === "dark"
                ? "bg-[#12121a] border-gray-800"
                : "bg-white border-gray-200"
            )}>
              <div className="mb-4">
                <h2 className={cn(
                  "text-lg font-bold",
                  theme === "dark" ? "text-white" : "text-gray-900"
                )}>
                  Extraits Sélectionnés
                </h2>
                <p className={cn(
                  "text-xs mt-1",
                  theme === "dark" ? "text-gray-500" : "text-gray-500"
                )}>
                  {selectedExtracts.length} extrait{selectedExtracts.length !== 1 ? 's' : ''} • Cliquez pour ajouter
                </p>
              </div>

              <div className={cn(
                "rounded-xl p-3 mb-4 border",
                theme === "dark"
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-green-50 border-green-200"
              )}>
                <p className={cn(
                  "text-xs",
                  theme === "dark" ? "text-green-400" : "text-green-800"
                )}>
                  <strong>Vous pouvez ajouter le même extrait plusieurs fois</strong> pour utiliser différentes parties dans votre vidéo
                </p>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {selectedExtracts.map((extract) => (
                  <div
                    key={extract.id}
                    className={cn(
                      "border-2 rounded-xl p-3 transition-colors",
                      theme === "dark"
                        ? "border-gray-800 hover:border-purple-500/50 bg-[#0a0a0f]"
                        : "border-gray-200 hover:border-purple-300 bg-white"
                    )}
                  >
                    {extract.animeImage && (
                      <img
                        src={extract.animeImage}
                        alt={extract.animeTitle}
                        className="w-full h-24 object-cover rounded-lg mb-2"
                      />
                    )}
                    <h3 className={cn(
                      "text-sm font-bold mb-1",
                      theme === "dark" ? "text-white" : "text-gray-900"
                    )}>
                      {extract.animeTitle}
                    </h3>
                    {extract.episode && (
                      <span className={cn(
                        "text-xs mb-2 inline-block",
                        theme === "dark" ? "text-gray-500" : "text-gray-500"
                      )}>
                        Episode {extract.episode}
                      </span>
                    )}
                    {extract.theme && (
                      <div
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-white mb-2 ml-2"
                        style={{ backgroundColor: extract.theme.color }}
                      >
                        {extract.theme.name}
                      </div>
                    )}
                    <p className={cn(
                      "text-xs line-clamp-3 italic mb-3",
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    )}>
                      "{extract.text}"
                    </p>
                    <button
                      onClick={() => handleAddSegment(extract.id, extract.text)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 rounded-lg transition-colors shadow-sm"
                    >
                      <Add size={16} variant="Bold" color="#FFFFFF" />
                      Ajouter à la Timeline
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Confirmation Modal */}
      <ActionConfirmationModal
        isOpen={showSaveModal}
        onClose={() => {
          setShowSaveModal(false);
          setValidationError('');
        }}
        onConfirm={validationError ? () => setShowSaveModal(false) : handleConfirmSave}
        title={validationError ? 'Erreur de Validation' : 'Sauvegarder la Vidéo'}
        message={
          validationError ||
          `Êtes-vous sûr de vouloir sauvegarder cette vidéo ?\n\nTitre: ${videoTitle}\nSegments: ${videoSegments.length}\nPistes musicales: ${selectedTracks.length}`
        }
        type={validationError ? 'warning' : 'info'}
        confirmText={validationError ? 'OK' : 'Sauvegarder'}
        cancelText={validationError ? undefined : 'Annuler'}
        loading={saving}
      />
    </div>
  );
};

export default VideoBuilder;
