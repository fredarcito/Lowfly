// The multi-city routes' own pages (/es/recorridos/classic-italy; docs/multi-city.md, route pages): one file per
// route, named after its id (src/data/multiCityPages/classic-italy.json), joined here into the object the server
// reads (src/server/multiCity/pages.js). A route's page is written once, by hand, and never made on a visit: `slugs`
// (the page's name in each language), `photos` by the town's English name, `reviewed` and `writtenAt`, and per
// language `title`, `metaTitle`, `summary`, `why`, `towns` by the town's English name, `gettingAround`, `bestTime`
// and `faq`.
import classicItaly from "./classic-italy.json";
import naplesAmalfiCoast from "./naples-amalfi-coast.json";
import tuscany from "./tuscany.json";
import northernItalyLakes from "./northern-italy-lakes.json";
import sicily from "./sicily.json";
import pugliaMatera from "./puglia-matera.json";
import liguriaCinqueTerre from "./liguria-cinque-terre.json";
import sardinia from "./sardinia.json";
import maltaGozo from "./malta-gozo.json";
import dolomites from "./dolomites.json";
import emiliaRomagna from "./emilia-romagna.json";
import umbria from "./umbria.json";
import andalusia from "./andalusia.json";
import classicPortugal from "./classic-portugal.json";
import lisbonAlgarve from "./lisbon-algarve.json";
import northernSpain from "./northern-spain.json";
import galiciaPorto from "./galicia-porto.json";
import provenceCoteDazur from "./provence-cote-dazur.json";
import alsace from "./alsace.json";
import bordeauxFrenchBasque from "./bordeaux-french-basque.json";
import parisNormandy from "./paris-normandy.json";
import castile from "./castile.json";
import catalonia from "./catalonia.json";
import extremadura from "./extremadura.json";
import madeira from "./madeira.json";
import azoresSaoMiguel from "./azores-sao-miguel.json";
import valencianCommunity from "./valencian-community.json";
import douroValley from "./douro-valley.json";
import loireCastles from "./loire-castles.json";
import occitanie from "./occitanie.json";
import brittany from "./brittany.json";
import christmasAlsace from "./christmas-alsace.json";
import christmasBavaria from "./christmas-bavaria.json";
import christmasRhine from "./christmas-rhine.json";
import christmasBerlinDresdenPrague from "./christmas-berlin-dresden-prague.json";
import christmasCentralEurope from "./christmas-central-europe.json";
import christmasPoland from "./christmas-poland.json";
import christmasBaltics from "./christmas-baltics.json";
import benelux from "./benelux.json";
import bavariaSalzburg from "./bavaria-salzburg.json";
import berlinDresdenPrague from "./berlin-dresden-prague.json";
import rhineValley from "./rhine-valley.json";
import switzerland from "./switzerland.json";
import scotland from "./scotland.json";
import classicEngland from "./classic-england.json";
import ireland from "./ireland.json";
import scandinavia from "./scandinavia.json";
import norwegianFjords from "./norwegian-fjords.json";
import northernGermany from "./northern-germany.json";
import finnishLapland from "./finnish-lapland.json";
import tromsoNorwegianLapland from "./tromso-norwegian-lapland.json";
import blackForest from "./black-forest.json";
import northernIreland from "./northern-ireland.json";
import wales from "./wales.json";
import cornwall from "./cornwall.json";
import iceland from "./iceland.json";
import westernCanaries from "./western-canaries.json";
import easternCanaries from "./eastern-canaries.json";
import mallorcaMenorca from "./mallorca-menorca.json";
import ibizaFormentera from "./ibiza-formentera.json";

const pages = {
  "classic-italy": classicItaly,
  "naples-amalfi-coast": naplesAmalfiCoast,
  "tuscany": tuscany,
  "northern-italy-lakes": northernItalyLakes,
  "sicily": sicily,
  "puglia-matera": pugliaMatera,
  "liguria-cinque-terre": liguriaCinqueTerre,
  "sardinia": sardinia,
  "malta-gozo": maltaGozo,
  "dolomites": dolomites,
  "emilia-romagna": emiliaRomagna,
  "umbria": umbria,
  "andalusia": andalusia,
  "classic-portugal": classicPortugal,
  "lisbon-algarve": lisbonAlgarve,
  "northern-spain": northernSpain,
  "galicia-porto": galiciaPorto,
  "provence-cote-dazur": provenceCoteDazur,
  "alsace": alsace,
  "bordeaux-french-basque": bordeauxFrenchBasque,
  "paris-normandy": parisNormandy,
  "castile": castile,
  "catalonia": catalonia,
  "extremadura": extremadura,
  "madeira": madeira,
  "azores-sao-miguel": azoresSaoMiguel,
  "valencian-community": valencianCommunity,
  "douro-valley": douroValley,
  "loire-castles": loireCastles,
  "occitanie": occitanie,
  "brittany": brittany,
  "christmas-alsace": christmasAlsace,
  "christmas-bavaria": christmasBavaria,
  "christmas-rhine": christmasRhine,
  "christmas-berlin-dresden-prague": christmasBerlinDresdenPrague,
  "christmas-central-europe": christmasCentralEurope,
  "christmas-poland": christmasPoland,
  "christmas-baltics": christmasBaltics,
  "benelux": benelux,
  "bavaria-salzburg": bavariaSalzburg,
  "berlin-dresden-prague": berlinDresdenPrague,
  "rhine-valley": rhineValley,
  "switzerland": switzerland,
  "scotland": scotland,
  "classic-england": classicEngland,
  "ireland": ireland,
  "scandinavia": scandinavia,
  "norwegian-fjords": norwegianFjords,
  "northern-germany": northernGermany,
  "finnish-lapland": finnishLapland,
  "tromso-norwegian-lapland": tromsoNorwegianLapland,
  "black-forest": blackForest,
  "northern-ireland": northernIreland,
  "wales": wales,
  "cornwall": cornwall,
  "iceland": iceland,
  "western-canaries": westernCanaries,
  "eastern-canaries": easternCanaries,
  "mallorca-menorca": mallorcaMenorca,
  "ibiza-formentera": ibizaFormentera,
};

export default pages;
