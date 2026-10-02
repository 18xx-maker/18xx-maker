import { useTranslation } from "react-i18next";
import { Link, useMatch } from "react-router";

import {
  Map as AtomsIcon,
  // Divider,
  // ListAlt as CheatIcon,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Security as LogosIcon,
  ViewModule as TilesIcon,
} from "@/ui";

const ElementsNav = () => {
  const { t } = useTranslation();

  const Item = ({ path, name, desc, icon }) => {
    const selected = !!useMatch({ path: `/elements${path}`, end: true });

    return (
      <ListItem disablePadding>
        <ListItemButton
          component={Link}
          to={`/elements${path}`}
          selected={selected}
        >
          <ListItemIcon>{icon}</ListItemIcon>
          <ListItemText primary={name} secondary={desc} />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <>
      <List>
        <Item
          path="/"
          name={t("elements.atoms.title")}
          desc={t("elements.atoms.description")}
          icon={<AtomsIcon />}
        />
        <Item
          path="/tiles"
          name={t("elements.tiles.title")}
          desc={t("elements.tiles.description")}
          icon={<TilesIcon />}
        />
        <Item
          path="/logos"
          name={t("elements.logos.title")}
          desc={t("elements.logos.description")}
          icon={<LogosIcon />}
        />
      </List>
      {/* <Divider/> */}
      {/* <List> */}
      {/*   <Item path="/cheat" */}
      {/*         name={t('elements.cheat.title')} */}
      {/*         desc={t('elements.cheat.description')} */}
      {/*         icon={<CheatIcon/>}/> */}
      {/* </List> */}
    </>
  );
};

export default ElementsNav;
