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
import andalucia from "./andalucia.json";
import portugalClasico from "./portugal-clasico.json";
import lisboaYAlgarve from "./lisboa-y-algarve.json";
import norteDeEspana from "./norte-de-espana.json";
import galiciaYOporto from "./galicia-y-oporto.json";
import provenzaYCostaAzul from "./provenza-y-costa-azul.json";
import alsacia from "./alsacia.json";
import burdeosYPaisVascoFrances from "./burdeos-y-pais-vasco-frances.json";
import parisYNormandia from "./paris-y-normandia.json";
import castilla from "./castilla.json";
import cataluna from "./cataluna.json";
import extremadura from "./extremadura.json";
import madeira from "./madeira.json";
import azoresSaoMiguel from "./azores-sao-miguel.json";
import comunidadValenciana from "./comunidad-valenciana.json";
import valleDelDuero from "./valle-del-duero.json";
import castillosDelLoire from "./castillos-del-loira.json";
import occitania from "./occitania.json";
import bretana from "./bretana.json";
import navidadEnAlsacia from "./navidad-en-alsacia.json";
import navidadEnBaviera from "./navidad-en-baviera.json";
import navidadEnElRin from "./navidad-en-el-rin.json";
import navidadBerlinDresdePraga from "./navidad-berlin-dresde-praga.json";
import navidadEnCentroeuropa from "./navidad-en-centroeuropa.json";
import navidadEnPolonia from "./navidad-en-polonia.json";
import navidadEnElBaltico from "./navidad-en-el-baltico.json";

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
  andalucia,
  "portugal-clasico": portugalClasico,
  "lisboa-y-algarve": lisboaYAlgarve,
  "norte-de-espana": norteDeEspana,
  "galicia-y-oporto": galiciaYOporto,
  "provenza-y-costa-azul": provenzaYCostaAzul,
  alsacia,
  "burdeos-y-pais-vasco-frances": burdeosYPaisVascoFrances,
  "paris-y-normandia": parisYNormandia,
  castilla,
  cataluna,
  extremadura,
  madeira,
  "azores-sao-miguel": azoresSaoMiguel,
  "comunidad-valenciana": comunidadValenciana,
  "valle-del-duero": valleDelDuero,
  "castillos-del-loira": castillosDelLoire,
  occitania,
  bretana,
  "navidad-en-alsacia": navidadEnAlsacia,
  "navidad-en-baviera": navidadEnBaviera,
  "navidad-en-el-rin": navidadEnElRin,
  "navidad-berlin-dresde-praga": navidadBerlinDresdePraga,
  "navidad-en-centroeuropa": navidadEnCentroeuropa,
  "navidad-en-polonia": navidadEnPolonia,
  "navidad-en-el-baltico": navidadEnElBaltico,
};

export default pages;
