// An empty mark at the top of a page whose content lives in its layout (the search pages: the search is the
// layout's). Next.js scrolls a link's new page to the top of the page's own first element; with none (a page that
// renders nothing) it leaves the scroll where it was, so arriving from the bottom of a guide the search showed its
// bottom. The search's own moves between its pages pass `scroll: false`, so they still keep their place.
const PageTop = () => <div aria-hidden="true" />;

export default PageTop;
