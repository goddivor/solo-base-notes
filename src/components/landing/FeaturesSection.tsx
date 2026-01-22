import { cn } from "@/lib/utils";
import { useTheme } from "@/context/theme-context";
import { useScrollAnimation } from "./useScrollAnimation";
import {
  SearchNormal1,
  Video,
  Tag,
  Magicpen,
  ExportSquare,
  People,
  Chart,
  Cloud,
} from "iconsax-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <SearchNormal1 size={28} color="#a855f7" variant="Bulk" />,
    title: "Recherche d'anime intelligente",
    description:
      "Recherchez parmi 50 000+ titres d'anime avec l'intégration MyAnimeList & Jikan",
  },
  {
    icon: <Video size={28} color="#06b6d4" variant="Bulk" />,
    title: "Extraction de citations",
    description:
      "Capturez des citations avec horodatages précis, infos d'épisode et données de personnages",
  },
  {
    icon: <Tag size={28} color="#ec4899" variant="Bulk" />,
    title: "Organisation par thèmes",
    description:
      "Regroupez les citations par thèmes comme « Motivation », « Amitié » ou « Vengeance »",
  },
  {
    icon: <Magicpen size={28} color="#8b5cf6" variant="Bulk" />,
    title: "Détection IA de scènes",
    description: "Identifiez automatiquement les moments émotionnels clés des épisodes",
  },
  {
    icon: <ExportSquare size={28} color="#a855f7" variant="Bulk" />,
    title: "Modèles d'export",
    description: "Générez des exports prêts pour la vidéo avec miniatures et descriptions",
  },
  {
    icon: <People size={28} color="#06b6d4" variant="Bulk" />,
    title: "Base de personnages",
    description: "Remplissage auto des infos personnages avec images, doubleurs et traits",
  },
  {
    icon: <Chart size={28} color="#ec4899" variant="Bulk" />,
    title: "Tableau de bord analytique",
    description: "Suivez quels thèmes et anime performent le mieux sur votre chaîne",
  },
  {
    icon: <Cloud size={28} color="#8b5cf6" variant="Bulk" />,
    title: "Synchronisation cloud",
    description: "Accédez à votre bibliothèque de citations depuis n'importe quel appareil",
  },
];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const { theme } = useTheme();

  return (
    <div
      ref={ref}
      className={cn(
        "group p-6 rounded-2xl",
        "backdrop-blur-sm",
        "transition-all duration-500 hover:scale-[1.02]",
        theme === "dark"
          ? "bg-[#12121a]/80 border border-gray-800 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10"
          : "bg-white border border-gray-200 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10",
        "opacity-0 translate-y-8",
        isVisible && "opacity-100 translate-y-0"
      )}
      style={{ transitionDelay: `${index * 75}ms` }}
    >
      <div
        className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
          "group-hover:scale-110 transition-transform duration-300",
          theme === "dark"
            ? "bg-gradient-to-br from-purple-500/20 to-cyan-500/10"
            : "bg-gradient-to-br from-purple-100 to-cyan-50"
        )}
      >
        {feature.icon}
      </div>
      <h3
        className={cn(
          "text-lg font-semibold mb-2",
          theme === "dark" ? "text-white" : "text-gray-900"
        )}
      >
        {feature.title}
      </h3>
      <p
        className={cn(
          "text-sm leading-relaxed",
          theme === "dark" ? "text-gray-400" : "text-gray-600"
        )}
      >
        {feature.description}
      </p>
    </div>
  );
}

export default function FeaturesSection() {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { theme } = useTheme();

  return (
    <section
      id="features"
      className={cn(
        "py-24 transition-colors duration-300",
        theme === "dark" ? "bg-[#0a0a0f]" : "bg-gray-50"
      )}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div
          ref={titleRef}
          className={cn(
            "text-center mb-16",
            "opacity-0 translate-y-8 transition-all duration-700",
            titleVisible && "opacity-100 translate-y-0"
          )}
        >
          <h2
            className={cn(
              "text-3xl sm:text-4xl font-bold mb-4",
              theme === "dark" ? "text-white" : "text-gray-900"
            )}
          >
            Tout ce dont vous avez besoin pour{" "}
            <span className="bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
              créer du contenu
            </span>
          </h2>
          <p
            className={cn(
              "max-w-2xl mx-auto",
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}
          >
            De l'extraction de citations à l'export vidéo, QuoteForge optimise
            tout votre flux de travail de contenu anime.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
