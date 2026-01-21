import { cn } from "@/lib/utils";
import { useTheme } from "@/context/theme-context";
import { useScrollAnimation } from "./useScrollAnimation";
import { QuoteUp } from "iconsax-react";

interface Testimonial {
  name: string;
  role: string;
  channel: string;
  content: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Yuki Tanaka",
    role: "Anime Quote Creator",
    channel: "@AnimeWisdom",
    content:
      "QuoteForge cut my video prep time in half. The theme organization is a game-changer for planning my weekly uploads. I can now focus on what I love - finding the best quotes.",
    avatar: "Y",
  },
  {
    name: "Marcus Chen",
    role: "YouTube Partner",
    channel: "@OtakuQuotes",
    content:
      "I went from 1 video a week to 3 after switching to QuoteForge. The AI scene detection is incredibly accurate and saves me hours of manual searching through episodes.",
    avatar: "M",
  },
  {
    name: "Sarah Kim",
    role: "Content Agency Owner",
    channel: "Weeb Media",
    content:
      "We manage 12 anime channels with QuoteForge. The team features and analytics have transformed our workflow. It's the backbone of our content operation.",
    avatar: "S",
  },
];

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: Testimonial;
  index: number;
}) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const { theme } = useTheme();

  const gradients = [
    "from-purple-500 to-purple-700",
    "from-cyan-500 to-cyan-700",
    "from-pink-500 to-pink-700",
  ];

  return (
    <div
      ref={ref}
      className={cn(
        "relative p-6 rounded-2xl",
        "transition-all duration-300",
        theme === "dark"
          ? "bg-[#12121a] border border-gray-800 hover:border-purple-500/30"
          : "bg-white border border-gray-200 hover:border-purple-300 shadow-sm hover:shadow-md",
        "opacity-0 translate-y-8",
        isVisible && "opacity-100 translate-y-0"
      )}
      style={{ transitionDelay: `${index * 150}ms`, transitionDuration: "500ms" }}
    >
      {/* Quote icon */}
      <div
        className={cn(
          "absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center",
          theme === "dark" ? "bg-[#0a0a0f]" : "bg-gray-50"
        )}
      >
        <QuoteUp size={16} color="#a855f7" variant="Bold" />
      </div>

      {/* Content */}
      <p
        className={cn(
          "leading-relaxed mb-6",
          theme === "dark" ? "text-gray-300" : "text-gray-700"
        )}
      >
        "{testimonial.content}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            "bg-gradient-to-br text-white font-bold text-lg",
            gradients[index % gradients.length]
          )}
        >
          {testimonial.avatar}
        </div>
        <div>
          <h4
            className={cn(
              "font-semibold",
              theme === "dark" ? "text-white" : "text-gray-900"
            )}
          >
            {testimonial.name}
          </h4>
          <p
            className={cn(
              "text-sm",
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}
          >
            {testimonial.role}
          </p>
          <p className="text-xs text-purple-500">{testimonial.channel}</p>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { theme } = useTheme();

  return (
    <section
      className={cn(
        "py-24 transition-colors duration-300",
        theme === "dark"
          ? "bg-gradient-to-b from-[#12121a] to-[#0a0a0f]"
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
            Loved by{" "}
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Creators
            </span>
          </h2>
          <p
            className={cn(
              "max-w-xl mx-auto",
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}
          >
            Join thousands of anime content creators who trust QuoteForge for their
            workflow
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.name}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
