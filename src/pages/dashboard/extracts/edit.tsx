import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { useNavigate, useParams } from 'react-router';
import { GET_EXTRACT, SEARCH_SUBTITLES, DOWNLOAD_SUBTITLE } from '../../../lib/graphql/queries';
import { UPDATE_EXTRACT, CORRECT_SPELLING, TRANSLATE_TEXT } from '../../../lib/graphql/mutations';
import { extractTextByTiming, cleanSubtitleText } from '../../../lib/utils/subtitleUtils';
import AnimeSearch from '../../../components/extracts/AnimeSearch';
import CharacterSelector from '../../../components/extracts/CharacterSelector';
import ThemeSelector from '../../../components/extracts/ThemeSelector';
import TimelineSelector from '../../../components/extracts/TimelineSelector';
import EpisodeSelector from '../../../components/extracts/EpisodeSelector';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import { TickCircle, ArrowLeft, DocumentText, Subtitle, Broom, LanguageSquare } from 'iconsax-react';
import { useToast } from '../../../context/toast-context';
import { useTheme } from '../../../context/theme-context';
import { cn } from '../../../lib/utils';

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
  const { theme } = useTheme();

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

  const [translateTextMutation, { loading: translating }] = useMutation(TRANSLATE_TEXT, {
    onCompleted: (data) => {
      setText(data.translateText);
      toast.success('Text translated', 'Your text has been translated to French successfully');
    },
    onError: (error) => {
      console.error('Error translating text:', error);
      toast.error('Failed to translate text', error.message || 'Please try again');
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

  const handleTranslate = () => {
    if (!text || text.trim().length === 0) {
      toast.error('No text to translate', 'Please enter some text first');
      return;
    }

    translateTextMutation({
      variables: { text },
    });
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
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        theme === "dark" ? "bg-[#0a0a0f]" : "bg-gray-50"
      )}>
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!extractData?.extract) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        theme === "dark" ? "bg-[#0a0a0f]" : "bg-gray-50"
      )}>
        <div className="text-center">
          <h2 className={cn(
            "text-2xl font-bold mb-4",
            theme === "dark" ? "text-white" : "text-gray-900"
          )}>Extrait non trouvé</h2>
          <Button
            onClick={() => navigate('/dashboard/extracts')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-400 hover:to-cyan-400 rounded-xl font-medium transition-all"
          >
            Retour aux extraits
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/dashboard/extracts')}
              className={cn(
                "flex items-center gap-2 mb-2 transition-colors",
                theme === "dark"
                  ? "text-purple-400 hover:text-purple-300"
                  : "text-indigo-600 hover:text-indigo-700"
              )}
            >
              <ArrowLeft size={20} variant="Outline" color={theme === "dark" ? "#A855F7" : "#4F46E5"} />
              <span className="text-sm font-medium">Retour aux extraits</span>
            </button>
            <h1 className={cn(
              "text-3xl font-bold mb-2",
              theme === "dark" ? "text-white" : "text-gray-900"
            )}>Modifier l'extrait</h1>
            <p className={cn(
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}>Mettre à jour votre extrait anime</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* API Source Selection */}
              <div className={cn(
                "p-6 rounded-2xl border-2 transition-colors",
                theme === "dark"
                  ? "bg-[#12121a] border-gray-800"
                  : "bg-white border-gray-200"
              )}>
                <h2 className={cn(
                  "text-sm font-semibold mb-4 uppercase tracking-wide",
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                )}>
                  1. Source API
                </h2>
                <div className="flex gap-3">
                  <label className={cn(
                    "flex-1 flex items-center justify-center gap-3 p-4 cursor-pointer border-2 rounded-xl transition-all",
                    theme === "dark"
                      ? "border-gray-700 hover:bg-gray-800 has-[:checked]:border-purple-500 has-[:checked]:bg-purple-500/10"
                      : "border-gray-200 hover:bg-gray-50 has-[:checked]:border-purple-600 has-[:checked]:bg-purple-50"
                  )}>
                    <input
                      type="radio"
                      name="apiSource"
                      value="JIKAN"
                      checked={apiSource === 'JIKAN'}
                      onChange={(e) => setApiSource(e.target.value as 'MAL' | 'JIKAN')}
                      className="w-4 h-4 text-purple-600"
                    />
                    <img
                      src="/jikan-icon.png"
                      alt="Jikan API"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="text-center">
                      <span className={cn(
                        "text-sm font-medium block",
                        theme === "dark" ? "text-white" : "text-gray-900"
                      )}>Jikan API</span>
                      <span className={cn(
                        "text-xs",
                        theme === "dark" ? "text-gray-500" : "text-gray-500"
                      )}>Recommandé</span>
                    </div>
                  </label>
                  <label className={cn(
                    "flex-1 flex items-center justify-center gap-3 p-4 cursor-pointer border-2 rounded-xl transition-all",
                    theme === "dark"
                      ? "border-gray-700 hover:bg-gray-800 has-[:checked]:border-purple-500 has-[:checked]:bg-purple-500/10"
                      : "border-gray-200 hover:bg-gray-50 has-[:checked]:border-purple-600 has-[:checked]:bg-purple-50"
                  )}>
                    <input
                      type="radio"
                      name="apiSource"
                      value="MAL"
                      checked={apiSource === 'MAL'}
                      onChange={(e) => setApiSource(e.target.value as 'MAL' | 'JIKAN')}
                      className="w-4 h-4 text-purple-600"
                    />
                    <img
                      src="/mal-icon.png"
                      alt="MyAnimeList"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="text-center">
                      <span className={cn(
                        "text-sm font-medium block",
                        theme === "dark" ? "text-white" : "text-gray-900"
                      )}>MyAnimeList</span>
                      <span className={cn(
                        "text-xs",
                        theme === "dark" ? "text-gray-500" : "text-gray-500"
                      )}>Nécessite une clé</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Anime Selection */}
              <div className={cn(
                "p-6 rounded-2xl border-2 transition-colors",
                theme === "dark"
                  ? "bg-[#12121a] border-gray-800"
                  : "bg-white border-gray-200"
              )}>
                <h2 className={cn(
                  "text-sm font-semibold mb-4 uppercase tracking-wide",
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                )}>
                  2. Rechercher un anime
                </h2>
                <AnimeSearch
                  onSelect={setSelectedAnime}
                  selectedAnime={selectedAnime}
                  apiSource={apiSource}
                />
              </div>

              {/* Characters */}
              {selectedAnime && (
                <div className={cn(
                  "p-6 rounded-2xl border-2 transition-colors",
                  theme === "dark"
                    ? "bg-[#12121a] border-gray-800"
                    : "bg-white border-gray-200"
                )}>
                  <h2 className={cn(
                    "text-sm font-semibold mb-4 uppercase tracking-wide",
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  )}>
                    3. Sélectionner les personnages
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
                <div className={cn(
                  "p-6 rounded-2xl border-2 transition-colors",
                  theme === "dark"
                    ? "bg-[#12121a] border-gray-800"
                    : "bg-white border-gray-200"
                )}>
                  <h2 className={cn(
                    "text-sm font-semibold mb-4 uppercase tracking-wide",
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  )}>
                    4. Sélectionner l'épisode
                  </h2>
                  <EpisodeSelector
                    animeId={selectedAnime.id}
                    apiSource={apiSource}
                    selectedEpisode={episode}
                    onEpisodeSelect={handleEpisodeSelect}
                  />
                  <div className={cn(
                    "mt-4 pt-4 border-t",
                    theme === "dark" ? "border-gray-700" : "border-gray-200"
                  )}>
                    <Input
                      label="Ou entrer manuellement"
                      type="number"
                      placeholder="Numéro d'épisode"
                      value={episode || ''}
                      onChange={(e) => setEpisode(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>
              )}

              {/* Timing Selection */}
              {episode && (
                <div className={cn(
                  "p-6 rounded-2xl border-2 transition-colors",
                  theme === "dark"
                    ? "bg-[#12121a] border-gray-800"
                    : "bg-white border-gray-200"
                )}>
                  <h2 className={cn(
                    "text-sm font-semibold mb-4 uppercase tracking-wide",
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  )}>
                    5. Définir le timing
                  </h2>
                  <TimelineSelector
                    duration={episodeDuration}
                    startTime={timing.start}
                    endTime={timing.end}
                    onTimeChange={(start, end) => setTiming({ start, end })}
                  />
                  <p className={cn(
                    "text-xs mt-3",
                    theme === "dark" ? "text-gray-500" : "text-gray-500"
                  )}>
                    Durée: {episodeDuration} min • Glissez les curseurs ou entrez le temps manuellement
                  </p>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Extract Text */}
              <div className={cn(
                "p-6 rounded-2xl border-2 transition-colors",
                theme === "dark"
                  ? "bg-[#12121a] border-gray-800"
                  : "bg-white border-gray-200"
              )}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={cn(
                    "text-sm font-semibold uppercase tracking-wide",
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  )}>
                    Texte de l'extrait *
                  </h2>
                  {loadedSubtitles.length > 0 && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                      Auto-sync ({loadedSubtitles.length} sous-titres)
                    </span>
                  )}
                </div>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Entrez la citation anime..."
                  rows={8}
                  required
                  className="resize-none"
                />

                {/* AI Buttons - Circular Icons */}
                <div className="mt-3 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleCorrectSpelling}
                    disabled={correcting || !text}
                    title="Corriger l'orthographe"
                    className={cn(
                      "relative group w-14 h-14 rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md",
                      theme === "dark"
                        ? "bg-purple-500/20 hover:bg-purple-500/30"
                        : "bg-purple-50 hover:bg-purple-100"
                    )}
                  >
                    {correcting ? (
                      <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <DocumentText size={26} variant="Bulk" color="#A855F7" />
                    )}
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Corriger l'orthographe
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCleanText}
                    disabled={!text}
                    title="Nettoyer le texte"
                    className={cn(
                      "relative group w-14 h-14 rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md",
                      theme === "dark"
                        ? "bg-orange-500/20 hover:bg-orange-500/30"
                        : "bg-orange-50 hover:bg-orange-100"
                    )}
                  >
                    <Broom size={26} variant="Bulk" color="#F97316" />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Nettoyer le texte
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTranslate}
                    disabled={translating || !text}
                    title="Traduire en français"
                    className={cn(
                      "relative group w-14 h-14 rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md",
                      theme === "dark"
                        ? "bg-cyan-500/20 hover:bg-cyan-500/30"
                        : "bg-blue-50 hover:bg-blue-100"
                    )}
                  >
                    {translating ? (
                      <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <LanguageSquare size={26} variant="Bulk" color="#06B6D4" />
                    )}
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Traduire en français
                    </span>
                  </button>
                </div>

                {/* Auto-fill from Subtitles Button */}
                {selectedAnime && episode && timing.start !== '00:00' && timing.end !== '00:00' && (
                  <div className="mt-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={cn(
                          "block text-xs font-medium mb-1",
                          theme === "dark" ? "text-gray-400" : "text-gray-700"
                        )}>Langue</label>
                        <select
                          value={selectedLanguage}
                          onChange={(e) => setSelectedLanguage(e.target.value as 'en' | 'fr')}
                          className={cn(
                            "w-full px-3 py-2 border-2 rounded-xl text-sm transition-colors",
                            theme === "dark"
                              ? "bg-[#0a0a0f] border-gray-700 text-white focus:border-purple-500"
                              : "bg-white border-gray-300 text-gray-900 focus:border-purple-500"
                          )}
                        >
                          <option value="en">English</option>
                          <option value="fr">Français</option>
                        </select>
                      </div>
                      <div>
                        <label className={cn(
                          "block text-xs font-medium mb-1",
                          theme === "dark" ? "text-gray-400" : "text-gray-700"
                        )}>ID Mapping</label>
                        <select
                          value={mappingService}
                          onChange={(e) => setMappingService(e.target.value as 'arm' | 'idsmoe')}
                          className={cn(
                            "w-full px-3 py-2 border-2 rounded-xl text-sm transition-colors",
                            theme === "dark"
                              ? "bg-[#0a0a0f] border-gray-700 text-white focus:border-purple-500"
                              : "bg-white border-gray-300 text-gray-900 focus:border-purple-500"
                          )}
                        >
                          <option value="arm">ARM (Défaut)</option>
                          <option value="idsmoe">ids.moe</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoFillFromSubtitles}
                      disabled={searchingSubtitles}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                        theme === "dark"
                          ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
                          : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      )}
                    >
                      {searchingSubtitles ? (
                        <>
                          <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                          <span>Recherche...</span>
                        </>
                      ) : (
                        <>
                          <Subtitle size={20} variant="Bulk" color={theme === "dark" ? "#06B6D4" : "#2563EB"} />
                          <span>Remplir depuis les sous-titres</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className={cn(
                  "mt-4 pt-4 border-t",
                  theme === "dark" ? "border-gray-700" : "border-gray-200"
                )}>
                  <p className={cn(
                    "text-xs mb-3",
                    theme === "dark" ? "text-gray-500" : "text-gray-500"
                  )}>Informations sélectionnées:</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className={cn(theme === "dark" ? "text-gray-500" : "text-gray-500")}>Anime:</span>
                      <span className={cn(
                        "font-medium",
                        theme === "dark" ? "text-white" : "text-gray-900"
                      )}>{selectedAnime?.title || 'Non sélectionné'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={cn(theme === "dark" ? "text-gray-500" : "text-gray-500")}>Personnages:</span>
                      <span className={cn(
                        "font-medium",
                        theme === "dark" ? "text-white" : "text-gray-900"
                      )}>{selectedCharacters.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={cn(theme === "dark" ? "text-gray-500" : "text-gray-500")}>Épisode:</span>
                      <span className={cn(
                        "font-medium",
                        theme === "dark" ? "text-white" : "text-gray-900"
                      )}>{episode || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={cn(theme === "dark" ? "text-gray-500" : "text-gray-500")}>Timing:</span>
                      <span className={cn(
                        "font-medium",
                        theme === "dark" ? "text-white" : "text-gray-900"
                      )}>{timing.start} - {timing.end}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Theme Selection */}
              <div className={cn(
                "p-6 rounded-2xl border-2 transition-colors",
                theme === "dark"
                  ? "bg-[#12121a] border-gray-800"
                  : "bg-white border-gray-200"
              )}>
                <h2 className={cn(
                  "text-sm font-semibold mb-4 uppercase tracking-wide",
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                )}>
                  Thème *
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
          <div className={cn(
            "flex justify-between items-center pt-6 border-t p-6 rounded-2xl border-2",
            theme === "dark"
              ? "bg-[#12121a] border-gray-800"
              : "bg-white border-gray-200"
          )}>
            <Button
              type="button"
              onClick={() => navigate('/dashboard/extracts')}
              className={cn(
                "px-6 py-3 border-2 rounded-xl font-medium transition-all",
                theme === "dark"
                  ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              )}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-400 hover:to-cyan-400 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Mise à jour...
                </>
              ) : (
                <>
                  <TickCircle size={20} variant="Bulk" color="#FFFFFF" />
                  Mettre à jour
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className={cn(
            "rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border-2",
            theme === "dark"
              ? "bg-[#12121a] border-gray-800"
              : "bg-white border-gray-200"
          )}>
            <div className={cn(
              "sticky top-0 border-b px-6 py-4 flex items-center justify-between",
              theme === "dark"
                ? "bg-[#12121a] border-gray-800"
                : "bg-white border-gray-200"
            )}>
              <div>
                <h2 className={cn(
                  "text-xl font-bold",
                  theme === "dark" ? "text-white" : "text-gray-900"
                )}>Sélectionner un sous-titre</h2>
                <p className={cn(
                  "text-sm mt-1",
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                )}>
                  {availableSubtitles.length} sous-titre(s) trouvé(s) pour cet épisode
                </p>
              </div>
              <button
                onClick={() => setShowSubtitleModal(false)}
                className={cn(
                  "transition-colors",
                  theme === "dark" ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <TickCircle size={24} variant="Bulk" color={theme === "dark" ? "#6B7280" : "#9CA3AF"} />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {availableSubtitles.map((subtitle, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectSubtitle(subtitle.fileId)}
                  disabled={downloadingSubtitle}
                  className={cn(
                    "w-full text-left p-4 border-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                    theme === "dark"
                      ? "border-gray-700 hover:border-purple-500 hover:bg-purple-500/10"
                      : "border-gray-200 hover:border-blue-500 hover:bg-blue-50"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn(
                          "px-2 py-0.5 text-xs font-semibold rounded uppercase",
                          theme === "dark"
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-blue-100 text-blue-700"
                        )}>
                          {subtitle.language}
                        </span>
                        <span className={cn(
                          "text-xs",
                          theme === "dark" ? "text-gray-500" : "text-gray-500"
                        )}>
                          {subtitle.downloadCount} téléchargements
                        </span>
                        <span className={cn(
                          "text-xs",
                          theme === "dark" ? "text-gray-500" : "text-gray-500"
                        )}>
                          ⭐ {subtitle.rating.toFixed(1)}
                        </span>
                      </div>
                      <p className={cn(
                        "text-sm font-medium mb-1",
                        theme === "dark" ? "text-white" : "text-gray-900"
                      )}>
                        {subtitle.fileName}
                      </p>
                      <p className={cn(
                        "text-xs",
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      )}>
                        {subtitle.release}
                      </p>
                      <p className={cn(
                        "text-xs mt-1",
                        theme === "dark" ? "text-gray-500" : "text-gray-500"
                      )}>
                        par {subtitle.uploader}
                      </p>
                    </div>
                    {downloadingSubtitle && (
                      <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className={cn(
              "sticky bottom-0 border-t px-6 py-4",
              theme === "dark"
                ? "bg-[#0a0a0f] border-gray-800"
                : "bg-gray-50 border-gray-200"
            )}>
              <button
                type="button"
                onClick={() => setShowSubtitleModal(false)}
                className={cn(
                  "w-full px-4 py-2 border-2 rounded-xl font-medium transition-all",
                  theme === "dark"
                    ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                )}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditExtract;
