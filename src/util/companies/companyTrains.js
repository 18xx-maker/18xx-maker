// Trains a company owns. Each entry of `company.trains` is a train name (one
// copy), a reference to a train of the game ({ name, quantity }) or a full
// train definition of its own (quantity defaults to 1).

const isReference = (train) =>
  Object.keys(train).every((key) => key === "name" || key === "quantity");

// One full train object for every copy a company owns, in order. Names the
// game does not have are skipped.
export const companyTrains = (company, gameTrains = []) => {
  if (!Array.isArray(company?.trains)) {
    return [];
  }

  return company.trains.flatMap((entry) => {
    const train = typeof entry === "string" ? { name: entry } : entry;
    let full = train;

    if (isReference(train)) {
      full = gameTrains.find((t) => t.name === train.name);
      if (!full) {
        return [];
      }
    }

    const quantity = Number.isInteger(train.quantity)
      ? train.quantity
      : isReference(train)
        ? 1
        : (train.print ?? 1);
    return Array(quantity).fill(full);
  });
};

// Whether a charter is drawn at half width, which has no room for trains. It
// depends on the layout and on whether the charter is a minor.
export const charterHalfWidth = (charters, minor) => {
  switch (charters.layout) {
    case "3x1":
      return false;
    case "3x2":
      return true;
    case "3x1minors":
      return !!minor;
    default:
      return !!(charters.halfWidth || (minor && charters.halfWidthMinors));
  }
};

// The company trains that print on the card sheet: all of them when the
// charters are set to put them on cards, otherwise only those whose charter
// has no room for them.
export const cardCompanyTrains = (companies, charters, gameTrains = []) =>
  (companies || []).flatMap((company) =>
    charters.trainCards === "cards" ||
    charterHalfWidth(charters, !!company.minor)
      ? companyTrains(company, gameTrains)
      : [],
  );
