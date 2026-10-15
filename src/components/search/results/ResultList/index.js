// The box that holds a list of <ResultRow>s, one under the other
const ResultList = ({ children }) => {
  return <div className="divide-y overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">{children}</div>;
};

export default ResultList;
