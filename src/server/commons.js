// Wikimedia Commons, for the destination photos (server/photos, server/placePhotos): each file's 800 px
// thumbnail plus its author and licence, needed to credit it. Only called from the server.
import { USER_AGENT as UA } from "@/constants/site";

export { UA };
export const MONTH = 30 * 86400;

const plain = (html = "") => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

// { file: { src, width, height, page, author, license } } for Commons files
export const commons = async (files) => {
  const titles = files.map((file) => `File:${file}`).join("|");
  const response = await fetch(
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=800&titles=${encodeURIComponent(titles)}`,
    { headers: { "user-agent": UA }, next: { revalidate: MONTH } }
  );
  if (!response.ok) throw new Error(`Commons responded with error ${response.status}`);
  const byFile = {};
  for (const page of Object.values((await response.json()).query?.pages || {})) {
    const ii = page.imageinfo?.[0];
    if (!ii?.thumburl) continue;
    byFile[page.title.replace(/^File:/, "")] = {
      src: ii.thumburl,
      width: ii.thumbwidth,
      height: ii.thumbheight,
      page: ii.descriptionurl,
      author: plain(ii.extmetadata?.Artist?.value),
      license: plain(ii.extmetadata?.LicenseShortName?.value),
    };
  }
  return byFile;
};
