// The folder the folder dialog opens in: the saved export folder, or
// undefined (the default of the dialog) when none is saved or it is no longer
// a folder. isDirectory(folder) says if a path is a folder that exists.
export const savedFolder = (saved, isDirectory) =>
  typeof saved === "string" && saved !== "" && isDirectory(saved)
    ? saved
    : undefined;
