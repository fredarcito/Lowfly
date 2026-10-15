"use client";



const Pill = ({ icon: Icon, children }) => {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium whitespace-nowrap">
      <Icon className="size-3.5 text-muted-foreground" />
      {children}
    </span>
  );
};

export default Pill;
