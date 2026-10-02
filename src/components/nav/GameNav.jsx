import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Link as RouterLink, useLocation, useMatch } from "react-router";

import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormLabel from "@mui/material/FormLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";

import { addIndex, is, map, omit } from "ramda";

import File from "@/components/File";
import { useGame } from "@/hooks/game.js";
import { refreshGame } from "@/state";
import {
  Storage as BGGIcon,
  Divider,
  Train as GameIcon,
  Lock as LicenseIcon,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MonetizationOn as PurchaseIcon,
  Refresh as RefreshIcon,
  Gavel as RulesIcon,
  Warning as WarningIcon,
} from "@/ui";
import { titleToFilename } from "@/util";
import { trackEvent } from "@/util/analytics";
import capability from "@/util/capability";
import { useBooleanParam, useIntParam } from "@/util/query.js";
import styles from "./GameNav.module.css";

const GameSectionButton = ({ section, disabled }) => {
  const game = useGame();
  const { t } = useTranslation();
  const to = `/games/${game.meta.slug}/${section}`;
  const selected = !!useMatch(to);

  return (
    <ListItem disablePadding>
      <ListItemButton
        selected={selected}
        aria-current={selected ? "page" : undefined}
        component={RouterLink}
        to={to}
        disabled={disabled}
      >
        <ListItemText>{t(`game.nav.${section}`)}</ListItemText>
      </ListItemButton>
    </ListItem>
  );
};

const GameNav = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const game = useGame();
  const dispatch = useDispatch();
  const match = useMatch("/games/:slug/:tab");

  const needsPagination = match
    ? ["map", "revenue", "par", "market"].includes(match.params.tab)
    : false;

  const [hidePrivates, togglePrivates] = useBooleanParam("hidePrivates");
  const [hideShares, toggleShares] = useBooleanParam("hideShares");
  const [hideTrains, toggleTrains] = useBooleanParam("hideTrains");
  const [hideNumbers, toggleNumbers] = useBooleanParam("hideNumbers");

  const [paginated, togglePagination] = useBooleanParam("paginated");
  const [variation, setVariation] = useIntParam("variation", 0);
  const handleVariation = (event) => setVariation(event.target.value);

  if (!game) {
    return null;
  }

  const downloadGame = omit(["meta"], game);
  const filename = titleToFilename(game.info.title) + ".json";

  const refreshHandler = (event) => {
    event.preventDefault();
    trackEvent("refresh", location);
    dispatch(refreshGame());
  };

  const hasVariation = match
    ? match.params.tab === "map" && is(Array, game.map)
    : false;

  const isCards = match ? match.params.tab === "cards" : false;

  return (
    <>
      <List>
        <ListItem disablePadding>
          <ListItemButton
            component={RouterLink}
            to={`/games/${game.meta.slug}/`}
          >
            <ListItemIcon>
              <GameIcon />
            </ListItemIcon>
            <ListItemText
              primary={game.info.title}
              secondary={`${t("game.by")} ${game.info.designer}`}
            />
          </ListItemButton>
        </ListItem>
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
        <File data={downloadGame} filename={filename} list />
        {!capability.electron && game.meta.type === "system" && (
          <ListItem disablePadding>
            <ListItemButton onClick={refreshHandler}>
              <ListItemIcon>
                <RefreshIcon className={styles.refresh} />
              </ListItemIcon>
              <ListItemText
                primary={t("refresh.refresh")}
                secondary={t("refresh.description")}
              />
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
      <Divider />
      {(needsPagination || hasVariation || isCards) && (
        <>
          <List>
            {needsPagination && (
              <ListItem>
                <FormControlLabel
                  control={
                    <Switch
                      checked={paginated}
                      onChange={togglePagination}
                      color="primary"
                      name="pagination"
                    />
                  }
                  label={t("game.paginated")}
                />
              </ListItem>
            )}
            {hasVariation && (
              <ListItem>
                <FormControl className={styles.input} variant="filled">
                  <InputLabel id="variation-label">
                    {t("game.map.variation")}
                  </InputLabel>
                  <Select
                    labelId="variation-label"
                    id="variation"
                    name="variation"
                    value={variation}
                    onChange={handleVariation}
                  >
                    {addIndex(map)(
                      (m, i) => (
                        <MenuItem key={`variation-${i}`} value={i}>
                          {m.name}
                        </MenuItem>
                      ),
                      game.map,
                    )}
                  </Select>
                </FormControl>
              </ListItem>
            )}
            {isCards && (
              <ListItem>
                <FormControl component="fieldset">
                  <FormLabel component="legend">{t("show")}</FormLabel>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!hidePrivates}
                          onChange={togglePrivates}
                          color="primary"
                          name="showPrivates"
                        />
                      }
                      label={t("game.cards.privates")}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!hideShares}
                          onChange={toggleShares}
                          color="primary"
                          name="showShares"
                        />
                      }
                      label={t("game.cards.shares")}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!hideTrains}
                          onChange={toggleTrains}
                          color="primary"
                          name="showTrains"
                        />
                      }
                      label={t("game.cards.trains")}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!hideNumbers}
                          onChange={toggleNumbers}
                          color="primary"
                          name="showNumbers"
                        />
                      }
                      label={t("game.cards.numbers")}
                    />
                  </FormGroup>
                </FormControl>
              </ListItem>
            )}
          </List>
          <Divider />
        </>
      )}
      <List>
        <GameSectionButton section="background" />
        <GameSectionButton section="cards" />
        <GameSectionButton section="charters" disabled={!game.companies} />
        <GameSectionButton section="map" disabled={!game.map} />
        <GameSectionButton
          section="market"
          disabled={!game.stock || !game.stock.market}
        />
        <GameSectionButton
          section="par"
          disabled={!game.stock || !game.stock.par || !game.stock.par.values}
        />
        <GameSectionButton section="revenue" />
        <GameSectionButton section="tile-manifest" disabled={!game.tiles} />
        <GameSectionButton section="tiles" disabled={!game.tiles} />
        <GameSectionButton
          section="tokens"
          disabled={!game.companies && !game.tokens}
        />
      </List>
    </>
  );
};

export default GameNav;
