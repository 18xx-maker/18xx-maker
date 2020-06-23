import React from "react";

import { Link, useLocation, matchPath } from "react-router-dom";

import { useTranslation } from "react-i18next";

// import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import AtomsIcon from "@material-ui/icons/Map";
// import CheatIcon from "@material-ui/icons/ListAlt";
import LogosIcon from "@material-ui/icons/Security";
import TilesIcon from "@material-ui/icons/ViewModule";

const ElementsNav = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const Item = ({path, name, desc, icon}) => (
    <ListItem button
              component={Link}
              to={`/elements${path}`}
              selected={!!matchPath(location.pathname,
                                    { path: `/elements${path}`,
                                      exact: true})}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={name}
                    secondary={desc}/>
    </ListItem>
  );

  return (
    <>
      <List>
        <Item path="/"
              name={t('elements.atoms.title')}
              desc={t('elements.atoms.description')}
              icon={<AtomsIcon/>}/>
        <Item path="/tiles"
              name={t('elements.tiles.title')}
              desc={t('elements.tiles.description')}
              icon={<TilesIcon/>}/>
        <Item path="/logos"
              name={t('elements.logos.title')}
              desc={t('elements.logos.description')}
              icon={<LogosIcon/>}/>
      </List>
      {/* <Divider/> */}
      {/* <List> */}
      {/*   <Item path="/cheat" */}
      {/*         name={t('elements.cheat.title')} */}
      {/*         desc={t('elements.cheat.description')} */}
      {/*         icon={<CheatIcon/>}/> */}
      {/* </List> */}
    </>
  )
};

export default ElementsNav;
