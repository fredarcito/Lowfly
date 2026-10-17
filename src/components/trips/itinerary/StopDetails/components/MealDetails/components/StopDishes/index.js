"use client";

// What to order at a meal: each typical dish's name, what it is and, quieter, why to try it there
const StopDishes = ({ dishes }) => {
  return (
    <ul className="grid gap-3">
      {dishes.map((dish) => (
        <li key={dish.name} className="grid gap-0.5 border-l-2 border-sun-ink/80 pl-3">
          <p className="text-sm font-semibold">{dish.name}</p>
          {dish.what && <p className="text-sm text-muted-foreground">{dish.what}</p>}
          {dish.why && <p className="text-xs text-muted-foreground">{dish.why}</p>}
        </li>
      ))}
    </ul>
  );
};

export default StopDishes;
