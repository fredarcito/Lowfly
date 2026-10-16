import GlobalLimitForm from "@/components/admin/AdminSettings/components/GlobalLimitForm";
import { adminTexts } from "@/components/admin/data/texts";

// What the admin can change for the whole app, without a deploy
const AdminSettings = ({ globalLimit, lang }) => {
  const texts = adminTexts(lang).settings;
  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{texts.title}</h1>
        <p className="text-muted-foreground">{texts.subtitle}</p>
      </div>
      <section className="grid max-w-md gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <div className="grid gap-0.5">
          <h2 className="font-heading text-lg font-bold">{texts.limitTitle}</h2>
          <p className="text-sm text-muted-foreground">{texts.limitHint}</p>
        </div>
        <GlobalLimitForm globalLimit={globalLimit} />
      </section>
    </div>
  );
};

export default AdminSettings;
