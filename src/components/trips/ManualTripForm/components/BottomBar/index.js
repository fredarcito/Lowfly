"use client";


// Phones and tablets: fixed at the bottom for the whole wizard, a line about the route (`summary`) and the
// actions slot (`children`). It slides up when the wizard opens; going between steps it stays put, only the
// slot's content changes.
const BottomBar = ({ summary, children }) => {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] backdrop-blur-md duration-500 ease-out animate-in slide-in-from-bottom-full motion-reduce:animate-none lg:hidden"
    >
      <div className="mx-auto grid max-w-2xl gap-2">
        {summary}
        {children}
      </div>
    </div>
  );
};

export default BottomBar;
