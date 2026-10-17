"use client";

// One part of an opened meal ("Where to look", "What to order"): its icon and title over what it says
const MealSection = ({ icon: Icon, title, children }) => {
  return (
    <section className="grid gap-2 px-3 py-3 sm:px-4">
      <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        <Icon className="size-3.5 shrink-0" /> {title}
      </p>
      {children}
    </section>
  );
};

export default MealSection;
