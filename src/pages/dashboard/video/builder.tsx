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

  const { data, loading } = useQuery(GET_EXTRACTS);

  const [createVideo, { loading: saving }] = useMutation(CREATE_VIDEO, {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onCompleted: (_data) => {
      toast.success('Video saved!', 'Your video has been saved successfully');
      navigate('/dashboard/videos');
    },
    onError: (error) => {
      console.error('Error saving video:', error);
      toast.error('Failed to save video', error.message || 'Please try again');
    },
  });

  const allExtracts: Extract[] = data?.extracts || [];
  const selectedExtracts = allExtracts.filter((extract) => extractIds.includes(extract.id));

  // Generate video title
  useEffect(() => {
    if (selectedExtracts.length > 0) {
      const theme = selectedExtracts[0].theme;
      const animes = [...new Set(selectedExtracts.map((e) => e.animeTitle))];

      if (theme) {
        const animeTitles = animes.join(' x ');
        const title = `${theme.name.toUpperCase()} !! - Citation VF ${animeTitles}`;
        setVideoTitle(title);
      }
    }
  }, [selectedExtracts]);

  // Generate video description
  useEffect(() => {
    if (selectedExtracts.length > 0) {
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
  }, [selectedExtracts]);

  // Generate video tags
  useEffect(() => {
    if (selectedExtracts.length > 0) {
      const theme = selectedExtracts[0].theme;
      const animes = [...new Set(selectedExtracts.map((e) => e.animeTitle))];

      const tags = [
        'anime',
        'citation',
        'vf',
        ...(theme ? [theme.name.toLowerCase()] : []),
        ...animes.map((a) => a.toLowerCase().replace(/\s+/g, ''))
      ];

      setVideoTags(tags.join(', '));
    }
  }, [selectedExtracts]);

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
    // Reorder
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

    // Update orders
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
    // Validation
    if (!videoTitle.trim()) {
      setValidationError('Please enter a video title');
      setShowSaveModal(true);
      return;
    }
    if (!videoDescription.trim()) {
      setValidationError('Please enter a video description');
      setShowSaveModal(true);
      return;
    }
    if (!videoTags.trim()) {
      setValidationError('Please enter video tags');
      setShowSaveModal(true);
      return;
    }
    if (videoSegments.length === 0) {
      setValidationError('Please add at least one segment to the timeline');
      setShowSaveModal(true);
      return;
    }

    // All validation passed, show confirmation modal
    setValidationError('');
    setShowSaveModal(true);
  };

  const handleConfirmSave = () => {
    // Prepare input for GraphQL mutation
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (selectedExtracts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No extracts selected</h2>
          <Button
            onClick={() => navigate('/dashboard/extracts')}
            className="px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium transition-all"
          >
            Back to Extracts
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
          <button
            onClick={() => navigate('/dashboard/extracts')}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4 transition-colors"
          >
            <ArrowLeft size={20} variant="Outline" color="#4F46E5" />
            <span className="text-sm font-medium">Back to Extracts</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Build Your Video</h1>
              <p className="text-gray-600">
                Customize your video details and organize the extract segments
              </p>
            </div>
            <Button
              onClick={handleSaveVideoClick}
              disabled={saving || videoSegments.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <DocumentUpload size={20} variant="Bold" color="#FFFFFF" />
                  Save Video
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Video Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Information */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Video Information</h2>

              <div className="space-y-4">
                <Input
                  label="Video Title *"
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Enter video title"
                />

                <Textarea
                  label="Video Description *"
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  placeholder="Enter video description"
                  rows={8}
                />

                <Input
                  label="Tags (comma separated) *"
                  type="text"
                  value={videoTags}
                  onChange={(e) => setVideoTags(e.target.value)}
                  placeholder="anime, citation, vf..."
                />
              </div>
            </div>

            {/* Video Timeline */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Video Timeline</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {videoSegments.length} segment{videoSegments.length !== 1 ? 's' : ''} in timeline
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> Use the arrow buttons (↑↓) to reorder segments, the pencil icon to edit text, and the trash icon to remove segments.
                </p>
              </div>

              {videoSegments.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500 mb-2">No segments in timeline yet</p>
                  <p className="text-sm text-gray-400">Click "Add to Timeline" on the right to add extracts</p>
                </div>
              ) : (
                <div className="space-y-3">
                {videoSegments.map((segment, index) => {
                  const extract = selectedExtracts.find((e) => e.id === segment.extractId);
                  const isEditing = editingSegmentId === segment.id;

                  return (
                    <div
                      key={segment.id}
                      className={`border-2 rounded-lg p-4 transition-all ${
                        isEditing
                          ? 'bg-blue-50 border-blue-400'
                          : 'bg-white border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Position Number */}
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow">
                            {index + 1}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-gray-700">
                              {extract?.animeTitle}
                            </span>
                            {extract?.episode && (
                              <span className="text-xs text-gray-500">
                                Ep. {extract.episode}
                              </span>
                            )}
                          </div>

                          {isEditing ? (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Edit segment text:
                                </label>
                                <Textarea
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  rows={4}
                                  className="text-sm"
                                  placeholder="Enter the text for this segment..."
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={handleSaveSegmentEdit}
                                  className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium"
                                >
                                  <TickCircle size={16} variant="Bold" color="#FFFFFF" />
                                  Save Changes
                                </Button>
                                <Button
                                  onClick={handleCancelEdit}
                                  className="px-4 py-2 text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg font-medium"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-900 italic leading-relaxed">
                              "{segment.text}"
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex-shrink-0 flex flex-col gap-1">
                          <button
                            onClick={() => handleMoveSegment(segment.id, 'up')}
                            disabled={index === 0}
                            title="Move up"
                            className="p-2 rounded-lg hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <ArrowUp size={20} color={index === 0 ? '#9CA3AF' : '#6366F1'} />
                          </button>
                          <button
                            onClick={() => handleMoveSegment(segment.id, 'down')}
                            disabled={index === videoSegments.length - 1}
                            title="Move down"
                            className="p-2 rounded-lg hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <ArrowDown size={20} color={index === videoSegments.length - 1 ? '#9CA3AF' : '#6366F1'} />
                          </button>
                          <div className="h-px bg-gray-300 my-1"></div>
                          <button
                            onClick={() => handleEditSegment(segment.id, segment.text)}
                            disabled={isEditing}
                            title="Edit text"
                            className="p-2 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Edit2 size={20} color={isEditing ? '#9CA3AF' : '#3B82F6'} />
                          </button>
                          <button
                            onClick={() => handleRemoveSegment(segment.id)}
                            title="Remove segment"
                            className="p-2 rounded-lg hover:bg-red-50 transition-colors"
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
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <MusicCircle size={24} variant="Bulk" color="#10B981" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Selected Music</h2>
                    <p className="text-sm text-gray-500">
                      {selectedTracks.length} track{selectedTracks.length !== 1 ? 's' : ''} selected for video
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedTracks.map((track, index) => (
                    <div
                      key={track.id}
                      className="flex items-center gap-3 p-3 rounded-lg border-2 border-green-200 bg-green-50"
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
                        <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MusicCircle size={28} color="#9CA3AF" />
                        </div>
                      )}

                      {/* Track Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 truncate">
                          {track.name}
                        </h3>
                        <p className="text-xs text-gray-600 truncate">
                          {track.artists.map((a) => a.name).join(', ')}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatDuration(track.duration)}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveTrack(track.id)}
                        className="flex-shrink-0 p-2 rounded-lg hover:bg-red-100 transition-colors group"
                        title="Remove track"
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
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900">Selected Extracts</h2>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedExtracts.length} extract{selectedExtracts.length !== 1 ? 's' : ''} • Click "Add to Timeline" to use
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-green-800">
                  <strong>✓ You can add the same extract multiple times</strong> to use different parts in your video
                </p>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {selectedExtracts.map((extract) => (
                  <div
                    key={extract.id}
                    className="border-2 border-gray-200 rounded-lg p-3 hover:border-indigo-300 transition-colors bg-white"
                  >
                    {extract.animeImage && (
                      <img
                        src={extract.animeImage}
                        alt={extract.animeTitle}
                        className="w-full h-24 object-cover rounded-lg mb-2"
                      />
                    )}
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      {extract.animeTitle}
                    </h3>
                    {extract.episode && (
                      <span className="text-xs text-gray-500 mb-2 inline-block">
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
                    <p className="text-xs text-gray-600 line-clamp-3 italic mb-3">
                      "{extract.text}"
                    </p>
                    <button
                      onClick={() => handleAddSegment(extract.id, extract.text)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm hover:shadow"
                    >
                      <Add size={16} variant="Bold" color="#FFFFFF" />
                      Add to Timeline
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
        title={validationError ? 'Validation Error' : 'Save Video'}
        message={
          validationError ||
          `Are you sure you want to save this video?\n\nTitle: ${videoTitle}\nSegments: ${videoSegments.length}\nMusic tracks: ${selectedTracks.length}`
        }
        type={validationError ? 'warning' : 'info'}
        confirmText={validationError ? 'OK' : 'Save'}
        cancelText={validationError ? undefined : 'Cancel'}
        loading={saving}
      />
    </div>
  );
};

export default VideoBuilder;
