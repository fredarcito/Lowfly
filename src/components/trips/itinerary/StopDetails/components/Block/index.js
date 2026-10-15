"use client";



const Block = ({ title, children }) => {
  return (
    <div className="grid gap-0.5">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</p>
      <p className="text-sm">{children}</p>
    </div>
  );
};

export default Block;
