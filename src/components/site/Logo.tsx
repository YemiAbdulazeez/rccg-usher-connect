import { logoUrl } from "@/assets/images";

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: "default" | "light";
}

export function Logo({ className = "", showText = true, variant = "default" }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative shrink-0">
        <div className="absolute inset-0 rounded-full bg-gradient-brand blur-lg opacity-30" />
        <img
          src={logoUrl}
          alt="RCCG National Ushering Department"
          width={44}
          height={44}
          className="relative h-11 w-11 object-contain"
        />
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`text-base font-bold tracking-tight ${
              variant === "light" ? "text-white" : "text-foreground"
            }`}
          >
            RNUMS
          </span>
          <span
            className={`text-[10px] uppercase tracking-[0.18em] ${
              variant === "light" ? "text-white/70" : "text-muted-foreground"
            }`}
          >
            RCCG Ushering
          </span>
        </div>
      )}
    </div>
  );
}
