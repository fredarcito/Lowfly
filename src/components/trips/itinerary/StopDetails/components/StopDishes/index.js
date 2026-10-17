"use client";

import { useI18n } from "@/context/i18n";

// What to order at a meal: each typical dish's name, what it is and why to try it there
const StopDishes = ({ dishes }) => {
  const { texts } = useI18n();
  return (
    <div className="grid gap-2">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{texts.trips.whatToOrder}</p>
      <ul className="grid gap-2.5">
        {dishes.map((dish) => (
          <li key={dish.name} className="grid gap-0.5 border-l-2 border-sun/50 pl-3 text-sm">
            <p className="font-semibold">{dish.name}</p>
            {(dish.what || dish.why) && <p className="text-muted-foreground">{[dish.what, dish.why].filter(Boolean).join(" ")}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StopDishes;
