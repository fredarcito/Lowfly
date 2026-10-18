import { Sparkles } from "lucide-react";
import TailorLink from "@/components/guides/GuidePage/components/TailorLink";

// One of the "make it yours" prompts, the foot of a day's card (GuideDay): a question the guide cannot answer for
// everyone (when do you arrive? at what pace?) and the way to the planner that does. Part of the day, so a reader
// who jumps to it with the days' links still meets it. `prompt`: { title, text, button }
const TailorPrompt = ({ prompt, href, guide, spot }) => (
  <aside className="flex flex-wrap items-center justify-between gap-4 border-t border-primary/20 bg-primary/8 px-4 py-4 sm:px-5">
    <div className="flex min-w-0 flex-1 basis-72 gap-3">
      <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
      <div className="grid gap-0.5">
        <p className="font-heading font-bold">{prompt.title}</p>
        <p className="text-sm text-muted-foreground">{prompt.text}</p>
      </div>
    </div>
    <TailorLink href={href} guide={guide} spot={spot} variant="outline" className="h-10 font-semibold max-sm:w-full">
      {prompt.button}
    </TailorLink>
  </aside>
);

export default TailorPrompt;
