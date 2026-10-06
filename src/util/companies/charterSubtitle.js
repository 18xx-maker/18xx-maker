// The one-line subtitle of a charter: home on the left, destination in the
// middle and a special power on the right. An override in `charterSubtitle`
// replaces a slot, and an empty string blanks it. Returns null when no slot
// has text.
export const charterSubtitle = (company) => {
  const over = company?.charterSubtitle || {};
  const home = [company?.home].flat().filter(Boolean).join(" / ");

  const slot = (key, fallback) =>
    typeof over[key] === "string" ? over[key] : fallback;

  const left = slot("left", home ? `Home: ${home}` : "");
  const middle = slot(
    "middle",
    company?.destination ? `Dest: ${company.destination}` : "",
  );
  const right = slot("right", company?.ability || "");

  return left || middle || right ? { left, middle, right } : null;
};
