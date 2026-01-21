import { cn } from "@/lib/utils";
import { useTheme } from "@/context/theme-context";
import { useScrollAnimation } from "./useScrollAnimation";
import { SearchNormal1, DocumentText1, Category, Send2 } from "iconsax-react";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Search & Select",
    description: "Find your anime and navigate to the episode with the perfect quote",
    icon: <SearchNormal1 size={32} color="#a855f7" variant="Bulk" />,
  },
  {
    number: "02",
    title: "Extract & Tag",
    description: "Capture the quote with timestamps, characters, and theme tags",
    icon: <DocumentText1 size={32} color="#06b6d4" variant="Bulk" />,
  },
  {
    number: "03",
    title: "Organize & Plan",
    description: "Group extracts into video themes and plan your content calendar",
    icon: <Category size={32} color="#ec4899" variant="Bulk" />,
  },
  {
    number: "04",
    title: "Export & Publish",
    description: "Generate video scripts, thumbnails, and descriptions ready for upload",
    icon: <Send2 size={32} color="#8b5cf6" variant="Bulk" />,
  },
];

function StepCard({
  step,
  index,
  isLast,
}: {
  step: Step;
  index: number;
  isLast: boolean;
}) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const { theme } = useTheme();

  return (
    <div ref={ref} className="relative flex flex-col items-center">
      {/* Connecting line */}
      {!isLast && (
        <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5">
          <div className="w-full h-full bg-gradient-to-r from-purple-500/50 to-cyan-500/50" />
        </div>
      )}

      {/* Step circle */}
      <div
        className={cn(
          "relative z-10 w-20 h-20 rounded-full flex items-center justify-center",
          "border-2 border-purple-500/30",
          "hover:border-purple-500 transition-all duration-300",
          "shadow-lg shadow-purple-500/10",
          theme === "dark"
            ? "bg-gradient-to-br from-[#1a1a25] to-[#12121a]"
            : "bg-gradient-to-br from-white to-gray-50",
          "opacity-0 scale-75",
          isVisible && "opacity-100 scale-100"
        )}
        style={{ transitionDelay: `${index * 150}ms`, transitionDuration: "500ms" }}
      >
        {step.icon}
      </div>

      {/* Step number */}
      <span
        className={cn(
          "mt-4 text-xs font-bold text-purple-500",
          "opacity-0",
          isVisible && "opacity-100"
        )}
        style={{ transitionDelay: `${index * 150 + 100}ms`, transitionDuration: "500ms" }}
      >
        {step.number}
      </span>

      {/* Content */}
      <h3
        className={cn(
          "mt-2 text-lg font-semibold",
          theme === "dark" ? "text-white" : "text-gray-900",
          "opacity-0 translate-y-4",
          isVisible && "opacity-100 translate-y-0"
        )}
        style={{ transitionDelay: `${index * 150 + 150}ms`, transitionDuration: "500ms" }}
      >
        {step.title}
      </h3>
      <p
        className={cn(
          "mt-2 text-sm text-center max-w-xs",
          theme === "dark" ? "text-gray-400" : "text-gray-600",
          "opacity-0 translate-y-4",
          isVisible && "opacity-100 translate-y-0"
        )}
        style={{ transitionDelay: `${index * 150 + 200}ms`, transitionDuration: "500ms" }}
      >
        {step.description}
      </p>
    </div>
  );
}

export default function HowItWorksSection() {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { theme } = useTheme();

  return (
    <section
      id="how-it-works"
      className={cn(
        "py-24 transition-colors duration-300",
        theme === "dark"
          ? "bg-gradient-to-b from-[#0a0a0f] to-[#12121a]"
          : "bg-gradient-to-b from-gray-50 to-white"
      )}
    >
      <div className="max-w-6xl mx-auto px-6">
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
            How It{" "}
            <span className="bg-gradient-to-r from-cyan-500 to-pink-500 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
            Four simple steps to transform anime moments into content
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {steps.map((step, index) => (
            <StepCard
              key={step.number}
              step={step}
              index={index}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
