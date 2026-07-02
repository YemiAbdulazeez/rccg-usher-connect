import { ReactNode } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface ModulePageProps {
  eyebrow?: string;
  title: string;
  description: string;
  features: { title: string; description: string; icon: ReactNode }[];
  primaryAction?: { label: string; onClick?: () => void };
  children?: ReactNode;
}

export function ModulePage({ eyebrow, title, description, features, primaryAction, children }: ModulePageProps) {
  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <Card className="overflow-hidden border-0 shadow-elegant bg-gradient-hero text-white">
        <CardContent className="p-6 md:p-10 relative">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          <div className="relative max-w-3xl">
            {eyebrow && (
              <Badge className="bg-white/15 text-white border-white/20 backdrop-blur mb-3">
                <Sparkles className="h-3 w-3 mr-1" /> {eyebrow}
              </Badge>
            )}
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight">{title}</h2>
            <p className="mt-3 text-white/80 text-base md:text-lg leading-relaxed">{description}</p>
            {primaryAction && (
              <Button
                variant="hero"
                size="lg"
                className="mt-6"
                onClick={primaryAction.onClick ?? (() => toast.success(primaryAction.label, { description: "Action recorded. A workflow step has been initiated." }))}
              >
                {primaryAction.label}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title} className="border-border/60 shadow-card-elegant hover:shadow-elegant hover:-translate-y-0.5 transition-smooth">
            <CardContent className="p-5">
              <div className="h-10 w-10 rounded-lg bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-soft mb-3">
                {f.icon}
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{f.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {children}
    </div>
  );
}
