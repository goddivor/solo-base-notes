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
    title: "Smart Anime Search",
    description:
      "Search across 50,000+ anime titles with MyAnimeList & Jikan integration",
  },
  {
    icon: <Video size={28} color="#06b6d4" variant="Bulk" />,
    title: "Quote Extraction",
    description:
      "Capture quotes with precise timestamps, episode info, and character data",
  },
  {
    icon: <Tag size={28} color="#ec4899" variant="Bulk" />,
    title: "Theme Organization",
    description:
      "Group quotes by themes like 'Motivation', 'Friendship', or 'Revenge'",
  },
  {
    icon: <Magicpen size={28} color="#8b5cf6" variant="Bulk" />,
    title: "AI Scene Detection",
    description: "Automatically identify key emotional moments in episodes",
  },
  {
    icon: <ExportSquare size={28} color="#a855f7" variant="Bulk" />,
    title: "Export Templates",
    description: "Generate video-ready exports with thumbnails and descriptions",
  },
  {
    icon: <People size={28} color="#06b6d4" variant="Bulk" />,
    title: "Character Database",
    description: "Auto-fill character info with images, voice actors, and traits",
  },
  {
    icon: <Chart size={28} color="#ec4899" variant="Bulk" />,
    title: "Analytics Dashboard",
    description: "Track which themes and anime perform best on your channel",
  },
  {
    icon: <Cloud size={28} color="#8b5cf6" variant="Bulk" />,
    title: "Cloud Sync",
    description: "Access your quote library from any device, anytime",
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
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
              Create Content
            </span>
          </h2>
          <p
            className={cn(
              "max-w-2xl mx-auto",
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}
          >
            From quote extraction to video export, QuoteForge streamlines your
            entire anime content workflow.
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
