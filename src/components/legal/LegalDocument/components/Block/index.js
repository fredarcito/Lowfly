

// A paragraph, or a bulleted list when it is an array
const Block = ({ block }) =>
  Array.isArray(block) ? (
    <ul className="grid list-disc gap-1.5 pl-5 marker:text-muted-foreground">
      {block.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  ) : (
    <p>{block}</p>
  );

export default Block;
