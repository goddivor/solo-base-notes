import { cn } from "@/lib/utils";
import { useTheme } from "@/context/theme-context";
import { useScrollAnimation } from "./useScrollAnimation";
import { TickCircle } from "iconsax-react";

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "Up to 50 extracts",
      "3 themes",
      "Basic anime search",
      "Manual export",
      "Community support",
    ],
    cta: "Get Started Free",
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    description: "For serious content creators",
    features: [
      "Unlimited extracts",
      "Unlimited themes",
      "Advanced search filters",
      "AI scene detection",
      "Bulk export",
      "Analytics dashboard",
      "Priority support",
      "Custom thumbnails",
    ],
    highlighted: true,
    cta: "Start 14-Day Trial",
  },
  {
    name: "Enterprise",
    price: "$49",
    period: "/month",
    description: "For teams and agencies",
    features: [
      "Everything in Pro",
      "Team collaboration (5 seats)",
      "API access",
      "White-label exports",
      "Custom integrations",
      "Dedicated account manager",
      "99.9% SLA",
    ],
    cta: "Contact Sales",
  },
];

interface PricingCardProps {
  tier: PricingTier;
  index: number;
  onSelect: () => void;
}

function PricingCard({ tier, index, onSelect }: PricingCardProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const { theme } = useTheme();

  return (
    <div
      ref={ref}
      className={cn(
        "relative rounded-2xl p-8 transition-all duration-500",
        tier.highlighted
          ? theme === "dark"
            ? "bg-gradient-to-b from-purple-500/20 to-[#12121a] border-2 border-purple-500 shadow-2xl shadow-purple-500/20 lg:scale-105"
            : "bg-gradient-to-b from-purple-100 to-white border-2 border-purple-500 shadow-2xl shadow-purple-500/20 lg:scale-105"
          : theme === "dark"
          ? "bg-[#12121a] border border-gray-800 hover:border-gray-700"
          : "bg-white border border-gray-200 hover:border-gray-300",
        "opacity-0 translate-y-8",
        isVisible && "opacity-100 translate-y-0"
      )}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {tier.highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full text-xs font-bold text-white whitespace-nowrap">
          MOST POPULAR
        </div>
      )}

      <div className="text-center mb-8">
        <h3
          className={cn(
            "text-xl font-bold mb-2",
            theme === "dark" ? "text-white" : "text-gray-900"
          )}
        >
          {tier.name}
        </h3>
        <p
          className={cn(
            "text-sm mb-4",
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          )}
        >
          {tier.description}
        </p>
        <div className="flex items-baseline justify-center gap-1">
          <span
            className={cn(
              "text-4xl font-bold",
              theme === "dark" ? "text-white" : "text-gray-900"
            )}
          >
            {tier.price}
          </span>
          <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
            {tier.period}
          </span>
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {tier.features.map((feature) => (
          <li
            key={feature}
            className={cn(
              "flex items-start gap-3 text-sm",
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            )}
          >
            <TickCircle
              size={18}
              color="#a855f7"
              variant="Bold"
              className="flex-shrink-0 mt-0.5"
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        className={cn(
          "w-full py-3 rounded-xl font-semibold transition-all duration-300",
          tier.highlighted
            ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02]"
            : theme === "dark"
            ? "bg-gray-800 text-white hover:bg-gray-700"
            : "bg-gray-100 text-gray-900 hover:bg-gray-200"
        )}
      >
        {tier.cta}
      </button>
    </div>
  );
}

interface PricingSectionProps {
  onGetStarted: () => void;
}

export default function PricingSection({ onGetStarted }: PricingSectionProps) {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { theme } = useTheme();

  return (
    <section
      id="pricing"
      className={cn(
        "py-24 transition-colors duration-300",
        theme === "dark" ? "bg-[#0a0a0f]" : "bg-white"
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
            Simple,{" "}
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Transparent Pricing
            </span>
          </h2>
          <p
            className={cn(
              "max-w-xl mx-auto",
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}
          >
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6 items-start">
          {pricingTiers.map((tier, index) => (
            <PricingCard
              key={tier.name}
              tier={tier}
              index={index}
              onSelect={onGetStarted}
            />
          ))}
        </div>

        {/* FAQ Note */}
        <p
          className={cn(
            "text-center text-sm mt-12",
            theme === "dark" ? "text-gray-500" : "text-gray-500"
          )}
        >
          All plans include 24/7 email support and access to our creator community.
        </p>
      </div>
    </section>
  );
}
