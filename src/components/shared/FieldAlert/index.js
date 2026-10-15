import { CircleAlert } from "lucide-react";
import { cn } from "@/utils/cn";

// A problem to fix, under a field or a form (read out by screen readers when it appears)
const FieldAlert = ({ className, children }) => (
  <p role="alert" className={cn("flex items-center gap-2 text-sm text-destructive", className)}>
    <CircleAlert className="size-4 shrink-0" /> {children}
  </p>
);

export default FieldAlert;
