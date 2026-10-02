import { init, track } from "@plausible-analytics/tracker";

import capability from "@/util/capability";
import { getRenderInput } from "@/util/renderInput";

// Set this to true to console log all analytic sends in dev mode
const DEVLOG = false;

let initialized = false;

// Only set the tracker up when something is really going to be sent
const ensureInit = () => {
  if (initialized) return;
  initialized = true;

  init({
    domain: "18xx-maker.com",
    endpoint: "https://analytics.18xx-maker.com/api/event",
    // Pageviews are sent by hand with the masked game urls
    autoCapturePageviews: false,
    // We need this to allow plausible to accept our events in the app
    captureOnLocalhost: true,
    logging: false,
    // The old tracker never sent a referrer, so neither do we
    transformRequest: (payload) => ({ ...payload, r: null }),
  });
};

const source = capability.electron ? "app" : "site";
const prod = import.meta.env.PROD;

const gamesRE = /^\/games\/([^/]+)(.*)$/;

export const maskGame = (path) => {
  const match = gamesRE.exec(path);

  if (!match) return path;

  const fullSlug = match[1].split(":");
  const slug = fullSlug.length === 1 ? "slug" : `${fullSlug[0]}:slug`;

  return `/games/${slug}${match[2]}`;
};

export const normalizePath = (location) => {
  const path = maskGame(location.pathname);

  const normalizedPath = path.endsWith("/") ? path.slice(0, -1) : path;

  const search = location.search;
  return `${normalizedPath}${search}`;
};

export const gatherPageviewData = (location) => {
  const path = normalizePath(location);
  const url = `https://18xx-maker.com${path}`;
  return {
    referrer: null,
    url,
  };
};

// The capture window of an export has none of the app's calls
const app = capability.electron && !getRenderInput();
const system = app ? window.api.loadPlatformAndVersions() : {};
const props = app
  ? {
      interface: source,
      appVersion: system.versions.app,
      osVersion: system.versions.system,
      os: system.platform,
    }
  : { interface: source };

export const trackEvent = (eventName, location, eventOptions = {}) => {
  const { url } = gatherPageviewData(location);
  const options = { props: { ...props, ...eventOptions }, url };
  if (!prod || window.location.hostname === "localhost") {
    if (DEVLOG) {
      console.log("trackEvent", eventName, options);
    }

    return;
  }

  ensureInit();
  track(eventName, options);
};

export const trackPageview = (location) => {
  const { url } = gatherPageviewData(location);
  const options = { props, url };

  if (!prod || window.location.hostname === "localhost") {
    if (DEVLOG) {
      console.log("trackPageview", options);
    }

    return;
  }

  ensureInit();
  track("pageview", options);
};
