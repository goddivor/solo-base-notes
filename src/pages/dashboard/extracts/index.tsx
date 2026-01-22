import { useState, useMemo, useEffect } from "react";
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
  Grid2,
  Element3,
  RowVertical,
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
  const [viewMode, setViewMode] = useState<"detailed" | "card" | "list">(() => {
    const saved = localStorage.getItem("extracts-view-mode");
    return (saved as "detailed" | "card" | "list") || "detailed";
  });

  // Persist view mode to localStorage
  useEffect(() => {
    localStorage.setItem("extracts-view-mode", viewMode);
  }, [viewMode]);

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
          {/* Results Header with View Toggle */}
          <div className="mb-4 flex items-center justify-between">
            <div className={cn("text-sm", theme === "dark" ? "text-gray-500" : "text-gray-500")}>
              {filteredExtracts.length} extrait{filteredExtracts.length > 1 ? "s" : ""} trouvé{filteredExtracts.length > 1 ? "s" : ""}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode("detailed")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "detailed"
                    ? theme === "dark"
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-purple-100 text-purple-600"
                    : theme === "dark"
                    ? "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                    : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                )}
                title="Vue détaillée"
              >
                <Element3 size={20} variant={viewMode === "detailed" ? "Bold" : "Outline"} color={viewMode === "detailed" ? (theme === "dark" ? "#a855f7" : "#9333ea") : (theme === "dark" ? "#6b7280" : "#9ca3af")} />
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "card"
                    ? theme === "dark"
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-purple-100 text-purple-600"
                    : theme === "dark"
                    ? "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                    : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                )}
                title="Vue carte"
              >
                <Grid2 size={20} variant={viewMode === "card" ? "Bold" : "Outline"} color={viewMode === "card" ? (theme === "dark" ? "#a855f7" : "#9333ea") : (theme === "dark" ? "#6b7280" : "#9ca3af")} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "list"
                    ? theme === "dark"
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-purple-100 text-purple-600"
                    : theme === "dark"
                    ? "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                    : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                )}
                title="Vue liste"
              >
                <RowVertical size={20} variant={viewMode === "list" ? "Bold" : "Outline"} color={viewMode === "list" ? (theme === "dark" ? "#a855f7" : "#9333ea") : (theme === "dark" ? "#6b7280" : "#9ca3af")} />
              </button>
            </div>
          </div>

          {/* Detailed View (Original) */}
          {viewMode === "detailed" && (
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
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3
                            className={cn(
                              "text-base font-bold truncate",
                              theme === "dark" ? "text-white" : "text-gray-900"
                            )}
                          >
                            {extract.animeTitle}
                          </h3>
                          {/* Video Usage Badge - Hidden in video selection mode to avoid duplicate */}
                          {isUsed && !(isSelectionMode && selectionModeType === "video") && (
                            <span
                              className={cn(
                                "flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium",
                                theme === "dark"
                                  ? "bg-green-500/10 text-green-400"
                                  : "bg-green-100 text-green-700"
                              )}
                            >
                              <VideoPlay size={12} variant="Bold" color={theme === "dark" ? "#4ade80" : "#15803d"} />
                              Dans une vidéo
                            </span>
                          )}
                        </div>
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
          )}

          {/* Card View (Compact Visual Cards) */}
          {viewMode === "card" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredExtracts.map((extract, index) => {
              const isSelected = selectedExtracts.includes(extract.id);
              const isUsed = extract.isUsedInVideo;
              const isDisabled = isSelectionMode && selectionModeType === "video" && isUsed;
              const canClick = isSelectionMode && (selectionModeType === "export" || !isUsed);

              // Calculate tooltip position based on card position in responsive grid
              // Mobile: 2 cols, sm: 3 cols, lg: 4 cols, xl: 5 cols
              const isRightSideMobile = index % 2 === 1;
              const isRightSideSm = index % 3 >= 2;
              const isRightSideLg = index % 4 >= 2;
              const isRightSideXl = index % 5 >= 3;

              return (
                <div
                  key={extract.id}
                  className="relative group/card"
                >
                  {/* Main Card */}
                  <div
                    onClick={() => canClick && toggleExtractSelection(extract.id, isUsed)}
                    className={cn(
                      "relative rounded-2xl overflow-hidden transition-all aspect-[3/4]",
                      canClick && "cursor-pointer",
                      isDisabled && "opacity-50 cursor-not-allowed",
                      isSelected
                        ? selectionModeType === "export"
                          ? "ring-2 ring-amber-500"
                          : "ring-2 ring-purple-500"
                        : theme === "dark"
                        ? "bg-[#12121a] hover:ring-1 hover:ring-gray-700"
                        : "bg-white hover:ring-1 hover:ring-gray-300 shadow-sm hover:shadow-md"
                    )}
                  >
                    {/* Background Image */}
                    {extract.animeImage && (
                      <div className="absolute inset-0">
                        <img
                          src={extract.animeImage}
                          alt={extract.animeTitle}
                          className="w-full h-full object-cover"
                        />
                        <div className={cn(
                          "absolute inset-0",
                          theme === "dark"
                            ? "bg-gradient-to-t from-black/90 via-black/50 to-transparent"
                            : "bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                        )} />
                      </div>
                    )}

                    {/* Selection Indicator */}
                    {isSelectionMode && (
                      <div className="absolute top-2 right-2 z-10">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                            isSelected
                              ? selectionModeType === "export"
                                ? "bg-amber-500 border-amber-500"
                                : "bg-purple-500 border-purple-500"
                              : "border-white/50 bg-black/30"
                          )}
                        >
                          {isSelected && <TickCircle size={14} variant="Bold" color="#ffffff" />}
                        </div>
                      </div>
                    )}

                    {/* Used Badge */}
                    {isUsed && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-orange-500/80 text-white">
                          Utilisé
                        </span>
                      </div>
                    )}

                    {/* Theme Bar */}
                    {extract.theme && (
                      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: extract.theme.color }} />
                    )}

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      {/* Theme Badge */}
                      {extract.theme && (
                        <span
                          className="inline-block px-2 py-0.5 rounded-lg text-[10px] font-medium text-white mb-2"
                          style={{ backgroundColor: extract.theme.color }}
                        >
                          {extract.theme.name}
                        </span>
                      )}

                      {/* Anime Title */}
                      <h3 className="text-white text-sm font-bold mb-1 line-clamp-1">
                        {extract.animeTitle}
                      </h3>

                      {/* Quote Preview */}
                      <p className="text-white/80 text-xs italic line-clamp-2 mb-2">
                        "{extract.text}"
                      </p>

                      {/* Episode & Time */}
                      <div className="flex items-center gap-2 text-[10px] text-white/60">
                        {extract.episode && <span>Ep. {extract.episode}</span>}
                        <span>{extract.timing.start}</span>
                      </div>
                    </div>

                    {/* Hover Actions */}
                    {!isSelectionMode && (
                      <div className={cn(
                        "absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover/card:opacity-100 transition-all",
                        theme === "dark" ? "bg-black/60" : "bg-black/50"
                      )}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/extracts/${extract.id}/edit`);
                          }}
                          className="p-2 rounded-xl bg-purple-500 text-white hover:bg-purple-400 transition-colors"
                        >
                          <Edit2 size={18} variant="Bold" color="#ffffff" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(extract.id, extract.text);
                          }}
                          className="p-2 rounded-xl bg-red-500 text-white hover:bg-red-400 transition-colors"
                        >
                          <Trash size={18} variant="Bold" color="#ffffff" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Tooltip with full details */}
                  <div className={cn(
                    "absolute top-0 bottom-0 w-72 sm:w-80 p-3 rounded-2xl border z-50",
                    "opacity-0 invisible group-hover/card:opacity-100 group-hover/card:visible",
                    "transition-all duration-200 pointer-events-none overflow-hidden flex flex-col",
                    // Position: right side by default, left side when card is on the right
                    isRightSideMobile ? "right-full mr-3" : "left-full ml-3",
                    isRightSideSm ? "sm:right-full sm:mr-3 sm:left-auto sm:ml-0" : "sm:left-full sm:ml-3 sm:right-auto sm:mr-0",
                    isRightSideLg ? "lg:right-full lg:mr-3 lg:left-auto lg:ml-0" : "lg:left-full lg:ml-3 lg:right-auto lg:mr-0",
                    isRightSideXl ? "xl:right-full xl:mr-3 xl:left-auto xl:ml-0" : "xl:left-full xl:ml-3 xl:right-auto xl:mr-0",
                    theme === "dark"
                      ? "bg-[#1a1a25] border-gray-700 shadow-xl shadow-black/50"
                      : "bg-white border-gray-200 shadow-xl"
                  )}>
                    {/* Content layout - fills height */}
                    <div className="flex flex-col flex-1 min-h-0">
                      {/* Title + Theme + Episode */}
                      <div className="mb-2 flex-shrink-0">
                        <h4 className={cn(
                          "font-bold text-sm leading-tight mb-1",
                          theme === "dark" ? "text-white" : "text-gray-900"
                        )}>
                          {extract.animeTitle}
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap">
                          {extract.theme && (
                            <span
                              className="inline-block px-2 py-0.5 rounded text-[10px] font-medium text-white"
                              style={{ backgroundColor: extract.theme.color }}
                            >
                              {extract.theme.name}
                            </span>
                          )}
                          <span className={cn(
                            "text-[10px]",
                            theme === "dark" ? "text-gray-500" : "text-gray-500"
                          )}>
                            {extract.episode && `Ep. ${extract.episode} • `}{extract.timing.start} - {extract.timing.end}
                          </span>
                        </div>
                      </div>

                      {/* Quote - scrollable, fills remaining space */}
                      <div className={cn(
                        "flex-1 p-2 rounded-lg overflow-y-auto min-h-0",
                        theme === "dark" ? "bg-white/5" : "bg-gray-50"
                      )}>
                        <p className={cn(
                          "text-xs italic leading-relaxed",
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        )}>
                          "{extract.text}"
                        </p>
                      </div>

                      {/* Bottom section */}
                      <div className="flex-shrink-0 mt-2 space-y-2">
                        {/* Characters with images */}
                        {extract.characters.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {extract.characters.map((char) => (
                              <div
                                key={char.malId}
                                className={cn(
                                  "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium",
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
                        )}

                        {/* Status */}
                        <div className="flex items-center gap-2">
                          {isUsed && (
                            <span className={cn(
                              "px-1.5 py-0.5 rounded text-[9px] font-medium",
                              theme === "dark" ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-700"
                            )}>
                              Utilisé
                            </span>
                          )}
                          {extract.createdAt && (
                            <span className={cn(
                              "text-[9px]",
                              theme === "dark" ? "text-gray-600" : "text-gray-400"
                            )}>
                              {(() => {
                                const date = new Date(Number(extract.createdAt) || extract.createdAt);
                                return isNaN(date.getTime()) ? '' : date.toLocaleDateString('fr-FR');
                              })()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}

          {/* List View (Table-like) */}
          {viewMode === "list" && (
          <div className={cn(
            "rounded-2xl border overflow-hidden",
            theme === "dark" ? "bg-[#12121a] border-gray-800" : "bg-white border-gray-200"
          )}>
            {/* Table Header */}
            <div className={cn(
              "hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold uppercase tracking-wide",
              theme === "dark" ? "bg-white/5 text-gray-500 border-b border-gray-800" : "bg-gray-50 text-gray-500 border-b border-gray-200"
            )}>
              <div className="col-span-2">Anime</div>
              <div className="col-span-3">Extrait</div>
              <div className="col-span-2">Personnages</div>
              <div className="col-span-2">Thème</div>
              <div className="col-span-2">Épisode</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Table Body */}
            <div className={cn(
              "divide-y",
              theme === "dark" ? "divide-gray-800" : "divide-gray-200"
            )}>
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
                      "flex flex-col lg:grid lg:grid-cols-12 gap-4 px-4 py-4 transition-all",
                      canClick && "cursor-pointer",
                      isDisabled && "opacity-50 cursor-not-allowed",
                      isSelected
                        ? selectionModeType === "export"
                          ? "bg-amber-500/10"
                          : "bg-purple-500/10"
                        : theme === "dark"
                        ? "hover:bg-white/5"
                        : "hover:bg-gray-50"
                    )}
                  >
                    {/* Anime: Image + Title */}
                    <div className="col-span-2 flex items-center gap-3">
                      {isSelectionMode && (
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                            isSelected
                              ? selectionModeType === "export"
                                ? "bg-amber-500 border-amber-500"
                                : "bg-purple-500 border-purple-500"
                              : theme === "dark"
                              ? "border-gray-600"
                              : "border-gray-300"
                          )}
                        >
                          {isSelected && <TickCircle size={12} variant="Bold" color="#ffffff" />}
                        </div>
                      )}
                      {extract.animeImage && (
                        <img
                          src={extract.animeImage}
                          alt={extract.animeTitle}
                          className="w-14 h-20 object-cover rounded-xl flex-shrink-0 shadow-lg"
                        />
                      )}
                      <div className="min-w-0">
                        <h3 className={cn(
                          "text-sm font-semibold line-clamp-2",
                          theme === "dark" ? "text-white" : "text-gray-900"
                        )}>
                          {extract.animeTitle}
                        </h3>
                        {isUsed && (
                          <span className={cn(
                            "inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium",
                            theme === "dark" ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-700"
                          )}>
                            Utilisé
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Extract Text */}
                    <div className="col-span-3 flex items-center">
                      <p className={cn(
                        "text-sm italic line-clamp-3",
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      )}>
                        "{extract.text}"
                      </p>
                    </div>

                    {/* Characters */}
                    <div className="col-span-2 flex items-center">
                      {extract.characters.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {extract.characters.map((char) => (
                            <div
                              key={char.malId}
                              className={cn(
                                "flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-medium",
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
                              <span className="truncate max-w-[60px]">{char.name}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className={cn(
                          "text-xs",
                          theme === "dark" ? "text-gray-600" : "text-gray-400"
                        )}>
                          —
                        </span>
                      )}
                    </div>

                    {/* Theme */}
                    <div className="col-span-2 flex items-center">
                      {extract.theme ? (
                        <span
                          className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium text-white"
                          style={{ backgroundColor: extract.theme.color }}
                        >
                          {extract.theme.name}
                        </span>
                      ) : (
                        <span className={cn(
                          "text-xs",
                          theme === "dark" ? "text-gray-600" : "text-gray-400"
                        )}>
                          —
                        </span>
                      )}
                    </div>

                    {/* Episode & Time */}
                    <div className="col-span-2 flex items-center">
                      <div>
                        <div className={cn(
                          "text-sm font-medium",
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        )}>
                          {extract.episode ? `Épisode ${extract.episode}` : "—"}
                        </div>
                        <div className={cn(
                          "text-xs",
                          theme === "dark" ? "text-gray-500" : "text-gray-500"
                        )}>
                          {extract.timing.start} - {extract.timing.end}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex items-center justify-end">
                      {!isSelectionMode && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/dashboard/extracts/${extract.id}/edit`);
                            }}
                            className={cn(
                              "p-2 rounded-lg transition-colors",
                              theme === "dark"
                                ? "text-purple-400 hover:bg-purple-500/20"
                                : "text-purple-600 hover:bg-purple-50"
                            )}
                          >
                            <Edit2 size={16} variant="Bold" color={theme === "dark" ? "#a855f7" : "#9333ea"} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(extract.id, extract.text);
                            }}
                            className={cn(
                              "p-2 rounded-lg transition-colors",
                              theme === "dark"
                                ? "text-red-400 hover:bg-red-500/20"
                                : "text-red-600 hover:bg-red-50"
                            )}
                          >
                            <Trash size={16} variant="Bold" color={theme === "dark" ? "#f87171" : "#dc2626"} />
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
