import React, { useState, useEffect } from 'react';
import { useMutation, useLazyQuery } from '@apollo/client';
import { useNavigate } from 'react-router';
import { CREATE_EXTRACT, CORRECT_SPELLING } from '../../../lib/graphql/mutations';
import { SEARCH_SUBTITLES, DOWNLOAD_SUBTITLE } from '../../../lib/graphql/queries';
import { extractTextByTiming, cleanSubtitleText } from '../../../lib/utils/subtitleUtils';
import AnimeSearch from '../../../components/extracts/AnimeSearch';
import CharacterSelector from '../../../components/extracts/CharacterSelector';
import ThemeSelector from '../../../components/extracts/ThemeSelector';
import TimelineSelector from '../../../components/extracts/TimelineSelector';
import EpisodeSelector from '../../../components/extracts/EpisodeSelector';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import { RefreshCircle, TickCircle, DocumentText, Subtitle, Broom } from 'iconsax-react';
import { useToast } from '../../../context/toast-context';

import Button from '../../../components/actions/button';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';

interface SelectedAnime {
  id: number;
  title: string;
  image: string;
  season?: number;
}

interface SelectedCharacter {
  malId: number;
  name: string;
  image?: string;
}

const NewExtract: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [text, setText] = useState('');
  const [selectedAnime, setSelectedAnime] = useState<SelectedAnime | null>(null);
  const [selectedCharacters, setSelectedCharacters] = useState<SelectedCharacter[]>([]);
  const [timing, setTiming] = useState({ start: '00:00', end: '00:00' });
  const [episode, setEpisode] = useState<number | undefined>();
  const [episodeDuration, setEpisodeDuration] = useState<number>(24); // Default 24 min
  const [selectedThemeId, setSelectedThemeId] = useState<string | undefined>();
  const [apiSource, setApiSource] = useState<'MAL' | 'JIKAN'>('JIKAN');
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [showSubtitleModal, setShowSubtitleModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'fr' | 'both'>('fr');
  const [mappingService, setMappingService] = useState<'arm' | 'idsmoe'>('arm');
  interface Subtitle {
    fileId: string;
    fileName: string;
    language: string;
    downloadCount: number;
    rating: number;
    release: string;
    uploader: string;
  }

  interface SubtitleEntry {
    startTime: string;
    endTime: string;
    text: string;
  }

  const [availableSubtitles, setAvailableSubtitles] = useState<Subtitle[]>([]);
  const [loadedSubtitles, setLoadedSubtitles] = useState<SubtitleEntry[]>([]);

  // Auto-update extract text when timing changes and subtitles are loaded
  useEffect(() => {
    if (loadedSubtitles.length > 0 && timing.start && timing.end) {
      const extractedText = extractTextByTiming(loadedSubtitles, timing.start, timing.end);
      if (extractedText) {
        setText(extractedText);
      }
    }
  }, [timing.start, timing.end, loadedSubtitles]);

  const handleEpisodeSelect = (episodeNumber: number, duration?: number) => {
    setEpisode(episodeNumber);
    if (duration) {
      setEpisodeDuration(duration);
    }
  };

  const handleReset = () => {
    setText('');
    setSelectedAnime(null);
    setSelectedCharacters([]);
    setTiming({ start: '00:00', end: '00:00' });
    setEpisode(undefined);
    setEpisodeDuration(24);
    setSelectedThemeId(undefined);
  };

  const [createExtract, { loading }] = useMutation(CREATE_EXTRACT, {
    onCompleted: () => {
      toast.success('Extract created', 'Your extract has been created successfully');
      navigate('/dashboard/extracts');
    },
    onError: (error) => {
      console.error('Error creating extract:', error);
      toast.error('Failed to create extract', error.message || 'Please try again');
    },
  });

  const [correctSpellingMutation, { loading: correcting }] = useMutation(CORRECT_SPELLING, {
    onCompleted: (data) => {
      setText(data.correctSpelling);
      toast.success('Spelling corrected', 'Your text has been corrected successfully');
    },
    onError: (error) => {
      console.error('Error correcting spelling:', error);
      toast.error('Failed to correct spelling', error.message || 'Please try again');
    },
  });

  const [searchSubtitles, { loading: searchingSubtitles }] = useLazyQuery(SEARCH_SUBTITLES, {
    onCompleted: (data) => {
      if (data.searchSubtitles && data.searchSubtitles.length > 0) {
        setAvailableSubtitles(data.searchSubtitles);
        setShowSubtitleModal(true);
      } else {
        toast.error('No subtitles found', 'No subtitles available for this episode');
      }
    },
    onError: (error) => {
      console.error('Error searching subtitles:', error);
      toast.error('Failed to search subtitles', error.message || 'Please try again');
    },
  });

  const [downloadSubtitle, { loading: downloadingSubtitle }] = useLazyQuery(DOWNLOAD_SUBTITLE, {
    onCompleted: (data) => {
      if (data.downloadSubtitle && data.downloadSubtitle.entries) {
        setLoadedSubtitles(data.downloadSubtitle.entries);
        setShowSubtitleModal(false);

        // Extract text for current timing
        const extractedText = extractTextByTiming(
          data.downloadSubtitle.entries,
          timing.start,
          timing.end
        );

        if (extractedText) {
          setText(extractedText);
          toast.success('Subtitle loaded', 'Text will update automatically when you change timing');
        } else {
          toast.warning('No text found', 'No subtitle text found for current timing. Adjust the timing to see text.');
        }
      } else {
        toast.error('Failed to load subtitle', 'No subtitle data received');
      }
    },
    onError: (error) => {
      console.error('Error downloading subtitle:', error);
      toast.error('Failed to download subtitle', error.message || 'Please try again');
    },
  });

  const handleCorrectSpelling = () => {
    if (!text || text.trim().length === 0) {
      toast.error('No text to correct', 'Please enter some text first');
      return;
    }

    correctSpellingMutation({
      variables: { text },
    });
  };

  const handleCleanText = () => {
    if (!text || text.trim().length === 0) {
      toast.error('No text to clean', 'Please enter some text first');
      return;
    }

    const cleanedText = cleanSubtitleText(text);
    setText(cleanedText);
    toast.success('Text cleaned', 'Subtitle formatting has been removed');
  };

  const handleAutoFillFromSubtitles = () => {
    if (!selectedAnime || !episode || !timing.start || !timing.end) {
      toast.error('Missing information', 'Please select anime, episode, and timing first');
      return;
    }

    if (timing.start === '00:00' && timing.end === '00:00') {
      toast.error('Invalid timing', 'Please set extract timing first');
      return;
    }

    searchSubtitles({
      variables: {
        animeId: selectedAnime.id,
        season: selectedAnime.season || null,
        episode: episode,
        languages: selectedLanguage === 'both' ? ['en', 'fr'] : [selectedLanguage],
        mappingService: mappingService,
      },
    });
  };

  const handleSelectSubtitle = (fileId: string) => {
    downloadSubtitle({
      variables: {
        fileId: fileId,
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!text || !selectedAnime || selectedCharacters.length === 0 || !timing.start || !timing.end || !selectedThemeId) {
      setValidationMessage('Please fill all required fields including theme');
      setShowValidationModal(true);
      return;
    }

    createExtract({
      variables: {
        input: {
          text,
          characters: selectedCharacters.map((char) => ({
            malId: char.malId,
            name: char.name,
            image: char.image,
          })),
          animeId: selectedAnime.id,
          animeTitle: selectedAnime.title,
          animeImage: selectedAnime.image,
          apiSource,
          timing: {
            start: timing.start,
            end: timing.end,
          },
          episode,
          themeId: selectedThemeId,
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Extract</h1>
            <p className="text-gray-600">Add a new anime extract to your collection</p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCircle size={20} variant="Bulk" color="#374151" />
            Reset All
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* API Source Selection */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-sm font-semibold mb-4 text-gray-700 uppercase tracking-wide">
                  1. Choose API Source
                </h2>
                <div className="flex gap-3">
                  <label className="flex-1 flex items-center justify-center gap-3 p-4 cursor-pointer border-2 rounded-lg transition-all hover:bg-gray-50 has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50">
                    <input
                      type="radio"
                      name="apiSource"
                      value="JIKAN"
                      checked={apiSource === 'JIKAN'}
                      onChange={(e) => setApiSource(e.target.value as 'MAL' | 'JIKAN')}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <img
                      src="/jikan-icon.png"
                      alt="Jikan API"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="text-center">
                      <span className="text-sm font-medium text-gray-900 block">Jikan API</span>
                      <span className="text-xs text-gray-500">Recommended</span>
                    </div>
                  </label>
                  <label className="flex-1 flex items-center justify-center gap-3 p-4 cursor-pointer border-2 rounded-lg transition-all hover:bg-gray-50 has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50">
                    <input
                      type="radio"
                      name="apiSource"
                      value="MAL"
                      checked={apiSource === 'MAL'}
                      onChange={(e) => setApiSource(e.target.value as 'MAL' | 'JIKAN')}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <img
                      src="/mal-icon.png"
                      alt="MyAnimeList"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="text-center">
                      <span className="text-sm font-medium text-gray-900 block">MyAnimeList</span>
                      <span className="text-xs text-gray-500">Requires key</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Anime Selection */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-sm font-semibold mb-4 text-gray-700 uppercase tracking-wide">
                  2. Search & Select Anime
                </h2>
                <AnimeSearch
                  onSelect={setSelectedAnime}
                  selectedAnime={selectedAnime}
                  apiSource={apiSource}
                />
              </div>

              {/* Characters */}
              {selectedAnime && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h2 className="text-sm font-semibold mb-4 text-gray-700 uppercase tracking-wide">
                    3. Select Characters
                  </h2>
                  <CharacterSelector
                    animeId={selectedAnime.id}
                    apiSource={apiSource}
                    selectedCharacters={selectedCharacters}
                    onCharactersChange={setSelectedCharacters}
                  />
                </div>
              )}

              {/* Episode Selection */}
              {selectedAnime && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h2 className="text-sm font-semibold mb-4 text-gray-700 uppercase tracking-wide">
                    4. Select Episode
                  </h2>
                  <EpisodeSelector
                    animeId={selectedAnime.id}
                    apiSource={apiSource}
                    selectedEpisode={episode}
                    onEpisodeSelect={handleEpisodeSelect}
                  />
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Input
                      label="Or enter manually"
                      type="number"
                      placeholder="Episode number"
                      value={episode || ''}
                      onChange={(e) => setEpisode(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>
              )}

              {/* Timing Selection */}
              {episode && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h2 className="text-sm font-semibold mb-4 text-gray-700 uppercase tracking-wide">
                    5. Set Extract Timing
                  </h2>
                  <TimelineSelector
                    duration={episodeDuration}
                    startTime={timing.start}
                    endTime={timing.end}
                    onTimeChange={(start, end) => setTiming({ start, end })}
                  />
                  <p className="text-xs text-gray-500 mt-3">
                    Duration: {episodeDuration} min • Drag handles or enter time manually
                  </p>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Extract Text */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Extract Text *
                  </h2>
                  {loadedSubtitles.length > 0 && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      Auto-sync enabled ({loadedSubtitles.length} subtitles)
                    </span>
                  )}
                </div>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter the anime quote or extract..."
                  rows={8}
                  required
                  className="resize-none"
                />

                {/* AI Correction & Clean Text Buttons */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCorrectSpelling}
                    disabled={correcting || !text}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {correcting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Correcting...</span>
                      </>
                    ) : (
                      <>
                        <DocumentText size={20} variant="Bulk" color="#9333EA" />
                        <span>Correct Spelling</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCleanText}
                    disabled={!text}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Broom size={20} variant="Bulk" color="#EA580C" />
                    <span>Clean Text</span>
                  </button>
                </div>

                {/* Auto-fill from Subtitles Button */}
                {selectedAnime && episode && timing.start !== '00:00' && timing.end !== '00:00' && (
                  <div className="mt-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Language</label>
                        <select
                          value={selectedLanguage}
                          onChange={(e) => setSelectedLanguage(e.target.value as 'en' | 'fr')}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                          <option value="en">English</option>
                          <option value="fr">Français</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">ID Mapping</label>
                        <select
                          value={mappingService}
                          onChange={(e) => setMappingService(e.target.value as 'arm' | 'idsmoe')}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                          <option value="arm">ARM (Default)</option>
                          <option value="idsmoe">ids.moe</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoFillFromSubtitles}
                      disabled={searchingSubtitles}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {searchingSubtitles ? (
                        <>
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>Searching...</span>
                        </>
                      ) : (
                        <>
                          <Subtitle size={20} variant="Bulk" color="#2563EB" />
                          <span>Auto-fill from Subtitles</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-3">Selected Info:</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Anime:</span>
                      <span className="font-medium text-gray-900">{selectedAnime?.title || 'Not selected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Characters:</span>
                      <span className="font-medium text-gray-900">{selectedCharacters.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Episode:</span>
                      <span className="font-medium text-gray-900">{episode || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Timing:</span>
                      <span className="font-medium text-gray-900">{timing.start} - {timing.end}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Theme Selection */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-sm font-semibold mb-4 text-gray-700 uppercase tracking-wide">
                  Theme *
                </h2>
                <ThemeSelector
                  selectedThemeId={selectedThemeId}
                  onThemeChange={setSelectedThemeId}
                  extractText={text}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200 bg-white p-6 rounded-xl shadow-sm">
            <Button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <TickCircle size={20} variant="Bulk" color="#FFFFFF" />
                  Create Extract
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Validation Modal */}
      <ConfirmationModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        title="Missing Required Fields"
        message={validationMessage}
        type="warning"
      />

      {/* Subtitle Selection Modal */}
      {showSubtitleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Select Subtitle</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {availableSubtitles.length} subtitle(s) found for this episode
                </p>
              </div>
              <button
                onClick={() => setShowSubtitleModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <TickCircle size={24} variant="Bulk" color="#9CA3AF" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {availableSubtitles.map((subtitle, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectSubtitle(subtitle.fileId)}
                  disabled={downloadingSubtitle}
                  className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded uppercase">
                          {subtitle.language}
                        </span>
                        <span className="text-xs text-gray-500">
                          {subtitle.downloadCount} downloads
                        </span>
                        <span className="text-xs text-gray-500">
                          ⭐ {subtitle.rating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {subtitle.fileName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {subtitle.release}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        by {subtitle.uploader}
                      </p>
                    </div>
                    {downloadingSubtitle && (
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowSubtitleModal(false)}
                className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewExtract;
