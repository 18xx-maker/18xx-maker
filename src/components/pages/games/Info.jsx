import { useTranslation } from "react-i18next";

import { useGame } from "@/hooks/game.js";
import {
  Storage as BGGIcon,
  Container,
  Lock as LicenseIcon,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  People as PlayersIcon,
  MonetizationOn as PurchaseIcon,
  Gavel as RulesIcon,
  Typography,
  Warning as WarningIcon,
} from "@/ui";
import styles from "./Info.module.css";

const Info = () => {
  const game = useGame();
  const { t } = useTranslation();

  return (
    <Container maxWidth="md">
      <Paper
        data-testid={`game-${game.meta.slug}`}
        elevation={5}
        className={styles.page}
      >
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
            <ListItem disablePadding>
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
            </ListItem>
          )}
          {game.links && game.links.purchase && (
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                color="inherit"
                underline="none"
                target="_blank"
                href={game.links.purchase}
              >
                <ListItemIcon>
                  <PurchaseIcon className={styles.purchase} />
                </ListItemIcon>
                <ListItemText
                  primary={t("game.purchase.primary")}
                  secondary={t("game.purchase.secondary")}
                />
              </ListItemButton>
            </ListItem>
          )}
          {game.links && game.links.bgg && (
            <ListItem disablePadding>
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
            </ListItem>
          )}
          {game.links && game.links.rules && (
            <ListItem disablePadding>
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
            </ListItem>
          )}
          {game.prototype && (
            <ListItem>
              <ListItemIcon>
                <WarningIcon className={styles.prototype} />
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
                <WarningIcon className={styles.warning} />
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
