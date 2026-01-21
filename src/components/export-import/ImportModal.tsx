import { useState, useCallback } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  DocumentUpload,
  CloseCircle,
  TickCircle,
  Warning2,
  ArrowLeft,
  ArrowRight,
  Tag,
  Category,
  Document,
} from "iconsax-react";
import Button from "../actions/button";
import SpinLoader from "../SpinLoader";
import { useToast } from "../../context/toast-context";
import { useTheme } from "../../context/theme-context";
import { cn } from "../../lib/utils";
import { PREVIEW_IMPORT } from "../../lib/graphql/queries";
import { EXECUTE_IMPORT } from "../../lib/graphql/mutations";
import ConflictResolutionCard from "./ConflictResolutionCard";

type ConflictResolution = "REUSE_EXISTING" | "CREATE_DUPLICATE" | "SKIP";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface ImportConflict {
  type: "THEME_NAME_EXISTS" | "THEME_GROUP_NAME_EXISTS";
  importedItem: {
    id: string | null;
    name: string;
    description: string | null;
    color: string | null;
  };
  existingItem: {
    id: string | null;
    name: string;
    description: string | null;
    color: string | null;
  };
}

interface ImportPreviewData {
  themes: {
    originalId: string;
    name: string;
    description: string | null;
    color: string;
    extractCount: number;
  }[];
  themeGroups: {
    originalId: string;
    name: string;
    description: string | null;
    color: string;
    themeCount: number;
  }[];
  extracts: {
    originalId: string;
    text: string;
    animeTitle: string;
    themeName: string | null;
  }[];
  conflicts: ImportConflict[];
  summary: {
    totalThemes: number;
    totalThemeGroups: number;
    totalExtracts: number;
    conflictsCount: number;
  };
}

type Step = "upload" | "preview" | "conflicts" | "importing" | "success";

export default function ImportModal({
  isOpen,
  onClose,
  onImportComplete,
}: ImportModalProps) {
  const { error: showError } = useToast();
  const { theme } = useTheme();

  const [step, setStep] = useState<Step>("upload");
  const [jsonData, setJsonData] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState<ImportPreviewData | null>(
    null
  );
  const [conflictResolutions, setConflictResolutions] = useState<
    Record<string, ConflictResolution>
  >({});
  const [importResult, setImportResult] = useState<{
    createdThemes: number;
    createdThemeGroups: number;
    createdExtracts: number;
    skippedItems: number;
    errors: string[];
  } | null>(null);

  const [previewImport, { loading: previewLoading }] =
    useLazyQuery(PREVIEW_IMPORT);
  const [executeImport] = useMutation(EXECUTE_IMPORT);

  const resetState = useCallback(() => {
    setStep("upload");
    setJsonData("");
    setFileName("");
    setPreviewData(null);
    setConflictResolutions({});
    setImportResult(null);
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && step !== "importing") {
      handleClose();
    }
  };

  const handleFileRead = async (file: File) => {
    if (!file.name.endsWith(".json")) {
      showError("Veuillez sélectionner un fichier JSON");
      return;
    }

    try {
      const text = await file.text();
      JSON.parse(text); // Validate JSON
      setJsonData(text);
      setFileName(file.name);
    } catch {
      showError("Le fichier JSON est invalide");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileRead(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileRead(file);
    }
  };

  const handlePreview = async () => {
    try {
      const result = await previewImport({
        variables: { input: { jsonData } },
      });

      if (result.data?.previewImport) {
        setPreviewData(result.data.previewImport);

        // Initialize conflict resolutions with default values
        const initialResolutions: Record<string, ConflictResolution> = {};
        result.data.previewImport.conflicts.forEach(
          (conflict: ImportConflict) => {
            if (conflict.importedItem.id) {
              initialResolutions[conflict.importedItem.id] = "REUSE_EXISTING";
            }
          }
        );
        setConflictResolutions(initialResolutions);

        setStep("preview");
      }
    } catch (error) {
      showError(
        `Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`
      );
    }
  };

  const handleGoToConflicts = () => {
    setStep("conflicts");
  };

  const handleBackToPreview = () => {
    setStep("preview");
  };

  const handleImport = async () => {
    setStep("importing");

    try {
      // Build conflict resolutions array
      const resolutionsArray = Object.entries(conflictResolutions).map(
        ([originalId, resolution]) => {
          const conflict = previewData?.conflicts.find(
            (c) => c.importedItem.id === originalId
          );
          return {
            originalId,
            type: conflict?.type || "THEME_NAME_EXISTS",
            resolution,
            existingId: conflict?.existingItem.id,
          };
        }
      );

      const result = await executeImport({
        variables: {
          input: {
            jsonData,
            conflictResolutions: resolutionsArray,
          },
        },
      });

      if (result.data?.executeImport) {
        setImportResult(result.data.executeImport);
        setStep("success");
        onImportComplete();
      }
    } catch (error) {
      showError(
        `Erreur lors de l'import: ${error instanceof Error ? error.message : "Erreur inconnue"}`
      );
      setStep("preview");
    }
  };

  const renderUploadStep = () => (
    <>
      <div className={cn(
        "p-6 border-b",
        theme === "dark" ? "border-gray-700" : "border-gray-100"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={cn(
              "p-3 rounded-full",
              theme === "dark" ? "bg-purple-500/20" : "bg-blue-50"
            )}>
              <DocumentUpload size={24} color={theme === "dark" ? "#A855F7" : "#3B82F6"} variant="Bold" />
            </div>
            <div>
              <h3 className={cn(
                "text-lg font-semibold",
                theme === "dark" ? "text-white" : "text-gray-900"
              )}>
                Importer des données
              </h3>
              <p className={cn(
                "text-sm",
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              )}>
                Sélectionnez un fichier JSON exporté
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className={cn(
              "p-2 rounded-full transition-colors",
              theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"
            )}
          >
            <CloseCircle size={20} color={theme === "dark" ? "#9CA3AF" : "#6B7280"} />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
            isDragging
              ? theme === "dark"
                ? "border-purple-500 bg-purple-500/10"
                : "border-blue-500 bg-blue-50"
              : fileName
                ? theme === "dark"
                  ? "border-green-500 bg-green-500/10"
                  : "border-green-500 bg-green-50"
                : theme === "dark"
                  ? "border-gray-700 hover:border-gray-600"
                  : "border-gray-300 hover:border-gray-400"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {fileName ? (
            <div className="flex flex-col items-center space-y-3">
              <TickCircle size={48} color="#10B981" variant="Bold" />
              <p className={cn(
                "text-sm font-medium",
                theme === "dark" ? "text-white" : "text-gray-900"
              )}>{fileName}</p>
              <button
                onClick={() => {
                  setJsonData("");
                  setFileName("");
                }}
                className={cn(
                  "text-sm hover:underline",
                  theme === "dark" ? "text-purple-400" : "text-blue-600"
                )}
              >
                Choisir un autre fichier
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <DocumentUpload size={48} color={theme === "dark" ? "#6B7280" : "#9CA3AF"} />
              <div>
                <p className={cn(
                  "text-sm font-medium",
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                )}>
                  Déposez votre fichier JSON ici
                </p>
                <p className={cn(
                  "text-xs mt-1",
                  theme === "dark" ? "text-gray-500" : "text-gray-500"
                )}>ou</p>
              </div>
              <label className="cursor-pointer">
                <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-medium rounded-lg hover:from-purple-400 hover:to-cyan-400 transition-colors">
                  Parcourir
                </span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      <div className={cn(
        "p-6 flex items-center justify-end space-x-3",
        theme === "dark" ? "bg-[#0a0a0f]" : "bg-gray-50"
      )}>
        <Button
          onClick={handleClose}
          className={cn(
            "px-4 py-2 border-2 rounded-xl transition-colors",
            theme === "dark"
              ? "border-gray-700 text-gray-300 hover:bg-gray-800"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          )}
        >
          Annuler
        </Button>
        <Button
          onClick={handlePreview}
          disabled={!jsonData || previewLoading}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white rounded-xl transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {previewLoading ? (
            <>
              <SpinLoader size={18} />
              <span>Analyse...</span>
            </>
          ) : (
            <>
              <ArrowRight size={18} color="#FFFFFF" />
              <span>Continuer</span>
            </>
          )}
        </Button>
      </div>
    </>
  );

  const renderPreviewStep = () => (
    <>
      <div className={cn(
        "p-6 border-b",
        theme === "dark" ? "border-gray-700" : "border-gray-100"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={cn(
              "p-3 rounded-full",
              theme === "dark" ? "bg-purple-500/20" : "bg-blue-50"
            )}>
              <Document size={24} color={theme === "dark" ? "#A855F7" : "#3B82F6"} variant="Bold" />
            </div>
            <div>
              <h3 className={cn(
                "text-lg font-semibold",
                theme === "dark" ? "text-white" : "text-gray-900"
              )}>
                Aperçu de l'import
              </h3>
              <p className={cn(
                "text-sm",
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              )}>
                Vérifiez les données avant l'import
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className={cn(
              "p-2 rounded-full transition-colors",
              theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"
            )}
          >
            <CloseCircle size={20} color={theme === "dark" ? "#9CA3AF" : "#6B7280"} />
          </button>
        </div>
      </div>

      <div className="p-6 max-h-96 overflow-y-auto">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={cn(
            "p-4 rounded-xl text-center",
            theme === "dark" ? "bg-purple-500/20" : "bg-blue-50"
          )}>
            <Tag size={24} color={theme === "dark" ? "#A855F7" : "#3B82F6"} className="mx-auto mb-2" />
            <p className={cn(
              "text-2xl font-bold",
              theme === "dark" ? "text-white" : "text-gray-900"
            )}>
              {previewData?.summary.totalThemes}
            </p>
            <p className={cn(
              "text-xs",
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}>Mini-thèmes</p>
          </div>
          <div className={cn(
            "p-4 rounded-xl text-center",
            theme === "dark" ? "bg-cyan-500/20" : "bg-purple-50"
          )}>
            <Category size={24} color={theme === "dark" ? "#06B6D4" : "#8B5CF6"} className="mx-auto mb-2" />
            <p className={cn(
              "text-2xl font-bold",
              theme === "dark" ? "text-white" : "text-gray-900"
            )}>
              {previewData?.summary.totalThemeGroups}
            </p>
            <p className={cn(
              "text-xs",
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}>Groupes</p>
          </div>
          <div className={cn(
            "p-4 rounded-xl text-center",
            theme === "dark" ? "bg-green-500/20" : "bg-green-50"
          )}>
            <Document size={24} color="#10B981" className="mx-auto mb-2" />
            <p className={cn(
              "text-2xl font-bold",
              theme === "dark" ? "text-white" : "text-gray-900"
            )}>
              {previewData?.summary.totalExtracts}
            </p>
            <p className={cn(
              "text-xs",
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}>Extraits</p>
          </div>
        </div>

        {/* Conflicts warning */}
        {previewData && previewData.summary.conflictsCount > 0 && (
          <div className={cn(
            "p-4 rounded-xl flex items-start space-x-3 mb-6",
            theme === "dark" ? "bg-yellow-500/20" : "bg-yellow-50"
          )}>
            <Warning2 size={20} color="#F59E0B" variant="Bold" className="mt-0.5" />
            <div>
              <p className={cn(
                "text-sm font-medium",
                theme === "dark" ? "text-yellow-400" : "text-yellow-800"
              )}>
                {previewData.summary.conflictsCount} conflit(s) détecté(s)
              </p>
              <p className={cn(
                "text-xs mt-1",
                theme === "dark" ? "text-yellow-500" : "text-yellow-700"
              )}>
                Des éléments avec le même nom existent déjà. Vous devrez choisir
                comment les gérer.
              </p>
            </div>
          </div>
        )}

        {/* Details */}
        {previewData && previewData.themes.length > 0 && (
          <div className="mb-4">
            <h4 className={cn(
              "text-sm font-medium mb-2",
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            )}>
              Mini-thèmes ({previewData.themes.length})
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {previewData.themes.map((t) => (
                <div
                  key={t.originalId}
                  className={cn(
                    "flex items-center space-x-2 text-sm p-2 rounded-lg",
                    theme === "dark" ? "bg-gray-800" : "bg-gray-50"
                  )}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: t.color }}
                  />
                  <span className={theme === "dark" ? "text-white" : "text-gray-900"}>{t.name}</span>
                  <span className={cn(
                    "text-xs",
                    theme === "dark" ? "text-gray-500" : "text-gray-500"
                  )}>
                    ({t.extractCount} extraits)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {previewData && previewData.themeGroups.length > 0 && (
          <div className="mb-4">
            <h4 className={cn(
              "text-sm font-medium mb-2",
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            )}>
              Groupes de thèmes ({previewData.themeGroups.length})
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {previewData.themeGroups.map((group) => (
                <div
                  key={group.originalId}
                  className={cn(
                    "flex items-center space-x-2 text-sm p-2 rounded-lg",
                    theme === "dark" ? "bg-gray-800" : "bg-gray-50"
                  )}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  <span className={theme === "dark" ? "text-white" : "text-gray-900"}>{group.name}</span>
                  <span className={cn(
                    "text-xs",
                    theme === "dark" ? "text-gray-500" : "text-gray-500"
                  )}>
                    ({group.themeCount} thèmes)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {previewData && previewData.extracts.length > 0 && (
          <div>
            <h4 className={cn(
              "text-sm font-medium mb-2",
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            )}>
              Extraits ({previewData.extracts.length})
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {previewData.extracts.slice(0, 10).map((extract) => (
                <div
                  key={extract.originalId}
                  className={cn(
                    "text-sm p-2 rounded-lg",
                    theme === "dark" ? "bg-gray-800" : "bg-gray-50"
                  )}
                >
                  <p className={cn(
                    "truncate",
                    theme === "dark" ? "text-white" : "text-gray-900"
                  )}>{extract.text}</p>
                  <p className={cn(
                    "text-xs",
                    theme === "dark" ? "text-gray-500" : "text-gray-500"
                  )}>
                    {extract.animeTitle}
                    {extract.themeName && ` • ${extract.themeName}`}
                  </p>
                </div>
              ))}
              {previewData.extracts.length > 10 && (
                <p className={cn(
                  "text-xs text-center py-2",
                  theme === "dark" ? "text-gray-500" : "text-gray-500"
                )}>
                  + {previewData.extracts.length - 10} autres extraits
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={cn(
        "p-6 flex items-center justify-between",
        theme === "dark" ? "bg-[#0a0a0f]" : "bg-gray-50"
      )}>
        <Button
          onClick={() => setStep("upload")}
          className={cn(
            "px-4 py-2 border-2 rounded-xl transition-colors flex items-center space-x-2",
            theme === "dark"
              ? "border-gray-700 text-gray-300 hover:bg-gray-800"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          )}
        >
          <ArrowLeft size={18} color={theme === "dark" ? "#D1D5DB" : "#374151"} />
          <span>Retour</span>
        </Button>
        <div className="flex space-x-3">
          <Button
            onClick={handleClose}
            className={cn(
              "px-4 py-2 border-2 rounded-xl transition-colors",
              theme === "dark"
                ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            )}
          >
            Annuler
          </Button>
          {previewData && previewData.summary.conflictsCount > 0 ? (
            <Button
              onClick={handleGoToConflicts}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl transition-colors flex items-center space-x-2"
            >
              <Warning2 size={18} color="#FFFFFF" />
              <span>Résoudre les conflits</span>
            </Button>
          ) : (
            <Button
              onClick={handleImport}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white rounded-xl transition-colors flex items-center space-x-2"
            >
              <DocumentUpload size={18} color="#FFFFFF" />
              <span>Importer</span>
            </Button>
          )}
        </div>
      </div>
    </>
  );

  const renderConflictsStep = () => (
    <>
      <div className={cn(
        "p-6 border-b",
        theme === "dark" ? "border-gray-700" : "border-gray-100"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={cn(
              "p-3 rounded-full",
              theme === "dark" ? "bg-yellow-500/20" : "bg-yellow-50"
            )}>
              <Warning2 size={24} color="#F59E0B" variant="Bold" />
            </div>
            <div>
              <h3 className={cn(
                "text-lg font-semibold",
                theme === "dark" ? "text-white" : "text-gray-900"
              )}>
                Résolution des conflits
              </h3>
              <p className={cn(
                "text-sm",
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              )}>
                {previewData?.summary.conflictsCount} conflit(s) à résoudre
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className={cn(
              "p-2 rounded-full transition-colors",
              theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"
            )}
          >
            <CloseCircle size={20} color={theme === "dark" ? "#9CA3AF" : "#6B7280"} />
          </button>
        </div>
      </div>

      <div className="p-6 max-h-96 overflow-y-auto space-y-4">
        {previewData?.conflicts.map((conflict, index) => (
          <ConflictResolutionCard
            key={conflict.importedItem.id || index}
            conflict={conflict}
            resolution={
              conflictResolutions[conflict.importedItem.id || ""] ||
              "REUSE_EXISTING"
            }
            onResolutionChange={(resolution) =>
              setConflictResolutions((prev) => ({
                ...prev,
                [conflict.importedItem.id || ""]: resolution,
              }))
            }
          />
        ))}
      </div>

      <div className={cn(
        "p-6 flex items-center justify-between",
        theme === "dark" ? "bg-[#0a0a0f]" : "bg-gray-50"
      )}>
        <Button
          onClick={handleBackToPreview}
          className={cn(
            "px-4 py-2 border-2 rounded-xl transition-colors flex items-center space-x-2",
            theme === "dark"
              ? "border-gray-700 text-gray-300 hover:bg-gray-800"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          )}
        >
          <ArrowLeft size={18} color={theme === "dark" ? "#D1D5DB" : "#374151"} />
          <span>Retour</span>
        </Button>
        <div className="flex space-x-3">
          <Button
            onClick={handleClose}
            className={cn(
              "px-4 py-2 border-2 rounded-xl transition-colors",
              theme === "dark"
                ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            )}
          >
            Annuler
          </Button>
          <Button
            onClick={handleImport}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white rounded-xl transition-colors flex items-center space-x-2"
          >
            <DocumentUpload size={18} color="#FFFFFF" />
            <span>Importer</span>
          </Button>
        </div>
      </div>
    </>
  );

  const renderImportingStep = () => (
    <div className="p-12 flex flex-col items-center justify-center">
      <SpinLoader size={48} />
      <p className={cn(
        "text-lg font-medium mt-4",
        theme === "dark" ? "text-white" : "text-gray-900"
      )}>Import en cours...</p>
      <p className={cn(
        "text-sm mt-2",
        theme === "dark" ? "text-gray-400" : "text-gray-600"
      )}>
        Veuillez patienter pendant l'importation des données
      </p>
    </div>
  );

  const renderSuccessStep = () => (
    <>
      <div className={cn(
        "p-6 border-b",
        theme === "dark" ? "border-green-500/30" : "border-green-100"
      )}>
        <div className="flex items-center space-x-4">
          <div className={cn(
            "p-3 rounded-full",
            theme === "dark" ? "bg-green-500/20" : "bg-green-100"
          )}>
            <TickCircle size={24} color="#10B981" variant="Bold" />
          </div>
          <div>
            <h3 className={cn(
              "text-lg font-semibold",
              theme === "dark" ? "text-white" : "text-gray-900"
            )}>
              Import réussi !
            </h3>
            <p className={cn(
              "text-sm",
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}>
              Vos données ont été importées avec succès
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className={cn(
            "p-4 rounded-xl text-center",
            theme === "dark" ? "bg-purple-500/20" : "bg-blue-50"
          )}>
            <p className={cn(
              "text-2xl font-bold",
              theme === "dark" ? "text-white" : "text-gray-900"
            )}>
              {importResult?.createdThemes}
            </p>
            <p className={cn(
              "text-xs",
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}>Mini-thèmes créés</p>
          </div>
          <div className={cn(
            "p-4 rounded-xl text-center",
            theme === "dark" ? "bg-cyan-500/20" : "bg-purple-50"
          )}>
            <p className={cn(
              "text-2xl font-bold",
              theme === "dark" ? "text-white" : "text-gray-900"
            )}>
              {importResult?.createdThemeGroups}
            </p>
            <p className={cn(
              "text-xs",
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}>Groupes créés</p>
          </div>
          <div className={cn(
            "p-4 rounded-xl text-center",
            theme === "dark" ? "bg-green-500/20" : "bg-green-50"
          )}>
            <p className={cn(
              "text-2xl font-bold",
              theme === "dark" ? "text-white" : "text-gray-900"
            )}>
              {importResult?.createdExtracts}
            </p>
            <p className={cn(
              "text-xs",
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}>Extraits créés</p>
          </div>
          <div className={cn(
            "p-4 rounded-xl text-center",
            theme === "dark" ? "bg-gray-800" : "bg-gray-50"
          )}>
            <p className={cn(
              "text-2xl font-bold",
              theme === "dark" ? "text-white" : "text-gray-900"
            )}>
              {importResult?.skippedItems}
            </p>
            <p className={cn(
              "text-xs",
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}>Éléments ignorés</p>
          </div>
        </div>

        {importResult?.errors && importResult.errors.length > 0 && (
          <div className={cn(
            "mt-4 p-4 rounded-xl",
            theme === "dark" ? "bg-red-500/20" : "bg-red-50"
          )}>
            <p className={cn(
              "text-sm font-medium mb-2",
              theme === "dark" ? "text-red-400" : "text-red-800"
            )}>
              Erreurs rencontrées:
            </p>
            <ul className={cn(
              "text-xs list-disc list-inside",
              theme === "dark" ? "text-red-300" : "text-red-700"
            )}>
              {importResult.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className={cn(
        "p-6 flex items-center justify-end",
        theme === "dark" ? "bg-[#0a0a0f]" : "bg-gray-50"
      )}>
        <Button
          onClick={handleClose}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white rounded-xl transition-colors"
        >
          Fermer
        </Button>
      </div>
    </>
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className={cn(
        "rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden",
        theme === "dark" ? "bg-[#12121a]" : "bg-white"
      )}>
        {step === "upload" && renderUploadStep()}
        {step === "preview" && renderPreviewStep()}
        {step === "conflicts" && renderConflictsStep()}
        {step === "importing" && renderImportingStep()}
        {step === "success" && renderSuccessStep()}
      </div>
    </div>
  );
}
