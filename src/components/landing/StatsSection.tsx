import { cn } from "@/lib/utils";
import { useTheme } from "@/context/theme-context";
import { useScrollAnimation } from "./useScrollAnimation";
import { People, DocumentText1, Video, Eye } from "iconsax-react";

interface Stat {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const stats: Stat[] = [
  {
    value: "2 500+",
    label: "Créateurs actifs",
    icon: <People size={28} color="#a855f7" variant="Bulk" />,
  },
  {
    value: "150K+",
    label: "Citations extraites",
    icon: <DocumentText1 size={28} color="#06b6d4" variant="Bulk" />,
  },
  {
    value: "50K+",
    label: "Vidéos créées",
    icon: <Video size={28} color="#ec4899" variant="Bulk" />,
  },
  {
    value: "10M+",
    label: "Vues générées",
    icon: <Eye size={28} color="#8b5cf6" variant="Bulk" />,
  },
];

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const { theme } = useTheme();

  return (
    <div
      ref={ref}
      className={cn(
        "text-center p-6",
        "opacity-0 translate-y-8 transition-all duration-500",
        isVisible && "opacity-100 translate-y-0"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex justify-center mb-4">{stat.icon}</div>
      <div
        className={cn(
          "text-3xl md:text-4xl font-bold mb-2",
          theme === "dark" ? "text-white" : "text-gray-900"
        )}
      >
        {stat.value}
      </div>
      <div className={cn("text-sm", theme === "dark" ? "text-gray-400" : "text-gray-600")}>
        {stat.label}
      </div>
    </div>
  );
}

export default function StatsSection() {
  const { theme } = useTheme();

  return (
    <section
      className={cn(
        "py-20 border-y transition-colors duration-300",
        theme === "dark"
          ? "bg-gradient-to-r from-purple-500/5 via-[#0a0a0f] to-cyan-500/5 border-gray-800/50"
          : "bg-gradient-to-r from-purple-50 via-white to-cyan-50 border-gray-200"
      )}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
