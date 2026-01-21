import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../context/theme-context";
import { cn } from "../../lib/utils";
import {
  Navbar,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  StatsSection,
  PricingSection,
  TestimonialsSection,
  CTASection,
  Footer,
} from "../../components/landing";

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  const handleGoogleLogin = () => {
    const authUrl =
      import.meta.env.VITE_AUTH_URL || "http://localhost:4000/auth/google";
    window.location.href = authUrl;
  };

  return (
    <div
      className={cn(
        "min-h-screen overflow-x-hidden transition-colors duration-300",
        theme === "dark" ? "bg-[#0a0a0f] dark-scrollbar" : "bg-white"
      )}
    >
      <Navbar onGetStarted={handleGoogleLogin} />
      <HeroSection onGetStarted={handleGoogleLogin} />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <PricingSection onGetStarted={handleGoogleLogin} />
      <TestimonialsSection />
      <CTASection onGetStarted={handleGoogleLogin} />
      <Footer />
    </div>
  );
};

export default Landing;
