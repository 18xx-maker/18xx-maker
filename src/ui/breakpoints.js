// Breakpoints, matching the MUI theme in src/components/Root.jsx.
// CSS cannot read these (custom properties do not work in @media, and
// @custom-media is not shared across CSS Module files; see README.md), so
// CSS uses the literal px values and breakpoints.test.js keeps them honest.
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};

// MUI's step, so that down(sm) and up(sm) never match at the same time
const STEP = 0.05;

// theme.breakpoints.up("md") => (min-width:960px)
export const up = (key) => `(min-width:${breakpoints[key]}px)`;

// theme.breakpoints.down("md") => (max-width:959.95px)
export const down = (key) => `(max-width:${breakpoints[key] - STEP}px)`;
