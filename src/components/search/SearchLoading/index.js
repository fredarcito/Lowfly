import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_ROWS = 5;

// While searching: what is being done, and the shape of the results to come
const SearchLoading = ({ text }) => (
  <div className="grid gap-4">
    <p className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" /> {text}
    </p>
    <Skeleton className="h-40 rounded-xl" />
    <div className="grid gap-2">
      {Array.from({ length: SKELETON_ROWS }, (_, row) => (
        <Skeleton key={row} className="h-16 rounded-lg" />
      ))}
    </div>
  </div>
);

export default SearchLoading;
