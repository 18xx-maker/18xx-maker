import { serializeSvg } from "@/export/svg.js";

// Called by the app at start: a page in render mode in the iframe of a web
// export gives the parent its serializeSvg (see frameEvaluate in webExport).
// Kept out of webExport so the page does not load the export code.
export const exposeFrameCapture = () => {
  if (window.frameElement?.__RENDER_INPUT__) {
    window.__EXPORT_SVG__ = serializeSvg;
  }
};
