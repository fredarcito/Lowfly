import { CloudRain, CloudSun, Snowflake, Sun, ThermometerSun, Wind } from "lucide-react";

// How the weather usually feels (server/itinerary's FEELS), as an icon, and the rain
export const WEATHER_ICONS = { cold: Snowflake, cool: Wind, mild: CloudSun, warm: Sun, hot: ThermometerSun, rain: CloudRain };

// A town's icon in WEATHER_ICONS: the rain when it rains often, otherwise how it feels. Components look the icon up
// themselves (`WEATHER_ICONS[weatherKey(town)]`), so React sees an icon picked, not one made while rendering.
export const weatherKey = (town) => (town.rain === "often" ? "rain" : town.feels);
