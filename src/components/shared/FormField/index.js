import { Label } from "@/components/ui/label";
import { cn } from "@/utils/cn";

// A labelled field with an optional hint under it, or a short note beside its label. Its column keeps its width
// whatever the field shows.
const FormField = ({ id, label, note, hint, className, children }) => (
  <div className={cn("grid min-w-0 grid-cols-1 content-start gap-1.5", className)}>
    <div className="flex min-w-0 items-baseline gap-2">
      <Label htmlFor={id} className="text-muted-foreground">
        {label}
      </Label>
      {note && <span className="truncate text-xs text-muted-foreground/70">{note}</span>}
    </div>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export default FormField;
