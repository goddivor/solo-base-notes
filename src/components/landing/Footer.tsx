import { cn } from "@/lib/utils";
import { useTheme } from "@/context/theme-context";
import { Instagram, MessageText } from "iconsax-react";

export default function Footer() {
  const { theme } = useTheme();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer
      className={cn(
        "py-16 border-t transition-colors duration-300",
        theme === "dark"
          ? "bg-[#0a0a0f] border-gray-800"
          : "bg-gray-50 border-gray-200"
      )}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent mb-4">
              QuoteForge
            </h3>
            <p
              className={cn(
                "text-sm mb-4",
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              )}
            >
              L'outil ultime pour les créateurs de contenu anime.
            </p>
            <div className="flex gap-4">
              {/* YouTube */}
              <a
                href="#"
                className={cn(
                  "transition-colors",
                  theme === "dark"
                    ? "text-gray-400 hover:text-purple-400"
                    : "text-gray-500 hover:text-purple-500"
                )}
                aria-label="YouTube"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="#"
                className={cn(
                  "transition-colors",
                  theme === "dark"
                    ? "text-gray-400 hover:text-purple-400"
                    : "text-gray-500 hover:text-purple-500"
                )}
                aria-label="Instagram"
              >
                <Instagram size={20} color="currentColor" variant="Bold" />
              </a>
              {/* Discord */}
              <a
                href="#"
                className={cn(
                  "transition-colors",
                  theme === "dark"
                    ? "text-gray-400 hover:text-purple-400"
                    : "text-gray-500 hover:text-purple-500"
                )}
                aria-label="Discord"
              >
                <MessageText size={20} color="currentColor" variant="Bold" />
              </a>
              {/* Twitter/X */}
              <a
                href="#"
                className={cn(
                  "transition-colors",
                  theme === "dark"
                    ? "text-gray-400 hover:text-purple-400"
                    : "text-gray-500 hover:text-purple-500"
                )}
                aria-label="Twitter"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4
              className={cn(
                "font-semibold mb-4",
                theme === "dark" ? "text-white" : "text-gray-900"
              )}
            >
              Produit
            </h4>
            <ul
              className={cn(
                "space-y-2 text-sm",
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              )}
            >
              <li>
                <button
                  onClick={() => scrollToSection("features")}
                  className={cn(
                    "transition-colors",
                    theme === "dark" ? "hover:text-white" : "hover:text-gray-900"
                  )}
                >
                  Fonctionnalités
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className={cn(
                    "transition-colors",
                    theme === "dark" ? "hover:text-white" : "hover:text-gray-900"
                  )}
                >
                  Tarifs
                </button>
              </li>
              <li>
                <a
                  href="#"
                  className={cn(
                    "transition-colors",
                    theme === "dark" ? "hover:text-white" : "hover:text-gray-900"
                  )}
                >
                  Journal des modifications
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={cn(
                    "transition-colors",
                    theme === "dark" ? "hover:text-white" : "hover:text-gray-900"
                  )}
                >
                  Feuille de route
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4
              className={cn(
                "font-semibold mb-4",
                theme === "dark" ? "text-white" : "text-gray-900"
              )}
            >
              Ressources
            </h4>
            <ul
              className={cn(
                "space-y-2 text-sm",
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              )}
            >
              <li>
                <a
                  href="#"
                  className={cn(
                    "transition-colors",
                    theme === "dark" ? "hover:text-white" : "hover:text-gray-900"
                  )}
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={cn(
                    "transition-colors",
                    theme === "dark" ? "hover:text-white" : "hover:text-gray-900"
                  )}
                >
                  Référence API
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={cn(
                    "transition-colors",
                    theme === "dark" ? "hover:text-white" : "hover:text-gray-900"
                  )}
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={cn(
                    "transition-colors",
                    theme === "dark" ? "hover:text-white" : "hover:text-gray-900"
                  )}
                >
                  Communauté
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4
              className={cn(
                "font-semibold mb-4",
                theme === "dark" ? "text-white" : "text-gray-900"
              )}
            >
              Entreprise
            </h4>
            <ul
              className={cn(
                "space-y-2 text-sm",
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              )}
            >
              <li>
                <a
                  href="#"
                  className={cn(
                    "transition-colors",
                    theme === "dark" ? "hover:text-white" : "hover:text-gray-900"
                  )}
                >
                  À propos
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={cn(
                    "transition-colors",
                    theme === "dark" ? "hover:text-white" : "hover:text-gray-900"
                  )}
                >
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={cn(
                    "transition-colors",
                    theme === "dark" ? "hover:text-white" : "hover:text-gray-900"
                  )}
                >
                  Conditions d'utilisation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={cn(
                    "transition-colors",
                    theme === "dark" ? "hover:text-white" : "hover:text-gray-900"
                  )}
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className={cn(
            "pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-sm",
            theme === "dark"
              ? "border-gray-800 text-gray-500"
              : "border-gray-200 text-gray-500"
          )}
        >
          <p>&copy; {new Date().getFullYear()} QuoteForge. Tous droits réservés.</p>
          <p className="flex items-center gap-1">
            Fait avec <span className="text-pink-500">♥</span> pour la communauté
            anime
          </p>
        </div>
      </div>
    </footer>
  );
}
