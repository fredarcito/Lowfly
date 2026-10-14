"use client";

import { CalendarRange, Globe, MapPinned } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/context/i18n";

// Texts live in the dictionary: t.modes[id].label / short / hint
export const MODES = [
  { id: "everywhere", icon: Globe },
  { id: "country", icon: MapPinned },
  { id: "trip", icon: CalendarRange },
];

const ModeTabs = ({ mode, onChange }) => {
  const { t } = useI18n();
  return (
    <Tabs value={mode} onValueChange={onChange}>
      <TabsList aria-label={t.modes.aria} className="grid h-auto! w-full grid-cols-3 p-1 sm:inline-grid sm:w-auto">
        {MODES.map(({ id, icon: Icon }) => (
          <TabsTrigger
            key={id}
            value={id}
            className="h-auto min-h-10 min-w-0 flex-col gap-1 px-1 py-1.5 text-xs leading-tight whitespace-normal data-active:bg-selected! data-active:[-webkit-text-stroke:0.4px_currentColor] data-active:text-foreground! data-active:[&_svg]:text-primary sm:flex-row sm:gap-2 sm:px-4 sm:text-sm sm:whitespace-nowrap"
          >
            <Icon />
            <span className="text-center sm:hidden">{t.modes[id].short}</span>
            <span className="hidden sm:inline">{t.modes[id].label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default ModeTabs;
