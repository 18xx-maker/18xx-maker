import { isNil, reject } from "ramda";

// The font settings of a role, as the props of a text: fontFamily, fontSize,
// fontWeight and fontStyle. A role is the body role with the role's own
// settings on top. A setting that is not set is left out, so a text keeps its
// own default. The family is a name from fonts.families or a CSS family: the
// display, serif and sans-serif aliases and any other value are used as given.
export const resolveFontRole = (fonts, role) => {
  const roles = fonts?.roles;
  const { family, size, weight, style } = {
    ...reject(isNil, roles?.body ?? {}),
    ...reject(isNil, roles?.[role] ?? {}),
  };

  return reject(isNil, {
    fontFamily: fonts?.families?.[family] ?? family,
    fontSize: size,
    fontWeight: weight,
    fontStyle: style,
  });
};
