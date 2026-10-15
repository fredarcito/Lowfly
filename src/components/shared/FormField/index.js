import { Label } from "@/components/ui/label";
import { cn } from "@/utils/cn";

// A labelled field with an optional hint under it. Its column keeps its width whatever the field shows.
const FormField = ({ id, label, hint, className, children }) => (
  <div className={cn("grid min-w-0 grid-cols-1 content-start gap-1.5", className)}>
    <Label htmlFor={id} className="text-muted-foreground">
      {label}
    </Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export default FormField;
