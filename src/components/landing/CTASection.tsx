import { cn } from "@/lib/utils";
import { useTheme } from "@/context/theme-context";
import { useScrollAnimation } from "./useScrollAnimation";

interface CTASectionProps {
  onGetStarted: () => void;
}

export default function CTASection({ onGetStarted }: CTASectionProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const { theme } = useTheme();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div
        className={cn(
          "absolute inset-0",
          theme === "dark"
            ? "bg-gradient-to-br from-purple-500/10 via-[#0a0a0f] to-cyan-500/10"
            : "bg-gradient-to-br from-purple-100/50 via-white to-cyan-100/50"
        )}
      />

      {/* Animated orbs */}
      <div
        className={cn(
          "absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-[100px] animate-float",
          theme === "dark" ? "bg-purple-500/20" : "bg-purple-300/30"
        )}
      />
      <div
        className={cn(
          "absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full blur-[80px] animate-float-slow delay-300",
          theme === "dark" ? "bg-cyan-500/20" : "bg-cyan-300/30"
        )}
      />

      <div
        ref={ref}
        className={cn(
          "relative z-10 max-w-4xl mx-auto px-6 text-center",
          "opacity-0 translate-y-8 transition-all duration-700",
          isVisible && "opacity-100 translate-y-0"
        )}
      >
        <h2
          className={cn(
            "text-3xl sm:text-4xl md:text-5xl font-bold mb-6",
            theme === "dark" ? "text-white" : "text-gray-900"
          )}
        >
          Prêt à transformer votre
          <span className="block bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
            création de contenu anime ?
          </span>
        </h2>
        <p
          className={cn(
            "text-lg sm:text-xl mb-10 max-w-2xl mx-auto",
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          )}
        >
          Rejoignez des milliers de créateurs qui produisent plus de contenu en moins
          de temps avec QuoteForge.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
            Commencer gratuitement avec Google
          </button>
          <span
            className={cn(
              "text-sm",
              theme === "dark" ? "text-gray-500" : "text-gray-500"
            )}
          >
            Pas de carte bancaire requise
          </span>
        </div>
      </div>
    </section>
  );
}
