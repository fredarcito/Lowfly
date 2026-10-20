"use client";

import { CalendarRange, Globe, MapPinned, Route } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/context/i18n";

// Texts live in the dictionary: texts.modes[id].label / short / hint
export const MODES = [
  { id: "everywhere", icon: Globe },
  { id: "country", icon: MapPinned },
  { id: "trip", icon: CalendarRange },
  { id: "multiCity", icon: Route },
];

// The four ways to search, as tabs over `children` (the search form): the form is the open tab's panel, so each tab
// points to something real for screen readers (aria-controls). Not a stop of its own when tabbing: the form's
// fields are.
const ModeTabs = ({ mode, onChange, children }) => {
  const { texts } = useI18n();
  return (
    <Tabs value={mode} onValueChange={onChange} className="gap-4 sm:gap-5">
      <TabsList aria-label={texts.modes.aria} className="grid h-auto! w-full grid-cols-4 p-1 sm:inline-grid sm:w-auto">
        {MODES.map(({ id, icon: Icon }) => (
          <TabsTrigger
            key={id}
            value={id}
            className="h-auto min-h-10 min-w-0 flex-col gap-1 px-1 py-1.5 text-xs leading-tight whitespace-normal data-active:bg-selected! data-active:[-webkit-text-stroke:0.4px_currentColor] data-active:text-foreground! data-active:[&_svg]:text-primary sm:flex-row sm:gap-2 sm:px-4 sm:text-sm sm:whitespace-nowrap"
          >
            <Icon />
            <span className="text-center sm:hidden">{texts.modes[id].short}</span>
            <span className="hidden sm:inline">{texts.modes[id].label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={mode} tabIndex={-1} className="[font-size:inherit]">
        {children}
      </TabsContent>
    </Tabs>
  );
};

export default ModeTabs;
