import { useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { DocumentDownload, CloseCircle, TickCircle, Tag, Category, Document } from "iconsax-react";
import Button from "../actions/button";
import SpinLoader from "../SpinLoader";
import { useToast } from "../../context/toast-context";
import {
  EXPORT_THEMES,
  EXPORT_THEME_GROUPS,
  EXPORT_EXTRACTS,
  EXPORT_ALL,
} from "../../lib/graphql/queries";

type ExportType = "themes" | "themeGroups" | "extracts" | "all";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportType: ExportType;
  selectedIds: string[];
}

export default function ExportModal({
  isOpen,
  onClose,
  exportType,
  selectedIds,
}: ExportModalProps) {
  const { success, error: showError } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const [exportThemes] = useLazyQuery(EXPORT_THEMES);
  const [exportThemeGroups] = useLazyQuery(EXPORT_THEME_GROUPS);
  const [exportExtracts] = useLazyQuery(EXPORT_EXTRACTS);
  const [exportAll] = useLazyQuery(EXPORT_ALL);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const downloadJson = (data: string, fileName: string) => {
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      let result;

      switch (exportType) {
        case "themes":
          result = await exportThemes({ variables: { themeIds: selectedIds } });
          if (result.data?.exportThemes) {
            downloadJson(
              result.data.exportThemes.data,
              result.data.exportThemes.fileName
            );
            success(
              `Export réussi: ${result.data.exportThemes.metadata.totalThemes} thème(s), ${result.data.exportThemes.metadata.totalExtracts} extrait(s)`
            );
          }
          break;

        case "themeGroups":
          result = await exportThemeGroups({
            variables: { themeGroupIds: selectedIds },
          });
          if (result.data?.exportThemeGroups) {
            downloadJson(
              result.data.exportThemeGroups.data,
              result.data.exportThemeGroups.fileName
            );
            success(
              `Export réussi: ${result.data.exportThemeGroups.metadata.totalThemeGroups} groupe(s), ${result.data.exportThemeGroups.metadata.totalThemes} thème(s), ${result.data.exportThemeGroups.metadata.totalExtracts} extrait(s)`
            );
          }
          break;

        case "extracts":
          result = await exportExtracts({
            variables: { extractIds: selectedIds },
          });
          if (result.data?.exportExtracts) {
            downloadJson(
              result.data.exportExtracts.data,
              result.data.exportExtracts.fileName
            );
            success(
              `Export réussi: ${result.data.exportExtracts.metadata.totalExtracts} extrait(s), ${result.data.exportExtracts.metadata.totalThemes} thème(s)`
            );
          }
          break;

        case "all":
          result = await exportAll();
          if (result.data?.exportAll) {
            downloadJson(
              result.data.exportAll.data,
              result.data.exportAll.fileName
            );
            success(
              `Export complet réussi: ${result.data.exportAll.metadata.totalThemes} thème(s), ${result.data.exportAll.metadata.totalThemeGroups} groupe(s), ${result.data.exportAll.metadata.totalExtracts} extrait(s)`
            );
          }
          break;
      }

      onClose();
    } catch (error) {
      console.error("Export error:", error);
      showError(
        `Erreur lors de l'export: ${error instanceof Error ? error.message : "Erreur inconnue"}`
      );
    } finally {
      setIsExporting(false);
    }
  };

  const getExportInfo = () => {
    switch (exportType) {
      case "themes":
        return {
          title: "Exporter les Mini-thèmes",
          icon: <Tag size={24} color="#3B82F6" variant="Bold" />,
          description: `${selectedIds.length} mini-thème(s) sélectionné(s). Les extraits associés seront inclus dans l'export.`,
        };
      case "themeGroups":
        return {
          title: "Exporter les Groupes de thèmes",
          icon: <Category size={24} color="#8B5CF6" variant="Bold" />,
          description: `${selectedIds.length} groupe(s) sélectionné(s). Les mini-thèmes et extraits associés seront inclus dans l'export.`,
        };
      case "extracts":
        return {
          title: "Exporter les Extraits",
          icon: <Document size={24} color="#10B981" variant="Bold" />,
          description: `${selectedIds.length} extrait(s) sélectionné(s). Les mini-thèmes associés seront inclus dans l'export.`,
        };
      case "all":
        return {
          title: "Exporter toutes les données",
          icon: <DocumentDownload size={24} color="#F59E0B" variant="Bold" />,
          description:
            "Tous les thèmes, groupes de thèmes et extraits seront exportés.",
        };
    }
  };

  const info = getExportInfo();

  return (
    <div
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-blue-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-blue-50">{info.icon}</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {info.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{info.description}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <CloseCircle size={20} color="#6B7280" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
            <TickCircle size={20} color="#3B82F6" variant="Bold" />
            <p className="text-sm text-blue-800">
              Le fichier sera téléchargé au format JSON et pourra être importé
              ultérieurement.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 flex items-center justify-end space-x-3">
          <Button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Annuler
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || (exportType !== "all" && selectedIds.length === 0)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <SpinLoader size={18} />
                <span>Export en cours...</span>
              </>
            ) : (
              <>
                <DocumentDownload size={18} color="#FFFFFF" />
                <span>Exporter</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
