import React from "react";

import { Link, useLocation, matchPath } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import HelpIcon from "@material-ui/icons/Help";
import DevelopingIcon from "@material-ui/icons/Code";
import TranslationIcon from "@material-ui/icons/Language";

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
  const { t } = useTranslation();
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
        <Item name={t("docs.help.title")}
              desc={t("docs.help.description")}
              icon={<HelpIcon/>}/>
        <Item name={t("docs.developing.title")}
              desc={t("docs.developing.description")}
              path="developing"
              icon={<DevelopingIcon/>}/>
        <Item name={t("docs.translation.title")}
              desc={t("docs.translation.description")}
              path="translation"
              icon={<TranslationIcon/>}/>
      </List>
      <Divider/>
      <List>
        <Item path="output/pdf"
              name={t("docs.output.pdf.title")}
              desc={t("docs.output.pdf.description")}
              icon={<PdfIcon/>}/>
        <Item path="output/png"
              name={t("docs.output.png.title")}
              desc={t("docs.output.png.description")}
              icon={<PngIcon/>}/>
        <Item path="output/b18"
              name={t("docs.output.b18.title")}
              desc={t("docs.output.b18.description")}
              icon={<B18Icon/>}/>
      </List>
      <Divider/>
      <List>
        <Item path="games/schemas"
              name={t("docs.games.schemas.title")}
              desc={t("docs.games.schemas.description")}
              icon={<SchemasIcon/>}/>
        <Item path="games/types"
              name={t("docs.games.types.title")}
              desc={t("docs.games.types.description")}
              icon={<SharesIcon/>}/>
        <Item path="games/trains"
              name={t("docs.games.trains.title")}
              desc={t("docs.games.trains.description")}
              icon={<TrainsIcon/>}/>
        <Item path="games/logos"
              name={t("docs.games.logos.title")}
              desc={t("docs.games.logos.description")}
              icon={<LogosIcon/>}/>
        <Item path="games/overrides"
              name={t("docs.games.overrides.title")}
              desc={t("docs.games.overrides.description")}
              icon={<OverridesIcon/>}/>
      </List>
      <Divider/>
      <List>
        <Item path="pnp/tokens"
              name={t("docs.pnp.tokens.title")}
              desc={t("docs.pnp.tokens.description")}
              icon={<TokensIcon/>}/>
        <Item path="pnp/die"
              name={t("docs.pnp.die.title")}
              desc={t("docs.pnp.die.description")}
              icon={<DieIcon/>}/>
      </List>
    </>
  )
};

export default DocsNav;
