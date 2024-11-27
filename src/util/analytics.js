import Plausible from "plausible-tracker";

import capability from "@/util/capability";

// Set this to true to console log all analytic sends in dev mode
const DEVLOG = false;

const initOptions = {
  domain: "18xx-maker.com",
  apiHost: "https://analytics.18xx-maker.com",
};

const plausible = Plausible(initOptions);

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

const system = capability.electron ? window.api.loadPlatformAndVersions() : {};
const props = capability.electron
  ? {
      interface: source,
      appVersion: system.versions.app,
      chromeVersion: system.versions.chrome,
      electronVersion: system.versions.electron,
      osVersion: system.versions.system,
      os: system.platform,
    }
  : { interface: source };

export const trackEvent = (eventName, location, eventOptions = {}) => {
  const eventData = gatherPageviewData(location);
  const options = { props: { ...props, ...eventOptions } };
  if (!prod || window.location.hostname === "localhost") {
    if (DEVLOG) {
      console.log("trackEvent", eventName, options, eventData);
    }

    return;
  }

  plausible.trackEvent(eventName, options, eventData);
};

export const trackPageview = (location) => {
  const eventData = gatherPageviewData(location);
  const options = { props };

  if (!prod || window.location.hostname === "localhost") {
    if (DEVLOG) {
      console.log("trackPageview", eventData, options);
    }

    return;
  }

  plausible.trackPageview(eventData, options);
};
