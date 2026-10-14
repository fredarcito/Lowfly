import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useI18n } from "@/context/i18n";
import { AIRLINES } from "@/utils/format";

const FailedNote = ({ failed }) => {
  const { t } = useI18n();
  if (!failed?.length) return null;
  return (
    <Alert className="border-amber-500/40 bg-amber-500/10 text-foreground">
      <TriangleAlert className="text-amber-600 dark:text-amber-400" />
      <AlertTitle>{t.results.incomplete}</AlertTitle>
      <AlertDescription className="text-muted-foreground">
        {t.results.failed(failed.map((a) => AIRLINES[a]), failed.length > 1)}
      </AlertDescription>
    </Alert>
  );
};

export default FailedNote;
