import { CloudRain, CloudSun, Snowflake, Sun, ThermometerSun, Wind } from "lucide-react";

// How the weather usually feels (server/itinerary's FEELS), as an icon
export const FEEL_ICONS = { cold: Snowflake, cool: Wind, mild: CloudSun, warm: Sun, hot: ThermometerSun };

// A town's icon: the rain when it rains often, otherwise how it feels
export const weatherIcon = (town) => (town.rain === "often" ? CloudRain : FEEL_ICONS[town.feels]);
