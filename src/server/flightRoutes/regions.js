// The region of each destination country, to group a route page's other destinations (constants for the server;
// their names are in components/flightRoutes/data/texts). A country not listed goes under "beyond".
export const REGION_ORDER = ["south", "west", "central", "north", "east", "beyond"];

const COUNTRIES = {
  south: ["ES", "PT", "IT", "GR", "MT", "CY", "SM", "VA", "AD", "GI"],
  west: ["FR", "BE", "NL", "LU", "GB", "IE", "MC", "CH", "LI"],
  central: ["DE", "AT", "PL", "CZ", "SK", "HU", "SI"],
  north: ["DK", "SE", "NO", "FI", "IS", "EE", "LV", "LT"],
  east: ["RO", "BG", "RS", "HR", "BA", "ME", "MK", "AL", "XK", "MD", "UA", "GE", "AM", "AZ"],
};

const regionByCountry = Object.fromEntries(Object.entries(COUNTRIES).flatMap(([region, codes]) => codes.map((code) => [code, region])));

export const regionOf = (countryCode) => regionByCountry[countryCode] ?? "beyond";
