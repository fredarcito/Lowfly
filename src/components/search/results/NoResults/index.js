import { PlaneLanding } from "lucide-react";
import FailedNote from "@/components/search/results/FailedNote";
import { useI18n } from "@/context/i18n";

const NoResults = ({ failed, children }) => {
  const { texts } = useI18n();
  return (
    <>
      <div className="grid justify-items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
        <PlaneLanding className="size-8 text-muted-foreground" />
        <p className="font-heading text-lg font-semibold">{texts.results.noFlights}</p>
        <p className="max-w-[45ch] text-sm text-muted-foreground">{children}</p>
      </div>
      <FailedNote failed={failed} />
    </>
  );
};

export default NoResults;
