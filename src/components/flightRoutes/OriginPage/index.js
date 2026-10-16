import DestinationColumns from "@/components/flightRoutes/DestinationColumns";

// An airport's page body (/es/flights/malta; the photo header is OriginHero): every destination with a direct
// flight, by region, each with its lowest price of the next months and a link to its route page.
// `prices`: { slug: written price }.
const OriginPage = ({ lang, routes, prices }) => (
  <section className="rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
    <DestinationColumns lang={lang} routes={routes} prices={prices} />
  </section>
);

export default OriginPage;
