import React, { forwardRef } from "react";
import { useTheme } from "../../context/theme-context";
import { cn } from "../../lib/utils";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", ...props }, ref) => {
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
        <textarea
          ref={ref}
          className={cn(
            "w-full min-h-[42px] p-3 border-2 rounded-xl transition-colors resize-y",
            "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
            theme === "dark"
              ? "bg-[#0a0a0f] border-gray-700 text-white placeholder-gray-500 disabled:bg-gray-900 disabled:text-gray-600"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500",
            error && "border-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
