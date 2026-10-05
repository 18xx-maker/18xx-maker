import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

// True while the page is rendered for print. The media query changes during a
// print, but React would render the change after the browser has already laid
// the page out, so beforeprint/afterprint flush the update synchronously.
export const usePrint = () => {
  const [print, setPrint] = useState(window.matchMedia("print").matches);

  useEffect(() => {
    const media = window.matchMedia("print");
    const update = () => setPrint(media.matches);
    const before = () => flushSync(() => setPrint(true));
    const after = () => flushSync(() => setPrint(media.matches));

    media.addEventListener("change", update);
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);

    return () => {
      media.removeEventListener("change", update);
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, []);

  return print;
};
