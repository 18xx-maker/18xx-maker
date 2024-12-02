import { useEffect, useState } from "react";

export const usePrint = () => {
  const [print, setPrint] = useState(window.matchMedia("print").matches);

  useEffect(() => {
    const media = window.matchMedia("print");
    const update = () => setPrint(media.matches);

    media.addEventListener("change", update);

    return () => {
      media.removeEventListener("change", update);
    };
  }, [print, setPrint]);

  return print;
};
