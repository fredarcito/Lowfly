import { PlaneLanding } from "lucide-react";
import FailedNote from "@/components/FailedNote";
import { useI18n } from "@/components/I18nProvider";

export default function NoResults({ failed, children }) {
  const { t } = useI18n();
  return (
    <>
      <div className="grid justify-items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
        <PlaneLanding className="size-8 text-muted-foreground" />
        <p className="font-heading text-lg font-semibold">{t.results.noFlights}</p>
        <p className="max-w-[45ch] text-sm text-muted-foreground">{children}</p>
      </div>
      <FailedNote failed={failed} />
    </>
  );
}
