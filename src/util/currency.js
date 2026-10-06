import { is } from "ramda";

// Formats a value for printing. A string is printed as is. A valueFormat
// (a string with a #, from a <field>Format property) replaces the first # by
// the number and supersedes the game currency and the config toggle.
export const format = (value, game, doCurrencyFormat, valueFormat) => {
  if (value === null || value === undefined) {
    return null;
  } else if (is(String, value)) {
    return value;
  }

  const hasFormat = is(String, valueFormat) && valueFormat.length > 0;

  if (hasFormat || doCurrencyFormat) {
    const template = hasFormat
      ? valueFormat
      : (game && game.info.currency) || "$#";

    return template.replace(
      "#",
      Number(value).toLocaleString([], { minimumFractionDigits: 0 }),
    );
  } else {
    return `${value}`;
  }
};
