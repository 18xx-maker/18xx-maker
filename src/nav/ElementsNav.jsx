import React from "react";

import { Link, useLocation, matchPath } from "react-router-dom";

import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import AtomsIcon from "@material-ui/icons/Category";
import CheatIcon from "@material-ui/icons/ListAlt";
import LogosIcon from "@material-ui/icons/Security";
import TilesIcon from "@material-ui/icons/ViewModule";

const ElementsNav = () => {
  const location = useLocation();

  const Item = ({path, name, desc, icon}) => (
    <ListItem button
              component={Link}
              to={`/elements/${path}`}
              selected={!!matchPath(location.pathname,
                                    { path: `/elements/${path}`,
                                      exact: true})}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={name}
                    secondary={desc}/>
    </ListItem>
  );

  return (
    <>
      <List>
        <Item path="tiles"
              name="Tiles"
              desc="18xx tiles from all games"
              icon={<TilesIcon/>}/>
        <Item path="atoms"
              name="Map Elements"
              desc="Basic atoms for maps and tiles"
              icon={<AtomsIcon/>}/>
      </List>
      <Divider/>
      <List>
        <Item path="logos"
              name="Company Logos"
              desc="Included train company logos"
              icon={<LogosIcon/>}/>
      </List>
      <Divider/>
      <List>
        <Item path="cheat"
              name="Cheat Sheet"
              desc="Data from included 18xx games"
              icon={<CheatIcon/>}/>
      </List>
    </>
  )
};

export default ElementsNav;
