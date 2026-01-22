import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router";
import { GET_EXTRACTS, GET_THEMES, GET_THEME_GROUPS } from "../../../lib/graphql/queries";
import { DELETE_EXTRACT } from "../../../lib/graphql/mutations";
import {
  Add,
  Edit2,
  Trash,
  Clock,
  Calendar,
  Profile2User,
  VideoPlay,
  TickCircle,
  CloseCircle,
  DocumentDownload,
  DocumentUpload,
  SearchNormal1,
  Filter,
} from "iconsax-react";
import Button from "../../../components/actions/button";
import ActionConfirmationModal from "../../../components/modals/ActionConfirmationModal";
import { ExportModal, ImportModal } from "../../../components/export-import";
import { useToast } from "../../../context/toast-context";
import { useTheme } from "../../../context/theme-context";
import { cn } from "../../../lib/utils";

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

interface ThemeGroup {
  id: string;
  name: string;
  color: string;
  themes: Theme[];
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
  isUsedInVideo: boolean;
}

const ExtractsPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { theme } = useTheme();
  const [selectedThemeId, setSelectedThemeId] = useState<string | undefined>();
  const [selectedThemeGroupId, setSelectedThemeGroupId] = useState<string | undefined>();
  const [filterType, setFilterType] = useState<"all" | "mini-theme" | "theme-group">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [extractToDelete, setExtractToDelete] = useState<{ id: string; text: string } | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedExtracts, setSelectedExtracts] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectionModeType, setSelectionModeType] = useState<"video" | "export">("video");

  const { data: themesData } = useQuery(GET_THEMES);
  const { data: themeGroupsData } = useQuery(GET_THEME_GROUPS);
  const { data, loading, refetch } = useQuery(GET_EXTRACTS, {
    variables: {
      themeId: filterType === "mini-theme" ? selectedThemeId : undefined,
    },
  });

  const [deleteExtract, { loading: deleting }] = useMutation(DELETE_EXTRACT, {
    onCompleted: () => {
      refetch();
      setShowDeleteModal(false);
      setExtractToDelete(null);
      toast.success("Extrait supprimé", "L'extrait a été supprimé avec succès");
    },
    onError: (error) => {
      console.error("Error deleting extract:", error);
      toast.error("Échec de la suppression", error.message || "Veuillez réessayer");
    },
  });

  const handleDeleteClick = (id: string, text: string) => {
    setExtractToDelete({ id, text });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (extractToDelete) {
      deleteExtract({ variables: { id: extractToDelete.id } });
    }
  };

  const toggleExtractSelection = (extractId: string, isUsedInVideo: boolean) => {
    if (selectionModeType === "video" && isUsedInVideo) {
      toast.error("Extrait déjà utilisé", "Cet extrait est déjà utilisé dans une vidéo et ne peut pas être sélectionné");
      return;
    }

    setSelectedExtracts((prev) =>
      prev.includes(extractId) ? prev.filter((id) => id !== extractId) : [...prev, extractId]
    );
  };

  const handleCreateVideo = () => {
    if (selectedExtracts.length === 0) {
      toast.error("Aucun extrait sélectionné", "Veuillez sélectionner au moins un extrait pour créer une vidéo");
      return;
    }
    navigate("/dashboard/video/builder", {
      state: { extractIds: selectedExtracts },
    });
  };

  const handleAnnulerSelection = () => {
    setIsSelectionMode(false);
    setSelectedExtracts([]);
    setSelectionModeType("video");
  };

  const handleStartExporterSelection = () => {
    setSelectionModeType("export");
    setIsSelectionMode(true);
    setSelectedExtracts([]);
  };

  const handleExporterSelected = () => {
    if (selectedExtracts.length === 0) {
      toast.error("Aucun extrait sélectionné", "Veuillez sélectionner au moins un extrait à exporter");
      return;
    }
    setShowExportModal(true);
  };

  const handleExportComplete = () => {
    setShowExportModal(false);
    setIsSelectionMode(false);
    setSelectedExtracts([]);
    setSelectionModeType("video");
  };

  const handleImportComplete = () => {
    setShowImportModal(false);
    refetch();
  };

  const themes: Theme[] = useMemo(() => themesData?.themes || [], [themesData]);
  const themeGroups: ThemeGroup[] = useMemo(() => themeGroupsData?.themeGroups || [], [themeGroupsData]);
  const extracts: Extract[] = useMemo(() => data?.extracts || [], [data]);

  const selectedThemeGroupThemeIds = useMemo(() => {
    if (filterType === "theme-group" && selectedThemeGroupId) {
      const group = themeGroups.find((g) => g.id === selectedThemeGroupId);
      return group ? group.themes.map((t) => t.id) : [];
    }
    return [];
  }, [filterType, selectedThemeGroupId, themeGroups]);

  const filteredExtracts = useMemo(() => {
    let filtered = extracts;

    if (filterType === "theme-group" && selectedThemeGroupThemeIds.length > 0) {
      filtered = filtered.filter(
        (extract) => extract.theme && selectedThemeGroupThemeIds.includes(extract.theme.id)
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (extract) =>
          extract.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          extract.animeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          extract.characters.some((char) => char.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  }, [extracts, filterType, selectedThemeGroupThemeIds, searchQuery]);

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1
            className={cn(
              "text-2xl md:text-3xl font-bold mb-2",
              theme === "dark" ? "text-white" : "text-gray-900"
            )}
          >
            Tous les Extraits
          </h1>
          <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
            {isSelectionMode
              ? selectionModeType === "export"
                ? `${selectedExtracts.length} extrait${selectedExtracts.length !== 1 ? "s" : ""} sélectionné${selectedExtracts.length !== 1 ? "s" : ""} pour l'export`
                : `${selectedExtracts.length} extrait${selectedExtracts.length !== 1 ? "s" : ""} sélectionné${selectedExtracts.length !== 1 ? "s" : ""} pour la vidéo`
              : "Parcourir et gérer vos extraits anime"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isSelectionMode ? (
            selectionModeType === "export" ? (
              <>
                <Button
                  onClick={handleAnnulerSelection}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all",
                    theme === "dark"
                      ? "bg-white/5 text-gray-300 hover:bg-white/10"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  <CloseCircle size={18} variant="Bold" color={theme === "dark" ? "#9ca3af" : "#374151"} />
                  Annuler
                </Button>
                <Button
                  onClick={handleExporterSelected}
                  disabled={selectedExtracts.length === 0}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <DocumentDownload size={18} variant="Bold" color="#ffffff" />
                  Exporter ({selectedExtracts.length})
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleAnnulerSelection}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all",
                    theme === "dark"
                      ? "bg-white/5 text-gray-300 hover:bg-white/10"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  <CloseCircle size={18} variant="Bold" color={theme === "dark" ? "#9ca3af" : "#374151"} />
                  Annuler
                </Button>
                <Button
                  onClick={handleCreateVideo}
                  disabled={selectedExtracts.length === 0}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TickCircle size={18} variant="Bold" color="#ffffff" />
                  Continuer ({selectedExtracts.length})
                </Button>
              </>
            )
          ) : (
            <>
              <Button
                onClick={() => setShowImportModal(true)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all",
                  theme === "dark"
                    ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                    : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                )}
              >
                <DocumentUpload size={18} variant="Bold" color={theme === "dark" ? "#34d399" : "#059669"} />
                Importer
              </Button>
              <Button
                onClick={handleStartExporterSelection}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all",
                  theme === "dark"
                    ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                    : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                )}
              >
                <DocumentDownload size={18} variant="Bold" color={theme === "dark" ? "#fbbf24" : "#d97706"} />
                Exporter
              </Button>
              <Button
                onClick={() => {
                  setSelectionModeType("video");
                  setIsSelectionMode(true);
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all",
                  theme === "dark"
                    ? "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                    : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                )}
              >
                <VideoPlay size={18} variant="Bold" color={theme === "dark" ? "#a855f7" : "#9333ea"} />
                Créer une Vidéo
              </Button>
              <Button
                onClick={() => navigate("/dashboard/extracts/new")}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-purple-500/25"
              >
                <Add size={18} variant="Bold" color="#ffffff" />
                Nouvel Extrait
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div
        className={cn(
          "mb-6 p-4 rounded-2xl border transition-colors",
          theme === "dark" ? "bg-[#12121a] border-gray-800" : "bg-white border-gray-200"
        )}
      >
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <SearchNormal1
              size={20}
              color={theme === "dark" ? "#6b7280" : "#9ca3af"}
              className="absolute left-4 top-1/2 -translate-y-1/2"
            />
            <input
              type="text"
              placeholder="Rechercher par texte, anime ou personnage..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-12 pr-4 py-3 rounded-xl border transition-all",
                theme === "dark"
                  ? "bg-white/5 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              )}
            />
          </div>

          {/* Theme Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                className={cn(
                  "flex items-center gap-2 text-sm font-medium mb-2",
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                )}
              >
                <Filter size={16} color={theme === "dark" ? "#9ca3af" : "#6b7280"} />
                Filtrer par
              </label>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as "all" | "mini-theme" | "theme-group");
                  setSelectedThemeId(undefined);
                  setSelectedThemeGroupId(undefined);
                }}
                className={cn(
                  "w-full px-4 py-3 rounded-xl border transition-all appearance-none cursor-pointer",
                  theme === "dark"
                    ? "bg-white/5 border-gray-700 text-white focus:border-purple-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-500"
                )}
              >
                <option value="all">Tous les extraits</option>
                <option value="mini-theme">Mini-Thème</option>
                <option value="theme-group">Groupe de Thème</option>
              </select>
            </div>

            {filterType === "mini-theme" && (
              <div className="md:col-span-2">
                <label
                  className={cn(
                    "block text-sm font-medium mb-2",
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  Sélectionner un mini-thème
                </label>
                <select
                  value={selectedThemeId || ""}
                  onChange={(e) => setSelectedThemeId(e.target.value || undefined)}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border transition-all appearance-none cursor-pointer",
                    theme === "dark"
                      ? "bg-white/5 border-gray-700 text-white focus:border-purple-500"
                      : "bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-500"
                  )}
                >
                  <option value="">Tous les mini-thèmes</option>
                  {themes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {filterType === "theme-group" && (
              <div className="md:col-span-2">
                <label
                  className={cn(
                    "block text-sm font-medium mb-2",
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  Sélectionner un groupe de thème
                </label>
                <select
                  value={selectedThemeGroupId || ""}
                  onChange={(e) => setSelectedThemeGroupId(e.target.value || undefined)}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border transition-all appearance-none cursor-pointer",
                    theme === "dark"
                      ? "bg-white/5 border-gray-700 text-white focus:border-purple-500"
                      : "bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-500"
                  )}
                >
                  <option value="">Tous les groupes de thème</option>
                  {themeGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.themes.length} mini-thèmes)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredExtracts.length === 0 && (
        <div
          className={cn(
            "rounded-2xl border p-12 text-center transition-colors",
            theme === "dark" ? "bg-[#12121a] border-gray-800" : "bg-white border-gray-200"
          )}
        >
          <div className="max-w-md mx-auto flex flex-col items-center">
            <div
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mb-4",
                theme === "dark" ? "bg-white/5" : "bg-gray-100"
              )}
            >
              <Add size={32} color={theme === "dark" ? "#6b7280" : "#9ca3af"} />
            </div>
            <h3
              className={cn(
                "text-lg font-semibold mb-2",
                theme === "dark" ? "text-white" : "text-gray-900"
              )}
            >
              {searchQuery || selectedThemeId ? "Aucun extrait trouvé" : "Aucun extrait"}
            </h3>
            <p className={cn("mb-6", theme === "dark" ? "text-gray-400" : "text-gray-600")}>
              {searchQuery || selectedThemeId
                ? "Essayez d'ajuster vos filtres ou votre recherche"
                : "Créez votre premier extrait pour commencer votre collection"}
            </p>
            <Button
              onClick={() => navigate("/dashboard/extracts/new")}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-purple-500/25"
            >
              Créer un Extrait
            </Button>
          </div>
        </div>
      )}

      {/* Extracts Grid */}
      {!loading && filteredExtracts.length > 0 && (
        <div>
          <div className={cn("mb-4 text-sm", theme === "dark" ? "text-gray-500" : "text-gray-500")}>
            {filteredExtracts.length} extrait{filteredExtracts.length > 1 ? "s" : ""} trouvé{filteredExtracts.length > 1 ? "s" : ""}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredExtracts.map((extract) => {
              const isSelected = selectedExtracts.includes(extract.id);
              const isUsed = extract.isUsedInVideo;
              const isDisabled = isSelectionMode && selectionModeType === "video" && isUsed;
              const canClick = isSelectionMode && (selectionModeType === "export" || !isUsed);

              return (
                <div
                  key={extract.id}
                  onClick={() => canClick && toggleExtractSelection(extract.id, isUsed)}
                  className={cn(
                    "rounded-2xl border-2 overflow-hidden transition-all",
                    canClick && "cursor-pointer",
                    isDisabled && "opacity-50 cursor-not-allowed",
                    isSelected
                      ? selectionModeType === "export"
                        ? "border-amber-500 ring-2 ring-amber-500/20"
                        : "border-purple-500 ring-2 ring-purple-500/20"
                      : theme === "dark"
                      ? "bg-[#12121a] border-gray-800 hover:border-gray-700"
                      : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
                  )}
                >
                  {/* Theme Bar */}
                  {extract.theme && (
                    <div className="h-1.5" style={{ backgroundColor: extract.theme.color }} />
                  )}

                  <div className="p-5">
                    {/* Selection Indicator */}
                    {isSelectionMode && (
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                              isSelected
                                ? selectionModeType === "export"
                                  ? "bg-amber-500 border-amber-500"
                                  : "bg-purple-500 border-purple-500"
                                : isDisabled
                                ? theme === "dark"
                                  ? "border-gray-600 bg-gray-700"
                                  : "border-gray-300 bg-gray-200"
                                : theme === "dark"
                                ? "border-gray-600"
                                : "border-gray-300"
                            )}
                          >
                            {isSelected && <TickCircle size={14} variant="Bold" color="#ffffff" />}
                          </div>
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isSelected
                                ? selectionModeType === "export"
                                  ? "text-amber-500"
                                  : "text-purple-500"
                                : theme === "dark"
                                ? "text-gray-500"
                                : "text-gray-500"
                            )}
                          >
                            {isSelected
                              ? "Sélectionné"
                              : isDisabled
                              ? "Déjà utilisé"
                              : "Cliquer pour sélectionner"}
                          </span>
                        </div>
                        {isUsed && selectionModeType === "video" && (
                          <span
                            className={cn(
                              "px-2 py-1 rounded-lg text-xs font-medium",
                              theme === "dark"
                                ? "bg-orange-500/10 text-orange-400"
                                : "bg-orange-100 text-orange-700"
                            )}
                          >
                            Dans une vidéo
                          </span>
                        )}
                      </div>
                    )}

                    {/* Anime Info */}
                    <div className="flex gap-4 mb-4">
                      {extract.animeImage && (
                        <img
                          src={extract.animeImage}
                          alt={extract.animeTitle}
                          className="w-14 h-20 object-cover rounded-xl"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3
                          className={cn(
                            "text-base font-bold mb-1 truncate",
                            theme === "dark" ? "text-white" : "text-gray-900"
                          )}
                        >
                          {extract.animeTitle}
                        </h3>
                        {extract.theme && (
                          <div
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium text-white mb-2"
                            style={{ backgroundColor: extract.theme.color }}
                          >
                            {extract.theme.name}
                          </div>
                        )}
                        <div
                          className={cn(
                            "flex flex-wrap gap-3 text-xs",
                            theme === "dark" ? "text-gray-500" : "text-gray-500"
                          )}
                        >
                          {extract.episode && (
                            <div className="flex items-center gap-1">
                              <Calendar size={12} color={theme === "dark" ? "#6b7280" : "#6b7280"} />
                              <span>Ep. {extract.episode}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock size={12} color={theme === "dark" ? "#6b7280" : "#6b7280"} />
                            <span>
                              {extract.timing.start} - {extract.timing.end}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Extract Text */}
                    <div
                      className={cn(
                        "mb-4 p-3 rounded-xl",
                        theme === "dark" ? "bg-white/5" : "bg-gray-50"
                      )}
                    >
                      <p
                        className={cn(
                          "italic line-clamp-3 text-sm",
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        )}
                      >
                        "{extract.text}"
                      </p>
                    </div>

                    {/* Characters */}
                    {extract.characters.length > 0 && (
                      <div className="mb-4">
                        <div
                          className={cn(
                            "flex items-center gap-2 text-xs mb-2",
                            theme === "dark" ? "text-gray-500" : "text-gray-500"
                          )}
                        >
                          <Profile2User size={12} color={theme === "dark" ? "#6b7280" : "#6b7280"} />
                          <span>Personnages :</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {extract.characters.map((char) => (
                            <div
                              key={char.malId}
                              className={cn(
                                "flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium",
                                theme === "dark"
                                  ? "bg-purple-500/10 text-purple-400"
                                  : "bg-purple-50 text-purple-700"
                              )}
                            >
                              {char.image && (
                                <img
                                  src={char.image}
                                  alt={char.name}
                                  className="w-4 h-4 rounded-full object-cover"
                                />
                              )}
                              <span>{char.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {!isSelectionMode && (
                      <div
                        className={cn(
                          "flex gap-2 pt-4 border-t",
                          theme === "dark" ? "border-gray-800" : "border-gray-100"
                        )}
                      >
                        <button
                          onClick={() => navigate(`/dashboard/extracts/${extract.id}/edit`)}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-colors",
                            theme === "dark"
                              ? "text-purple-400 bg-purple-500/10 hover:bg-purple-500/20"
                              : "text-purple-600 bg-purple-50 hover:bg-purple-100"
                          )}
                        >
                          <Edit2 size={16} variant="Bold" color={theme === "dark" ? "#a855f7" : "#9333ea"} />
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteClick(extract.id, extract.text)}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-colors",
                            theme === "dark"
                              ? "text-red-400 bg-red-500/10 hover:bg-red-500/20"
                              : "text-red-600 bg-red-50 hover:bg-red-100"
                          )}
                        >
                          <Trash size={16} variant="Bold" color={theme === "dark" ? "#f87171" : "#dc2626"} />
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ActionConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setExtractToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer l'Extrait"
        message={`Êtes-vous sûr de vouloir supprimer cet extrait ? Cette action est irréversible.\n\n"${extractToDelete?.text.substring(0, 80)}${extractToDelete && extractToDelete.text.length > 80 ? "..." : ""}"`}
        type="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
        loading={deleting}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={handleExportComplete}
        exportType="extracts"
        selectedIds={selectedExtracts}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={handleImportComplete}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
};

export default ExtractsPage;
