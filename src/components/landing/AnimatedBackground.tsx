import { useTheme } from "@/context/theme-context";

export default function AnimatedBackground() {
  const { theme } = useTheme();

  if (theme === "light") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Light mode gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-200/30 rounded-full blur-[100px] animate-float-slow delay-200" />
        <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-pink-200/30 rounded-full blur-[80px] animate-float delay-500" />
        <div className="absolute bottom-1/3 left-1/3 w-[350px] h-[350px] bg-violet-200/25 rounded-full blur-[90px] animate-float-slow delay-700" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(147, 51, 234, 0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(147, 51, 234, 0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Radial gradient overlay for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,white_70%)]" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Dark mode gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[100px] animate-float-slow delay-200" />
      <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-pink-500/20 rounded-full blur-[80px] animate-float delay-500" />
      <div className="absolute bottom-1/3 left-1/3 w-[350px] h-[350px] bg-violet-500/15 rounded-full blur-[90px] animate-float-slow delay-700" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(168, 85, 247, 0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0a0a0f_70%)]" />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
    </div>
  );
}
