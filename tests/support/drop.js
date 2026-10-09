import { createEvent, fireEvent } from "@testing-library/react";

// Drop onto the app. The real DragEvent constructor does not accept plain
// objects, so the dataTransfer is set on the created event.
export const drop = (dataTransfer) => {
  const zone = document.getElementById("dropzone");
  const event = createEvent.drop(zone);
  Object.defineProperty(event, "dataTransfer", { value: dataTransfer });
  fireEvent(zone, event);
  return event;
};

export const dropFiles = (files) => {
  const transfer = new DataTransfer();
  for (const file of files) transfer.items.add(file);
  return drop(transfer);
};

export const svgFile = (name = "star.svg", body) =>
  new File(
    [body ?? '<svg viewBox="0 0 10 10"><path d="M0 0h5v5z"/></svg>'],
    name,
    { type: "image/svg+xml" },
  );

export const pngFile = (bytes, name = "loco.png") =>
  new File([bytes], name, { type: "image/png" });
