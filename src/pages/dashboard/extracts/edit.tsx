import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate, useParams } from 'react-router';
import { GET_EXTRACT } from '../../../lib/graphql/queries';
import { UPDATE_EXTRACT } from '../../../lib/graphql/mutations';
import AnimeSearch from '../../../components/extracts/AnimeSearch';
import CharacterSelector from '../../../components/extracts/CharacterSelector';
import ThemeSelector from '../../../components/extracts/ThemeSelector';
import TimelineSelector from '../../../components/extracts/TimelineSelector';
import EpisodeSelector from '../../../components/extracts/EpisodeSelector';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import { TickCircle, ArrowLeft } from 'iconsax-react';
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

const EditExtract: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  const [text, setText] = useState('');
  const [selectedAnime, setSelectedAnime] = useState<SelectedAnime | null>(null);
  const [selectedCharacters, setSelectedCharacters] = useState<SelectedCharacter[]>([]);
  const [timing, setTiming] = useState({ start: '00:00', end: '00:00' });
  const [episode, setEpisode] = useState<number | undefined>();
  const [episodeDuration, setEpisodeDuration] = useState<number>(24);
  const [selectedThemeId, setSelectedThemeId] = useState<string | undefined>();
  const [apiSource, setApiSource] = useState<'MAL' | 'JIKAN'>('JIKAN');
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  const { data: extractData, loading: loadingExtract } = useQuery(GET_EXTRACT, {
    variables: { id },
    skip: !id,
    onCompleted: (data) => {
      if (data?.extract) {
        const extract = data.extract;
        setText(extract.text);
        setSelectedAnime({
          id: extract.animeId,
          title: extract.animeTitle,
          image: extract.animeImage,
        });
        setSelectedCharacters(extract.characters);
        setTiming(extract.timing);
        setEpisode(extract.episode);
        setSelectedThemeId(extract.theme?.id);
        setApiSource(extract.apiSource || 'JIKAN');
      }
    },
  });

  const handleEpisodeSelect = (episodeNumber: number, duration?: number) => {
    setEpisode(episodeNumber);
    if (duration) {
      setEpisodeDuration(duration);
    }
  };

  const [updateExtract, { loading }] = useMutation(UPDATE_EXTRACT, {
    onCompleted: () => {
      toast.success('Extract updated', 'Your extract has been updated successfully');
      navigate('/dashboard/extracts');
    },
    onError: (error) => {
      console.error('Error updating extract:', error);
      toast.error('Failed to update extract', error.message || 'Please try again');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!text || !selectedAnime || selectedCharacters.length === 0 || !timing.start || !timing.end || !selectedThemeId) {
      setValidationMessage('Please fill all required fields including theme');
      setShowValidationModal(true);
      return;
    }

    updateExtract({
      variables: {
        id,
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

  if (loadingExtract) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!extractData?.extract) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Extract not found</h2>
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/dashboard/extracts')}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-2 transition-colors"
            >
              <ArrowLeft size={20} variant="Outline" color="#4F46E5" />
              <span className="text-sm font-medium">Back to Extracts</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Extract</h1>
            <p className="text-gray-600">Update your anime extract</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* API Source Selection */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-sm font-semibold mb-4 text-gray-700 uppercase tracking-wide">
                  1. API Source
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
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
                <h2 className="text-sm font-semibold mb-4 text-gray-700 uppercase tracking-wide">
                  Extract Text *
                </h2>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter the anime quote or extract..."
                  rows={8}
                  required
                  className="resize-none"
                />
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
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-[400px]">
                <h2 className="text-sm font-semibold mb-4 text-gray-700 uppercase tracking-wide">
                  Theme *
                </h2>
                <ThemeSelector
                  selectedThemeId={selectedThemeId}
                  onThemeChange={setSelectedThemeId}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200 bg-white p-6 rounded-xl shadow-sm">
            <Button
              type="button"
              onClick={() => navigate('/dashboard/extracts')}
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
                  Updating...
                </>
              ) : (
                <>
                  <TickCircle size={20} variant="Bulk" color="#FFFFFF" />
                  Update Extract
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
    </div>
  );
};

export default EditExtract;
