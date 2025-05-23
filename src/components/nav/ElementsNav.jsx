import { useTranslation } from "react-i18next";
import { Link, useMatch } from "react-router";

import AtomsIcon from "@mui/icons-material/Map";
// import CheatIcon from "@mui/icons-material/ListAlt";
import LogosIcon from "@mui/icons-material/Security";
import TilesIcon from "@mui/icons-material/ViewModule";
// import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

const ElementsNav = () => {
  const { t } = useTranslation();

  const Item = ({ path, name, desc, icon }) => {
    const selected = !!useMatch({ path: `/elements${path}`, end: true });

    return (
      <ListItemButton
        component={Link}
        to={`/elements${path}`}
        selected={selected}
      >
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={name} secondary={desc} />
      </ListItemButton>
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
