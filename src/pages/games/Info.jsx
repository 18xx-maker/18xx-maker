import { useTranslation } from "react-i18next";

import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import PlayersIcon from "@mui/icons-material/People";

import BGGIcon from "@mui/icons-material/Storage";
import LicenseIcon from "@mui/icons-material/Lock";
import PurchaseIcon from "@mui/icons-material/MonetizationOn";
import RulesIcon from "@mui/icons-material/Gavel";
import WarningIcon from "@mui/icons-material/Warning";

import makeStyles from "@mui/styles/makeStyles";
import { green, blue } from "@mui/material/colors";

const useStyles = makeStyles((theme) => ({
  page: {
    overflow: "auto",
    margin: theme.spacing(4, 0),
    padding: theme.spacing(2, 2, 0, 2),
  },
  warning: {
    color: theme.palette.warning.main,
  },
}));

const Info = ({ game }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Container maxWidth="md">
      <Paper elevation={5} className={classes.page}>
        <Typography variant="h3">{game.info.title}</Typography>
        {game.info.subtitle && (
          <Typography variant="h5">{game.info.subtitle}</Typography>
        )}
        <Typography variant="h6">
          {t("game.by")} {game.info.designer}
        </Typography>
        <List>
          {game.players && (
            <ListItem>
              <ListItemIcon>
                <PlayersIcon />
              </ListItemIcon>
              <ListItemText
                primary={`${game.players[0].number} - ${game.players[game.players.length - 1].number}`}
                secondary={t("game.players")}
              />
            </ListItem>
          )}
          {game.links && game.links.license && (
            <ListItemButton
              component={Link}
              color="inherit"
              underline="none"
              target="_blank"
              href={game.links.license}
            >
              <ListItemIcon>
                <LicenseIcon color="error" />
              </ListItemIcon>
              <ListItemText
                primary={t("game.license.primary")}
                secondary={t("game.license.secondary")}
              />
            </ListItemButton>
          )}
          {game.links && game.links.purchase && (
            <ListItemButton
              component={Link}
              color="inherit"
              underline="none"
              target="_blank"
              href={game.links.purchase}
            >
              <ListItemIcon>
                <PurchaseIcon style={{ color: green[500] }} />
              </ListItemIcon>
              <ListItemText
                primary={t("game.purchase.primary")}
                secondary={t("game.purchase.secondary")}
              />
            </ListItemButton>
          )}
          {game.links && game.links.bgg && (
            <ListItemButton
              component={Link}
              color="inherit"
              underline="none"
              target="_blank"
              href={game.links.bgg}
            >
              <ListItemIcon>
                <BGGIcon />
              </ListItemIcon>
              <ListItemText>{t("game.bgg")}</ListItemText>
            </ListItemButton>
          )}
          {game.links && game.links.rules && (
            <ListItemButton
              component={Link}
              color="inherit"
              underline="none"
              target="_blank"
              href={game.links.rules}
            >
              <ListItemIcon>
                <RulesIcon />
              </ListItemIcon>
              <ListItemText primary={t("game.rules")} />
            </ListItemButton>
          )}
          {game.prototype && (
            <ListItem>
              <ListItemIcon>
                <WarningIcon style={{ color: blue[500] }} />
              </ListItemIcon>
              <ListItemText
                primary={t("prototype.prototype")}
                secondary={t("prototype.description")}
              />
            </ListItem>
          )}
          {game.wip && (
            <ListItem>
              <ListItemIcon>
                <WarningIcon className={classes.warning} />
              </ListItemIcon>
              <ListItemText
                primary={t("wip.wip")}
                secondary={t("wip.description")}
              />
            </ListItem>
          )}
        </List>
      </Paper>
    </Container>
  );
};

export default Info;
