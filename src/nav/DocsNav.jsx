import React from "react";

import { Link, useLocation, matchPath } from "react-router-dom";

import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import HelpIcon from "@material-ui/icons/Help";
import RunningIcon from "@material-ui/icons/Code";

import LogosIcon from "@material-ui/icons/Security";
import OverridesIcon from "@material-ui/icons/Autorenew";
import TrainsIcon from "@material-ui/icons/Train";
import SchemasIcon from "@material-ui/icons/Check";
import SharesIcon from "@material-ui/icons/Note";

import PdfIcon from "@material-ui/icons/PictureAsPdf";
import PngIcon from "@material-ui/icons/PhotoLibrary";
import B18Icon from "@material-ui/icons/PermMedia";

import DieIcon from "@material-ui/icons/Filter";
import TokensIcon from "@material-ui/icons/Stars";

const DocsNav = () => {
  const location = useLocation();

  const Item = ({path = "", name, desc, icon}) => (
    <ListItem button
              component={Link}
              to={`/docs/${path}`}
              selected={!!matchPath(location.pathname,
                                    { path: `/docs/${path}`,
                                      exact: true})}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={name}
                    secondary={desc}/>
    </ListItem>
  );

  return (
    <>
      <List>
        <Item name="Help"
              desc="Using 18xx Maker"
              icon={<HelpIcon/>}/>
        <Item name="Running Locally"
              path="running"
              desc="Developing the base node.js app"
              icon={<RunningIcon/>}/>
      </List>
      <Divider/>
      <List>
        <Item path="games/schemas"
              name="Schemas"
              desc="Validation of game files"
              icon={<SchemasIcon/>}/>
        <Item path="games/types"
              name="Share and Token Types"
              desc="Easily describe shares/tokens"
              icon={<SharesIcon/>}/>
        <Item path="games/trains"
              name="Phases and Trains"
              desc="How to describe game phases"
              icon={<TrainsIcon/>}/>
        <Item path="games/logos"
              name="Logos"
              desc="Train company logos"
              icon={<LogosIcon/>}/>
        <Item path="games/overrides"
              name="Company Overrides"
              desc="Swap companies!"
              icon={<OverridesIcon/>}/>
      </List>
      <Divider/>
      <List>
        <Item path="output/pdf"
              name="PDF Output"
              desc="Generate pdf documents"
              icon={<PdfIcon/>}/>
        <Item path="output/png"
              name="PNG Output"
              desc="Generate png images"
              icon={<PngIcon/>}/>
        <Item path="output/b18"
              name="Board18 Output"
              desc="Generate a Board18 gamebox"
              icon={<B18Icon/>}/>
      </List>
      <Divider/>
      <List>
        <Item path="pnp/tokens"
              name="Tokens"
              desc="Info about token output"
              icon={<TokensIcon/>}/>
        <Item path="pnp/die"
              name="Die Cutter"
              desc="Info about the Ellison die cutter"
              icon={<DieIcon/>}/>
      </List>
    </>
  )
};

export default DocsNav;
