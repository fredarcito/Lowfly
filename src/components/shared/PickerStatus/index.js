import { Loader2 } from "lucide-react";

// What a picker shows while its options load, or when they could not be loaded
const PickerStatus = ({ status, loading, error }) => (
  <p className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
    {status === "loading" && <Loader2 className="size-4 animate-spin" />}
    {status === "loading" ? loading : error}
  </p>
);

export default PickerStatus;
