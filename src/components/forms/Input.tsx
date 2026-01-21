import { X } from "@phosphor-icons/react";
import React, { forwardRef } from "react";
import { useTheme } from "../../context/theme-context";
import { cn } from "../../lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  onClear?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", onClear, ...props }, ref) => {
    const { theme } = useTheme();

    return (
      <div className="w-full">
        {label && (
          <label className={cn(
            "block text-sm font-medium mb-1",
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          )}>
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={cn(
              "w-full h-[42px] px-3 border-2 rounded-xl transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
              theme === "dark"
                ? "bg-[#0a0a0f] border-gray-700 text-white placeholder-gray-500 disabled:bg-gray-900 disabled:text-gray-600"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500",
              error && "border-red-500",
              className
            )}
            {...props}
          />
          {onClear && props.value && (
            <button
              type="button"
              onClick={onClear}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors",
                theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"
              )}
            >
              <X size={16} className={theme === "dark" ? "text-gray-500" : "text-gray-400"} />
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
