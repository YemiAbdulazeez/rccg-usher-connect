import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  icon?: ReactNode;
  tone?: "primary" | "success" | "destructive" | "gold";
}

const toneMap = {
  primary: "from-primary/10 to-primary/0 text-primary",
  success: "from-success/10 to-success/0 text-success",
  destructive: "from-destructive/10 to-destructive/0 text-destructive",
  gold: "from-gold/15 to-gold/0 text-gold-foreground",
};

export function StatCard({ label, value, trend, icon, tone = "primary" }: StatCardProps) {
  return (
    <Card className="overflow-hidden border-border/60 shadow-card-elegant hover:shadow-elegant transition-smooth">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="text-2xl md:text-3xl font-bold mt-2 tracking-tight">{value}</p>
            {trend && <p className="text-xs text-success mt-1 font-medium">{trend}</p>}
          </div>
          {icon && (
            <div className={cn("h-11 w-11 rounded-xl bg-gradient-to-br flex items-center justify-center", toneMap[tone])}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
