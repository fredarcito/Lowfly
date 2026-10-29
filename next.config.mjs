import { withBotId } from "botid/next/config";

const nextConfig = {};

// BotID (server/handler: the flight searches): the rewrites its browser check goes through
export default withBotId(nextConfig);
