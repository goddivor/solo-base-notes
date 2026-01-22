import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/theme-context";
import AnimatedBackground from "./AnimatedBackground";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section
      className={cn(
        "relative min-h-screen flex items-center justify-center overflow-hidden transition-colors duration-300",
        theme === "dark" ? "bg-[#0a0a0f]" : "bg-gradient-to-b from-white to-gray-50"
      )}
    >
      <AnimatedBackground />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-20">
        {/* Badge */}
        <div
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8",
            theme === "dark"
              ? "bg-purple-500/10 border border-purple-500/20"
              : "bg-purple-100 border border-purple-200",
            "opacity-0",
            isLoaded && "animate-fade-in-down"
          )}
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span
            className={cn(
              "text-sm",
              theme === "dark" ? "text-purple-300" : "text-purple-700"
            )}
          >
            L'outil #1 pour les créateurs de citations d'anime
          </span>
        </div>

        {/* Headline */}
        <h1
          className={cn(
            "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight",
            "opacity-0",
            isLoaded && "animate-fade-in-up delay-100"
          )}
        >
          <span className={theme === "dark" ? "text-white" : "text-gray-900"}>
            Transformez vos Moments Anime
          </span>
          <br />
          <span className="bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
            En Contenu Viral
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className={cn(
            "text-lg sm:text-xl max-w-2xl mx-auto mb-10",
            theme === "dark" ? "text-gray-400" : "text-gray-600",
            "opacity-0",
            isLoaded && "animate-fade-in-up delay-200"
          )}
        >
          QuoteForge aide les créateurs YouTube à extraire, organiser et produire
          des vidéos de citations d'anime époustouflantes en quelques minutes.
        </p>

        {/* CTAs */}
        <div
          className={cn(
            "flex flex-col sm:flex-row items-center justify-center gap-4",
            "opacity-0",
            isLoaded && "animate-fade-in-up delay-300"
          )}
        >
          <button
            onClick={onGetStarted}
            className={cn(
              "group flex items-center gap-3 px-8 py-4 rounded-full",
              "text-base font-semibold text-white",
              "bg-gradient-to-r from-purple-500 to-cyan-500",
              "hover:from-purple-400 hover:to-cyan-400",
              "shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50",
              "transition-all duration-300 hover:scale-105"
            )}
          >
            {/* Google Icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Commencer gratuitement
          </button>
          <button
            className={cn(
              "px-8 py-4 rounded-full",
              "text-base font-semibold",
              theme === "dark"
                ? "text-gray-300 border border-gray-600 hover:border-purple-500 hover:text-white hover:bg-purple-500/10"
                : "text-gray-700 border border-gray-300 hover:border-purple-500 hover:text-purple-700 hover:bg-purple-50",
              "transition-all duration-300"
            )}
          >
            Voir la démo
          </button>
        </div>

        {/* Social Proof */}
        <div
          className={cn(
            "mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8",
            "text-sm",
            theme === "dark" ? "text-gray-500" : "text-gray-500",
            "opacity-0",
            isLoaded && "animate-fade-in-up delay-500"
          )}
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "w-8 h-8 rounded-full border-2",
                    theme === "dark" ? "border-[#0a0a0f]" : "border-white",
                    "bg-gradient-to-br",
                    i === 1 && "from-purple-400 to-purple-600",
                    i === 2 && "from-cyan-400 to-cyan-600",
                    i === 3 && "from-pink-400 to-pink-600",
                    i === 4 && "from-violet-400 to-violet-600"
                  )}
                />
              ))}
            </div>
            <span>2 500+ créateurs</span>
          </div>
          <span className={cn("hidden sm:block", theme === "dark" ? "text-gray-700" : "text-gray-300")}>•</span>
          <span>50 000+ vidéos créées</span>
          <span className={cn("hidden sm:block", theme === "dark" ? "text-gray-700" : "text-gray-300")}>•</span>
          <span>10M+ vues générées</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={cn(
          "absolute bottom-8 left-1/2 -translate-x-1/2",
          "opacity-0",
          isLoaded && "animate-fade-in-up delay-700"
        )}
      >
        <div
          className={cn(
            "w-6 h-10 rounded-full border-2 flex items-start justify-center p-2",
            theme === "dark" ? "border-gray-600" : "border-gray-400"
          )}
        >
          <div className="w-1.5 h-3 bg-purple-500 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
