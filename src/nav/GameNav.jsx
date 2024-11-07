import { useTranslation } from "react-i18next";
import { Switch as RouterSwitch, Route, matchPath } from "react-router";
import { Link as RouterLink, useLocation } from "react-router-dom";

import { useGame } from "../context/GameContext";
import { useBooleanParam, useIntParam } from "../util/query";

import addIndex from "ramda/src/addIndex";
import is from "ramda/src/is";
import map from "ramda/src/map";

import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormLabel from "@mui/material/FormLabel";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";

import BGGIcon from "@mui/icons-material/Storage";
import GameIcon from "@mui/icons-material/Train";
import LicenseIcon from "@mui/icons-material/Lock";
import PurchaseIcon from "@mui/icons-material/MonetizationOn";
import RulesIcon from "@mui/icons-material/Gavel";
import WarningIcon from "@mui/icons-material/Warning";

import File from "../util/File";

import makeStyles from "@mui/styles/makeStyles";
import { green, blue } from "@mui/material/colors";

const useStyles = makeStyles((theme) => ({
  input: {
    width: 200,
  },
  warning: {
    color: theme.palette.warning.main,
  },
}));

const GameNav = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { game } = useGame();
  const location = useLocation();

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

  const hasVariation = is(Array, game.map);

  return (
    <>
      <List>
        <ListItemButton component={RouterLink} to={`/games/${game.meta.slug}/`}>
          <ListItemIcon>
            <GameIcon />
          </ListItemIcon>
          <ListItemText
            primary={game.info.title}
            secondary={`${t("game.by")} ${game.info.designer}`}
          />
        </ListItemButton>
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
        <File data={game} filename={`${game.meta.id}.json`} list />
        {game.prototype && (
          <ListItemButton>
            <ListItemIcon>
              <WarningIcon style={{ color: blue[500] }} />
            </ListItemIcon>
            <ListItemText
              primary={t("prototype.prototype")}
              secondary={t("prototype.description")}
            />
          </ListItemButton>
        )}
        {game.wip && (
          <ListItemButton>
            <ListItemIcon>
              <WarningIcon className={classes.warning} />
            </ListItemIcon>
            <ListItemText
              primary={t("wip.wip")}
              secondary={t("wip.description")}
            />
          </ListItemButton>
        )}
      </List>
      <Divider />
      <RouterSwitch>
        <Route path="/games/:slug" exact />
        <Route>
          <List>
            <RouterSwitch>
              <Route path="/games/:slug/revenue">
                <ListItemButton>
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
                </ListItemButton>
              </Route>
              <Route path="/games/:slug/par">
                <ListItemButton>
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
                </ListItemButton>
              </Route>
              <Route path="/games/:slug/market">
                <ListItemButton>
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
                </ListItemButton>
              </Route>
              <Route path="/games/:slug/map">
                <ListItemButton>
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
                </ListItemButton>
                {hasVariation && (
                  <ListItemButton>
                    <FormControl className={classes.input} variant="filled">
                      <InputLabel id="variation-label">
                        {t("game.map.variation")}
                      </InputLabel>
                      <Select
                        variant="standard"
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
                  </ListItemButton>
                )}
              </Route>
              <Route path="/games/:slug/cards">
                <ListItemButton>
                  <FormControl variant="standard" component="fieldset">
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
                </ListItemButton>
              </Route>
            </RouterSwitch>
          </List>
          <Divider />
        </Route>
      </RouterSwitch>
      <List>
        <ListItemButton
          selected={
            !!matchPath(location.pathname, { path: "/games/:slug/background" })
          }
          component={RouterLink}
          to={`/games/${game.meta.slug}/background`}
        >
          <ListItemText>Background</ListItemText>
        </ListItemButton>
        <ListItemButton
          selected={
            !!matchPath(location.pathname, { path: "/games/:slug/cards" })
          }
          component={RouterLink}
          to={`/games/${game.meta.slug}/cards`}
        >
          <ListItemText>Cards</ListItemText>
        </ListItemButton>
        <ListItemButton
          disabled={!game.companies}
          selected={
            !!matchPath(location.pathname, { path: "/games/:slug/charters" })
          }
          component={RouterLink}
          to={`/games/${game.meta.slug}/charters`}
        >
          <ListItemText>Charters</ListItemText>
        </ListItemButton>
        <ListItemButton
          disabled={!game.map}
          selected={
            !!matchPath(location.pathname, { path: "/games/:slug/map" })
          }
          component={RouterLink}
          to={`/games/${game.meta.slug}/map`}
        >
          <ListItemText>Map</ListItemText>
        </ListItemButton>
        <ListItemButton
          disabled={!game.stock || !game.stock.market}
          selected={
            !!matchPath(location.pathname, { path: "/games/:slug/market" })
          }
          component={RouterLink}
          to={`/games/${game.meta.slug}/market`}
        >
          <ListItemText primary="Market" />
        </ListItemButton>
        <ListItemButton
          disabled={!game.stock || !game.stock.par || !game.stock.par.values}
          selected={
            !!matchPath(location.pathname, { path: "/games/:slug/par" })
          }
          component={RouterLink}
          to={`/games/${game.meta.slug}/par`}
        >
          <ListItemText primary="Par" />
        </ListItemButton>
        <ListItemButton
          selected={
            !!matchPath(location.pathname, { path: "/games/:slug/revenue" })
          }
          component={RouterLink}
          to={`/games/${game.meta.slug}/revenue`}
        >
          <ListItemText primary="Revenue" />
        </ListItemButton>
        <ListItemButton
          disabled={!game.tiles}
          selected={
            !!matchPath(location.pathname, {
              path: "/games/:slug/tile-manifest",
            })
          }
          component={RouterLink}
          to={`/games/${game.meta.slug}/tile-manifest`}
        >
          <ListItemText primary="Tile Manifest" />
        </ListItemButton>
        <ListItemButton
          disabled={!game.tiles}
          selected={
            !!matchPath(location.pathname, { path: "/games/:slug/tiles" })
          }
          component={RouterLink}
          to={`/games/${game.meta.slug}/tiles`}
        >
          <ListItemText primary="Tiles" />
        </ListItemButton>
        <ListItemButton
          disabled={!game.companies && !game.tokens}
          selected={
            !!matchPath(location.pathname, { path: "/games/:slug/tokens" })
          }
          component={RouterLink}
          to={`/games/${game.meta.slug}/tokens`}
        >
          <ListItemText primary="Tokens" />
        </ListItemButton>
      </List>
    </>
  );
};

export default GameNav;
