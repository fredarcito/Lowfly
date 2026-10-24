// The low-cost airlines found through Travelpayouts' flight data (server/travelpayouts), beyond Ryanair and Wizz Air
// (searched live): their IATA codes and their own website, where "Book" takes the traveller (always the airline,
// never an agency: the cheapest price, no commission). Their prices come from recent searches, so the airline
// confirms them. `deeplink`: builds a link to that flight's search on the airline's site; without one, its home page.
export const MORE_AIRLINES = {
  easyjet: {
    name: "easyJet",
    codes: ["U2", "EC", "DS"],
    home: "https://www.easyjet.com",
    deeplink: ({ lang, dep, arr, day, retDay, passengers }) =>
      `https://www.easyjet.com/deeplink?lang=${lang.toUpperCase()}&dep=${dep}&dest=${arr}&dd=${day}${retDay ? `&rd=${retDay}` : ""}&apax=${passengers}&cpax=0&ipax=0`,
  },
  vueling: { name: "Vueling", codes: ["VY"], home: "https://www.vueling.com" },
  volotea: { name: "Volotea", codes: ["V7"], home: "https://www.volotea.com" },
  jet2: { name: "Jet2", codes: ["LS"], home: "https://www.jet2.com" },
  transavia: { name: "Transavia", codes: ["HV", "TO"], home: "https://www.transavia.com" },
  eurowings: { name: "Eurowings", codes: ["EW"], home: "https://www.eurowings.com" },
  norwegian: { name: "Norwegian", codes: ["DY", "D8"], home: "https://www.norwegian.com" },
  pegasus: { name: "Pegasus", codes: ["PC"], home: "https://www.flypgs.com" },
};

// The ones of them whose routes go into the route graph (server/routeGraph, scripts/extra-airports.mjs), so the
// stopovers' getaways and the multi-city routes use them too (never a same-day connection: their prices are not live)
export const GRAPH_MORE_AIRLINES = ["easyjet", "vueling"];

// The airline for an IATA code ("U2" → "easyjet"), or undefined for one we do not show
export const airlineOfCode = Object.fromEntries(Object.entries(MORE_AIRLINES).flatMap(([id, airline]) => airline.codes.map((code) => [code, id])));
