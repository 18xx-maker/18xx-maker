import { useTranslation } from "react-i18next";
import { Link, useMatch } from "react-router";

import {
  CenterFocusStrong as AutoPositioningIcon,
  PermMedia as B18Icon,
  Timeline as BordersIcon,
  Filter as DieIcon,
  Divider,
  FileOpen as FilesIcon,
  Help as HelpIcon,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Security as LogosIcon,
  Autorenew as OverridesIcon,
  PictureAsPdf as PdfIcon,
  PhotoLibrary as PngIcon,
  Check as SchemasIcon,
  Note as SharesIcon,
  Stars as TokensIcon,
  Train as TrainsIcon,
  Language as TranslationIcon,
} from "@/ui";

const DocsNav = () => {
  const { t } = useTranslation();

  const Item = ({ path = "", name, desc, icon }) => {
    const selected = !!useMatch(`/docs/${path}`);
    return (
      <ListItem disablePadding>
        <ListItemButton
          component={Link}
          to={`/docs/${path}`}
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
          name={t("docs.help.title")}
          desc={t("docs.help.description")}
          icon={<HelpIcon />}
        />
        <Item
          name={t("docs.files.title")}
          desc={t("docs.files.description")}
          path="files"
          icon={<FilesIcon />}
        />
        <Item
          name={t("docs.translation.title")}
          desc={t("docs.translation.description")}
          path="translation"
          icon={<TranslationIcon />}
        />
      </List>
      <Divider />
      <List>
        <Item
          path="output/pdf"
          name={t("docs.output.pdf.title")}
          desc={t("docs.output.pdf.description")}
          icon={<PdfIcon />}
        />
        <Item
          path="output/png"
          name={t("docs.output.png.title")}
          desc={t("docs.output.png.description")}
          icon={<PngIcon />}
        />
        <Item
          path="output/b18"
          name={t("docs.output.b18.title")}
          desc={t("docs.output.b18.description")}
          icon={<B18Icon />}
        />
      </List>
      <Divider />
      <List>
        <Item
          path="games/schemas"
          name={t("docs.games.schemas.title")}
          desc={t("docs.games.schemas.description")}
          icon={<SchemasIcon />}
        />
        <Item
          path="games/borders"
          name={t("docs.games.borders.title")}
          desc={t("docs.games.borders.description")}
          icon={<BordersIcon />}
        />
        <Item
          path="games/types"
          name={t("docs.games.types.title")}
          desc={t("docs.games.types.description")}
          icon={<SharesIcon />}
        />
        <Item
          path="games/trains"
          name={t("docs.games.trains.title")}
          desc={t("docs.games.trains.description")}
          icon={<TrainsIcon />}
        />
        <Item
          path="games/logos"
          name={t("docs.games.logos.title")}
          desc={t("docs.games.logos.description")}
          icon={<LogosIcon />}
        />
        <Item
          path="games/overrides"
          name={t("docs.games.overrides.title")}
          desc={t("docs.games.overrides.description")}
          icon={<OverridesIcon />}
        />
        <Item
          path="games/positioning"
          name={t("docs.games.positioning.title")}
          desc={t("docs.games.positioning.description")}
          icon={<AutoPositioningIcon />}
        />
      </List>
      <Divider />
      <List>
        <Item
          path="pnp/tokens"
          name={t("docs.pnp.tokens.title")}
          desc={t("docs.pnp.tokens.description")}
          icon={<TokensIcon />}
        />
        <Item
          path="pnp/die"
          name={t("docs.pnp.die.title")}
          desc={t("docs.pnp.die.description")}
          icon={<DieIcon />}
        />
      </List>
    </>
  );
};

export default DocsNav;
