import { cleanup, screen } from "@testing-library/react";

import { renderApp } from "@tests/support/helpers.jsx";

// React generates ids like ":r1f:" with a counter shared by every render in
// the browser page, so they depend on test order. Number them by first use.
const reactId = /:r[0-9a-z]+:|_r_[0-9a-z]+_/g;

// Floats can differ in the last digits between platforms and are not
// visible at print resolution, 3 decimals is well below a pixel
const longFloat = /-?\d+\.\d{4,}/g;

export const normalize = (html) => {
  const ids = new Map();
  return (
    html
      .replace(reactId, (id) => {
        if (!ids.has(id)) {
          ids.set(id, `id-${ids.size}`);
        }
        return ids.get(id);
      })
      .replace(longFloat, (n) => `${Number(Number(n).toFixed(3))}`)
      // One tag per line so a changed element is a readable diff
      .replace(/></g, ">\n<")
      .replace(/\r\n?/g, "\n")
      .trim() + "\n"
  );
};

// Render a game page and return the normalized print markup (the page's
// testid element and everything in it) to compare with a snapshot
export const printMarkup = async (slug, path, suffix, state) => {
  // Print output is what is locked down, so render with the print media
  // type like a real print does (the screen shows the pan and zoom editor)
  const { matchMedia } = window;
  window.matchMedia = (query) =>
    query === "print"
      ? { matches: true, addEventListener() {}, removeEventListener() {} }
      : matchMedia.call(window, query);
  try {
    renderApp(`/games/${slug}/${path}`, state);
    const element = await screen.findByTestId(`game-${slug}${suffix}`);
    const html = normalize(element.outerHTML);
    return html;
  } finally {
    // Unmount right away: the download buttons in the navigation read their
    // data asynchronously and would update state outside of act while the
    // snapshot file is read
    cleanup();
    window.matchMedia = matchMedia;
  }
};
