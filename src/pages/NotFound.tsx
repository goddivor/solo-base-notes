import { useNavigate } from "react-router";
import { useTheme } from "../context/theme-context";
import { cn } from "../lib/utils";
import { Home2, ArrowLeft, SearchNormal1, Sun1, Moon } from "iconsax-react";

const NotFound = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className={cn(
        "min-h-screen relative overflow-hidden flex items-center justify-center transition-colors duration-300",
        theme === "dark" ? "bg-[#0a0a0f]" : "bg-gradient-to-b from-white to-gray-100"
      )}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div
          className={cn(
            "absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] animate-pulse",
            theme === "dark" ? "bg-purple-500/20" : "bg-purple-300/30"
          )}
        />
        <div
          className={cn(
            "absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px] animate-pulse delay-1000",
            theme === "dark" ? "bg-cyan-500/20" : "bg-cyan-300/30"
          )}
        />
        <div
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] animate-pulse delay-500",
            theme === "dark" ? "bg-pink-500/15" : "bg-pink-300/25"
          )}
        />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute w-1 h-1 rounded-full",
              theme === "dark" ? "bg-purple-400/40" : "bg-purple-500/30"
            )}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Grid Pattern */}
        <div
          className={cn(
            "absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)]",
            "bg-[size:60px_60px]"
          )}
        />
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={cn(
          "absolute top-6 right-6 p-3 rounded-xl transition-all duration-300 z-20",
          theme === "dark"
            ? "bg-gray-800/50 hover:bg-gray-700/50 text-yellow-400"
            : "bg-white/50 hover:bg-white/80 text-gray-700 shadow-lg"
        )}
        aria-label="Changer le thème"
      >
        {theme === "dark" ? (
          <Sun1 size={22} color="#facc15" variant="Bold" />
        ) : (
          <Moon size={22} color="#6b7280" variant="Bold" />
        )}
      </button>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* 404 Number */}
        <div className="relative mb-8">
          <h1
            className={cn(
              "text-[180px] sm:text-[220px] font-black leading-none select-none",
              "bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500 bg-clip-text text-transparent",
              "animate-gradient drop-shadow-2xl"
            )}
          >
            404
          </h1>
          {/* Glitch effect overlay */}
          <div
            className={cn(
              "absolute inset-0 text-[180px] sm:text-[220px] font-black leading-none",
              "bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-500 bg-clip-text text-transparent",
              "opacity-30 blur-sm select-none pointer-events-none"
            )}
            style={{ transform: "translate(4px, 4px)" }}
          >
            404
          </div>
        </div>

        {/* Anime-style icon/decoration */}
        <div className="mb-8 flex justify-center">
          <div
            className={cn(
              "relative w-24 h-24 rounded-2xl flex items-center justify-center",
              "bg-gradient-to-br from-purple-500/20 to-cyan-500/20",
              "border-2",
              theme === "dark" ? "border-purple-500/30" : "border-purple-300"
            )}
          >
            <SearchNormal1
              size={48}
              color={theme === "dark" ? "#A855F7" : "#9333EA"}
              variant="Bulk"
            />
            {/* Sparkle effects */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-cyan-400 rounded-full animate-ping" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-pink-400 rounded-full animate-ping delay-300" />
          </div>
        </div>

        {/* Title */}
        <h2
          className={cn(
            "text-2xl sm:text-3xl font-bold mb-4",
            theme === "dark" ? "text-white" : "text-gray-900"
          )}
        >
          Oups ! Page introuvable
        </h2>

        {/* Description */}
        <p
          className={cn(
            "text-base sm:text-lg mb-10 max-w-md mx-auto",
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          )}
        >
          On dirait que cette page s'est perdue dans une autre dimension...
          Comme un filler qu'on préfère sauter !
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className={cn(
              "group flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300",
              theme === "dark"
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-lg hover:shadow-xl"
            )}
          >
            <ArrowLeft
              size={20}
              color={theme === "dark" ? "#D1D5DB" : "#374151"}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Retour
          </button>

          <button
            onClick={() => navigate("/")}
            className={cn(
              "group flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-white",
              "bg-gradient-to-r from-purple-500 to-cyan-500",
              "hover:from-purple-400 hover:to-cyan-400",
              "shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40",
              "transition-all duration-300 hover:scale-105"
            )}
          >
            <Home2 size={20} color="#FFFFFF" variant="Bold" />
            Retour à l'accueil
          </button>
        </div>

        {/* Fun Easter Egg */}
        <p
          className={cn(
            "mt-12 text-sm italic",
            theme === "dark" ? "text-gray-600" : "text-gray-400"
          )}
        >
          "La vraie force n'est pas de ne jamais tomber, mais de toujours se relever."
          <span className="block mt-1 not-italic">— Un sage de l'anime</span>
        </p>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none">
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 h-full",
            "bg-gradient-to-t",
            theme === "dark"
              ? "from-purple-500/5 to-transparent"
              : "from-purple-100/50 to-transparent"
          )}
        />
      </div>
    </div>
  );
};

export default NotFound;
