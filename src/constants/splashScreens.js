// iPhones' launch screens (an installed app opening): iOS needs an image of the exact screen size for each one,
// or it shows a blank screen. One per screen, portrait: { width, height } in points and the pixel ratio.
// The images are made by scripts/splash-screens.mjs into public/splash/.
export const SPLASH_SCREENS = [
  { width: 440, height: 956, ratio: 3 }, // 16 Pro Max
  { width: 402, height: 874, ratio: 3 }, // 16 Pro
  { width: 430, height: 932, ratio: 3 }, // 15 Pro Max, 15 Plus, 14 Pro Max
  { width: 393, height: 852, ratio: 3 }, // 16, 15, 15 Pro, 14 Pro
  { width: 428, height: 926, ratio: 3 }, // 14 Plus, 13 Pro Max, 12 Pro Max
  { width: 390, height: 844, ratio: 3 }, // 14, 13, 13 Pro, 12, 12 Pro
  { width: 375, height: 812, ratio: 3 }, // 13 mini, 12 mini, 11 Pro, XS, X
  { width: 414, height: 896, ratio: 3 }, // 11 Pro Max, XS Max
  { width: 414, height: 896, ratio: 2 }, // 11, XR
  { width: 414, height: 736, ratio: 3 }, // 8 Plus, 7 Plus
  { width: 375, height: 667, ratio: 2 }, // SE (2nd and 3rd), 8, 7
];

// The image's address for a screen
export const splashPath = ({ width, height, ratio }) => `/splash/iphone-${width * ratio}x${height * ratio}.png`;
