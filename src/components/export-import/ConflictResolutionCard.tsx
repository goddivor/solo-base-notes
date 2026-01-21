import { Warning2, ArrowRight } from "iconsax-react";
import { useTheme } from "../../context/theme-context";
import { cn } from "../../lib/utils";

type ConflictResolution = "REUSE_EXISTING" | "CREATE_DUPLICATE" | "SKIP";

interface ConflictItem {
  id: string | null;
  name: string;
  description: string | null;
  color: string | null;
}

interface ImportConflict {
  type: "THEME_NAME_EXISTS" | "THEME_GROUP_NAME_EXISTS";
  importedItem: ConflictItem;
  existingItem: ConflictItem;
}

interface ConflictResolutionCardProps {
  conflict: ImportConflict;
  resolution: ConflictResolution;
  onResolutionChange: (resolution: ConflictResolution) => void;
}

export default function ConflictResolutionCard({
  conflict,
  resolution,
  onResolutionChange,
}: ConflictResolutionCardProps) {
  const { theme } = useTheme();
  const typeLabel =
    conflict.type === "THEME_NAME_EXISTS" ? "Mini-thème" : "Groupe de thèmes";

  return (
    <div className={cn(
      "border-2 rounded-xl overflow-hidden",
      theme === "dark"
        ? "border-yellow-500/30 bg-[#12121a]"
        : "border-yellow-200 bg-white"
    )}>
      {/* Header */}
      <div className={cn(
        "px-4 py-3 flex items-center space-x-2",
        theme === "dark" ? "bg-yellow-500/20" : "bg-yellow-50"
      )}>
        <Warning2 size={18} color="#F59E0B" variant="Bold" />
        <span className={cn(
          "text-sm font-medium",
          theme === "dark" ? "text-yellow-400" : "text-yellow-800"
        )}>
          Conflit de {typeLabel.toLowerCase()}
        </span>
      </div>

      {/* Comparison */}
      <div className="p-4">
        <div className="flex items-center space-x-4">
          {/* Imported Item */}
          <div className={cn(
            "flex-1 p-3 rounded-xl border-2",
            theme === "dark"
              ? "bg-purple-500/10 border-purple-500/30"
              : "bg-blue-50 border-blue-100"
          )}>
            <p className={cn(
              "text-xs font-medium mb-1",
              theme === "dark" ? "text-purple-400" : "text-blue-600"
            )}>À importer</p>
            <div className="flex items-center space-x-2">
              {conflict.importedItem.color && (
                <div
                  className="w-4 h-4 rounded-full border border-gray-200"
                  style={{ backgroundColor: conflict.importedItem.color }}
                />
              )}
              <span className={cn(
                "font-medium truncate",
                theme === "dark" ? "text-white" : "text-gray-900"
              )}>
                {conflict.importedItem.name}
              </span>
            </div>
            {conflict.importedItem.description && (
              <p className={cn(
                "text-xs mt-1 truncate",
                theme === "dark" ? "text-gray-500" : "text-gray-500"
              )}>
                {conflict.importedItem.description}
              </p>
            )}
          </div>

          {/* Arrow */}
          <ArrowRight size={20} color={theme === "dark" ? "#6B7280" : "#9CA3AF"} />

          {/* Existing Item */}
          <div className={cn(
            "flex-1 p-3 rounded-xl border-2",
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-200"
          )}>
            <p className={cn(
              "text-xs font-medium mb-1",
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}>Existant</p>
            <div className="flex items-center space-x-2">
              {conflict.existingItem.color && (
                <div
                  className="w-4 h-4 rounded-full border border-gray-200"
                  style={{ backgroundColor: conflict.existingItem.color }}
                />
              )}
              <span className={cn(
                "font-medium truncate",
                theme === "dark" ? "text-white" : "text-gray-900"
              )}>
                {conflict.existingItem.name}
              </span>
            </div>
            {conflict.existingItem.description && (
              <p className={cn(
                "text-xs mt-1 truncate",
                theme === "dark" ? "text-gray-500" : "text-gray-500"
              )}>
                {conflict.existingItem.description}
              </p>
            )}
          </div>
        </div>

        {/* Resolution Options */}
        <div className="mt-4 space-y-2">
          <label className={cn(
            "flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors",
            theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-50"
          )}>
            <input
              type="radio"
              name={`conflict-${conflict.importedItem.id}`}
              checked={resolution === "REUSE_EXISTING"}
              onChange={() => onResolutionChange("REUSE_EXISTING")}
              className="w-4 h-4 text-purple-500 focus:ring-purple-500"
            />
            <div className="flex-1">
              <span className={cn(
                "text-sm font-medium",
                theme === "dark" ? "text-white" : "text-gray-900"
              )}>
                Utiliser l'existant
              </span>
              <p className={cn(
                "text-xs",
                theme === "dark" ? "text-gray-500" : "text-gray-500"
              )}>
                Les extraits importés seront liés au {typeLabel.toLowerCase()}{" "}
                existant
              </p>
            </div>
          </label>

          <label className={cn(
            "flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors",
            theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-50"
          )}>
            <input
              type="radio"
              name={`conflict-${conflict.importedItem.id}`}
              checked={resolution === "CREATE_DUPLICATE"}
              onChange={() => onResolutionChange("CREATE_DUPLICATE")}
              className="w-4 h-4 text-purple-500 focus:ring-purple-500"
            />
            <div className="flex-1">
              <span className={cn(
                "text-sm font-medium",
                theme === "dark" ? "text-white" : "text-gray-900"
              )}>
                Créer un doublon
              </span>
              <p className={cn(
                "text-xs",
                theme === "dark" ? "text-gray-500" : "text-gray-500"
              )}>
                Un nouveau {typeLabel.toLowerCase()} sera créé avec le suffixe
                "(copie)"
              </p>
            </div>
          </label>

          <label className={cn(
            "flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors",
            theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-50"
          )}>
            <input
              type="radio"
              name={`conflict-${conflict.importedItem.id}`}
              checked={resolution === "SKIP"}
              onChange={() => onResolutionChange("SKIP")}
              className="w-4 h-4 text-purple-500 focus:ring-purple-500"
            />
            <div className="flex-1">
              <span className={cn(
                "text-sm font-medium",
                theme === "dark" ? "text-white" : "text-gray-900"
              )}>Ignorer</span>
              <p className={cn(
                "text-xs",
                theme === "dark" ? "text-gray-500" : "text-gray-500"
              )}>
                Ce {typeLabel.toLowerCase()} ne sera pas importé
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
