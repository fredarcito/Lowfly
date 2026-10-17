// Structured data for search engines (schema.org, JSON-LD), rendered on the server with the page. `data`: the
// object. Every "<" is escaped, so a name coming from the airlines or the AI can never close the script.
const JsonLd = ({ data }) => {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
};

export default JsonLd;
