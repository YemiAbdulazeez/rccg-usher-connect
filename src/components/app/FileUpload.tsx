import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import type { ReactNode } from "react";

export function FileUpload({
  label, instruction, value, onChange, err, icon, optional,
}: {
  label: string; instruction: string; value?: string; onChange: (v: string) => void; err?: boolean; icon?: ReactNode; optional?: boolean;
}) {
  const onPick = (file: File | null) => {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { toast.error("File too large", { description: "Max 4MB." }); return; }
    const r = new FileReader();
    r.onload = () => onChange(String(r.result));
    r.readAsDataURL(file);
  };
  return (
    <div className="space-y-2 sm:col-span-1">
      <Label className="flex items-center gap-2">{icon}{label} {optional ? <span className="text-xs text-muted-foreground">(optional)</span> : <span className="text-destructive">*</span>}</Label>
      <p className="text-xs text-muted-foreground">{instruction}</p>
      <div className={`rounded-md border-2 border-dashed p-3 flex items-center gap-3 ${err ? "border-destructive" : "border-border"}`}>
        {value ? (
          <img src={value} alt={label} className="h-16 w-16 object-cover rounded bg-muted" />
        ) : (
          <div className="h-16 w-16 rounded bg-muted flex items-center justify-center text-muted-foreground">
            <Upload className="h-5 w-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Input type="file" accept="image/*" onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
          {value && <p className="text-[11px] text-success mt-1">Uploaded ✓ — choose another to replace</p>}
        </div>
      </div>
    </div>
  );
}
