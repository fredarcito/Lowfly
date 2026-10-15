// Makes the iPhone launch screens (public/splash/): the coral logo and the name "Lowfly" (in the brand's display
// font) in the middle of the header's night gradient, one image per screen size in
// src/constants/splashScreens.js. Run it again if the logo or the name change:
//   node scripts/splash-screens.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { ImageResponse } from "next/og.js";
import { SPLASH_SCREENS, splashPath } from "../src/constants/splashScreens.js";

const NAME = "Lowfly";
const ICON = `data:image/svg+xml;base64,${readFileSync(new URL("../src/app/icon.svg", import.meta.url)).toString("base64")}`;
// The app's dark header: night blue at the top fading into the page's background
const TOP = "#0e293d";
const BOTTOM = "#081018";
// The logo's width, as a part of the screen's width; the name's size, as a part of the logo's
const LOGO_SHARE = 0.22;
const NAME_SHARE = 0.42;

// The display font (Bricolage Grotesque, extra bold) with just the name's letters, from Google Fonts
const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@800&text=${NAME}`)).text();
const font = await (await fetch(css.match(/src: url\((.+?)\) format/)[1])).arrayBuffer();

mkdirSync(new URL("../public/splash", import.meta.url), { recursive: true });

for (const screen of SPLASH_SCREENS) {
  const width = screen.width * screen.ratio;
  const height = screen.height * screen.ratio;
  const logoSize = Math.round(width * LOGO_SHARE);
  const image = new ImageResponse(
    (
      // A plain object tree (the script has no JSX): what <div>…</div> would make
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: Math.round(logoSize * 0.28),
            width: "100%",
            height: "100%",
            background: `linear-gradient(180deg, ${TOP} 0%, ${BOTTOM} 60%)`,
          },
          children: [
            { type: "img", props: { src: ICON, width: logoSize, height: logoSize } },
            {
              type: "div",
              props: {
                style: { display: "flex", color: "white", fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: Math.round(logoSize * NAME_SHARE), letterSpacing: -2 },
                children: NAME,
              },
            },
          ],
        },
      }
    ),
    { width, height, fonts: [{ name: "Bricolage Grotesque", data: font, weight: 800, style: "normal" }] }
  );
  writeFileSync(new URL(`../public${splashPath(screen)}`, import.meta.url), Buffer.from(await image.arrayBuffer()));
  console.log(splashPath(screen));
}
