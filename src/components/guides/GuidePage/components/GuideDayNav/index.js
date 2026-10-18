"use client";

import { useActiveDay } from "@/components/guides/GuidePage/components/GuideDayNav/hooks/useActiveDay";
import { cn } from "@/utils/cn";

// The guide's days as links above them (centred from tablets up, each title cut short so they stay so), kept at
// the top while reading: "Día 1 · El corazón histórico…", the one
// being read underlined in coral. Every day stays in the page (search engines read them all); the links only take
// the reader there. `days`: [{ id, name, title }] (id: its section's, GuideDay; name: "Día 1"); `label`: the links'.
// Gliding to the day (straight there for whoever asks their device for less motion), its address still #day-2
const goTo = (event, id) => {
  const section = document.getElementById(id);
  if (!section) return;
  event.preventDefault();
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  section.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
  window.history.pushState(null, "", `#${id}`);
};

const GuideDayNav = ({ days, label }) => {
  const active = useActiveDay(days.map((day) => day.id));
  return (
    <nav aria-label={label} className="sticky top-0 z-20 -mx-4 border-b bg-background/90 px-4 backdrop-blur-md sm:-mx-6 sm:px-6">
      <ol className="-mb-px flex gap-6 overflow-x-auto [scrollbar-width:none] sm:justify-center sm:gap-10">
        {days.map((day) => (
          <li key={day.id} className="shrink-0">
            <a
              href={`#${day.id}`}
              onClick={(event) => goTo(event, day.id)}
              aria-current={day.id === active ? "location" : undefined}
              className={cn(
                "flex max-w-[15rem] items-center gap-1.5 border-b-2 py-3 text-sm font-semibold whitespace-nowrap transition",
                day.id === active ? "border-primary text-primary-ink" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {day.name}
              <span className="truncate font-medium max-sm:hidden">· {day.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default GuideDayNav;
