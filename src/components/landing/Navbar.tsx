import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/theme-context";
import { Sun1, Moon } from "iconsax-react";

interface NavbarProps {
  onGetStarted: () => void;
}

export default function Navbar({ onGetStarted }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? theme === "dark"
            ? "bg-[#0a0a0f]/90 backdrop-blur-lg border-b border-purple-500/10 py-4"
            : "bg-white/90 backdrop-blur-lg border-b border-gray-200 py-4 shadow-sm"
          : "bg-transparent py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#"
          className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent"
        >
          QuoteForge
        </a>

        {/* Navigation Links - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("features")}
            className={cn(
              "transition-colors text-sm font-medium",
              theme === "dark"
                ? "text-gray-300 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            Fonctionnalités
          </button>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className={cn(
              "transition-colors text-sm font-medium",
              theme === "dark"
                ? "text-gray-300 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            Comment ça marche
          </button>
          <button
            onClick={() => scrollToSection("pricing")}
            className={cn(
              "transition-colors text-sm font-medium",
              theme === "dark"
                ? "text-gray-300 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            Tarifs
          </button>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              "p-2.5 rounded-full transition-all duration-300",
              theme === "dark"
                ? "bg-gray-800 hover:bg-gray-700 text-yellow-400"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            )}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun1 size={18} color="#facc15" variant="Bold" />
            ) : (
              <Moon size={18} color="#6b7280" variant="Bold" />
            )}
          </button>

          <button
            onClick={onGetStarted}
            className={cn(
              "hidden sm:block px-4 py-2 text-sm font-medium transition-colors",
              theme === "dark"
                ? "text-gray-300 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            Se connecter
          </button>
          <button
            onClick={onGetStarted}
            className={cn(
              "px-5 py-2.5 rounded-full text-sm font-semibold text-white",
              "bg-gradient-to-r from-purple-500 to-cyan-500",
              "hover:from-purple-400 hover:to-cyan-400",
              "shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40",
              "transition-all duration-300 hover:scale-105"
            )}
          >
            Commencer
          </button>
        </div>
      </div>
    </nav>
  );
}
