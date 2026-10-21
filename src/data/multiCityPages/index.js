// The multi-city routes' own pages (/es/recorridos/italia-clasica; docs/multi-city.md, route pages): one file per
// route, named after its id (src/data/multiCityPages/italia-clasica.json), joined here into the object the server
// reads (src/server/multiCity/pages.js). A route's page is written once, by hand, and never made on a visit: `slugs`
// (the page's name in each language), `photos` by the town's English name, `reviewed` and `writtenAt`, and per
// language `title`, `metaTitle`, `summary`, `why`, `towns` by the town's English name, `gettingAround`, `bestTime`
// and `faq`.
import italiaClasica from "./italia-clasica.json";
import napolesYCostaAmalfitana from "./napoles-y-costa-amalfitana.json";
import toscana from "./toscana.json";
import norteDeItaliaYLagos from "./norte-de-italia-y-lagos.json";
import sicilia from "./sicilia.json";
import pugliaYMatera from "./puglia-y-matera.json";
import liguriaYCinqueTerre from "./liguria-y-cinque-terre.json";
import cerdena from "./cerdena.json";
import maltaYGozo from "./malta-y-gozo.json";
import dolomitas from "./dolomitas.json";
import emiliaRomana from "./emilia-romana.json";
import umbria from "./umbria.json";

const pages = {
  "italia-clasica": italiaClasica,
  "napoles-y-costa-amalfitana": napolesYCostaAmalfitana,
  toscana,
  "norte-de-italia-y-lagos": norteDeItaliaYLagos,
  sicilia,
  "puglia-y-matera": pugliaYMatera,
  "liguria-y-cinque-terre": liguriaYCinqueTerre,
  cerdena,
  "malta-y-gozo": maltaYGozo,
  dolomitas,
  "emilia-romana": emiliaRomana,
  umbria,
};

export default pages;
